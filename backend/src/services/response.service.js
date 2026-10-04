const prisma = require('../lib/prisma');
const { DISCLAIMER } = require('../config/disclaimer');

// Turns the engine's raw result (ids only) into the full response the results screen renders.
//
// Rules for assembly:
//  - urgencyLevel         = the primary (winning) rule's urgency
//  - recommendedSpecialty = the primary rule's specialty; if that rule has none, the
//                           specialty of the first matched condition that has one
//  - conditions           = union of matchedConditionIds across ALL matching rules, de-duplicated,
//                           ordered by rule rank (best rule first), then by the order in the rule
//  - articles             = MedicalArticles attached under the condition they belong to
//
// Day 6 will replace the "nothing matched" branch with a proper fallback.
async function buildTriageResponse(triage) {
  const { primary, matches } = triage;

  if (!primary) {
    return {
      matched: false,
      urgencyLevel: null,
      recommendedSpecialty: null,
      conditions: [],
      disclaimer: DISCLAIMER,
    };
  }

  const conditionIds = [...new Set(matches.flatMap((m) => m.matchedConditionIds))];

  // Separate queries (no nested includes) so this doesn't depend on relation names in schema.prisma.
  const [conditionRows, articleRows] = conditionIds.length
    ? await Promise.all([
        prisma.condition.findMany({
          where: { id: { in: conditionIds } },
          select: {
            id: true,
            name: true,
            description: true,
            causes: true,
            whenToSeekCare: true,
            specialtyId: true,
          },
        }),
        prisma.medicalArticle.findMany({
          where: { conditionId: { in: conditionIds } },
          select: { id: true, conditionId: true, title: true, content: true, source: true },
          orderBy: { id: 'asc' },
        }),
      ])
    : [[], []];

  const articlesByCondition = new Map();
  for (const a of articleRows) {
    if (!articlesByCondition.has(a.conditionId)) articlesByCondition.set(a.conditionId, []);
    articlesByCondition.get(a.conditionId).push({
      id: a.id,
      title: a.title,
      content: a.content,
      source: a.source,
    });
  }

  const conditionById = new Map(conditionRows.map((c) => [c.id, c]));

  // Keep rule-rank order; silently skip ids that no longer exist.
  const orderedConditions = conditionIds.map((id) => conditionById.get(id)).filter(Boolean);

  const conditions = orderedConditions.map((c) => ({
    id: c.id,
    name: c.name,
    description: c.description,
    causes: c.causes,
    whenToSeekCare: c.whenToSeekCare,
    articles: articlesByCondition.get(c.id) || [],
  }));

  const specialtyId =
    primary.recommendedSpecialtyId ??
    orderedConditions.find((c) => c.specialtyId != null)?.specialtyId ??
    null;

  const recommendedSpecialty = specialtyId
    ? await prisma.specialty.findUnique({
        where: { id: specialtyId },
        select: { id: true, name: true, description: true },
      })
    : null;

  return {
    matched: true,
    urgencyLevel: primary.urgencyLevel,
    recommendedSpecialty,
    conditions,
    disclaimer: DISCLAIMER,
  };
}

module.exports = { buildTriageResponse };