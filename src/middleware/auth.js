
const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');

function requireAuth(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return next(new AppError('No autorizado', 401));

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    return next();
  } catch (err) {
    return next(err);
  }
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) return next(new AppError('No autorizado', 401));
    if (req.user.role !== role) return next(new AppError('Prohibido', 403));
    next();
  };
}

module.exports = { requireAuth, requireRole };
