const { validateAndNormalize } = require('../services/checker.service');
const { runTriage } = require('../services/triage.service');

// ---- POST /symptom-checker/submit (any logged-in role) ----
// Day 3: validates + normalizes the submission.
// Day 4: runs the rule-matching engine and returns the raw match result (ids only).
// Day 5 will turn `triage` into the full response (conditions, specialty, articles...).
async function submit(req, res) {
  try {
    const result = await validateAndNormalize(req.body);

    if (!result.ok) {
      const body = { error: result.error };
      if (result.details) body.details = result.details;
      return res.status(result.status).json(body);
    }

    const triage = await runTriage(result.normalized);

    return res.status(200).json({ submission: result.normalized, triage });
  } catch (err) {
    console.error('submit error:', err);
    return res.status(500).json({ error: 'Something went wrong.' });
  }
}

module.exports = { submit };