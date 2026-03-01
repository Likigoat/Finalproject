
const { validationResult } = require('express-validator');

module.exports = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  const details = errors.array().map(e => ({ field: e.path, msg: e.msg, value: e.value }));
  const err = new Error('Validation error');
  err.type = 'validation';
  err.details = details;
  return next(err);
};
