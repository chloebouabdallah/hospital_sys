const { validateAndNormalize } = require('../services/checker.service');

// ---- POST /symptom-checker/submit (any logged-in role) ----
// Day 3: validates + normalizes the submission and echoes it back.
// Day 4 will pass `result.normalized` into the rule-matching engine.
async function submit(req, res) {
  try {
    const result = await validateAndNormalize(req.body);

    if (!result.ok) {
      const body = { error: result.error };
      if (result.details) body.details = result.details;
      return res.status(result.status).json(body);
    }

    return res.status(200).json({ submission: result.normalized });
  } catch (err) {
    console.error('submit error:', err);
    return res.status(500).json({ error: 'Something went wrong.' });
  }
}

module.exports = { submit };