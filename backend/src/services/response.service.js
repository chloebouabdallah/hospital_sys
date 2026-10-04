const prisma = require('../lib/prisma');
const { DISCLAIMER } = require('../config/disclaimer');
const {
  FALLBACK_URGENCY,
  FALLBACK_SPECIALTY_NAME,
  FALLBACK_MESSAGE,
} = require('../config/fallback');

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
// If NO rule matched, a cautious fallback is returned instead (see config/fallback.js):
// matched:false, moderate urgency, a general practitioner, and an explanatory message.
//
// `incomplete` is true when the patient skipped some questions, so the UI can nudge them
// to answer everything for a more accurate result.
async function buildTriageResponse(triage, normalized) {
  const { primary, matches } = triage;
  const incomplete = (normalized?.unansweredQuestionIds?.length || 0) > 0;

  if (!primary) {
    const fallbackSpecialty = await prisma.specialty.findUnique({
      where: { name: FALLBACK_SPECIALTY_NAME },
      select: { id: true, name: true, description: true },
    });

    return {
      matched: false,
      urgencyLevel: FALLBACK_URGENCY,
      recommendedSpecialty: fallbackSpecialty,
      conditions: [],
      message: FALLBACK_MESSAGE,
      incomplete,
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
    message: null,
    incomplete,
    disclaimer: DISCLAIMER,
  };
}

module.exports = { buildTriageResponse };