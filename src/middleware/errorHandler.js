
const AppError = require('../utils/AppError');

function normalizeSqlError(err) {
  if (!err || !err.code) return null;
  const map = {
    ER_DUP_ENTRY: { status: 409, message: 'Recurso duplicado (índice único).' },
    ER_NO_REFERENCED_ROW_2: { status: 400, message: 'Referencia no válida (FK).' }
  };
  return map[err.code] || null;
}

module.exports = (err, req, res, next) => {
  if (err && err.type === 'validation') {
    return res.status(422).json({
      error: 'VALIDATION_ERROR',
      message: 'Datos inválidos',
      details: err.details
    });
  }

  if (err && (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError')) {
    return res.status(401).json({
      error: 'AUTH_ERROR',
      message: err.name === 'TokenExpiredError' ? 'Token expirado' : 'Token inválido'
    });
  }

  const sql = normalizeSqlError(err);
  if (sql) {
    return res.status(sql.status).json({
      error: 'DB_ERROR',
      message: sql.message,
      details: err.sqlMessage || undefined
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode || 500).json({
      error: 'APP_ERROR',
      message: err.message,
      details: err.details || undefined
    });
  }

  console.error('[UNHANDLED ERROR]', err);
  return res.status(500).json({
    error: 'SERVER_ERROR',
    message: 'Ocurrió un error inesperado.'
  });
};
