// using for validation
const { validationResult } = require("express-validator");

// decorator to catch validation errors and provide try-catch cb call
async function SafeRun(req, res, callback) {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  try {
    await callback(req, res);
  } catch (e) {
    console.error(e);
    res.status(400).json(e);
  }
}

module.exports = SafeRun;
