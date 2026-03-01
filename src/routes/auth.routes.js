
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const AppError = require('../utils/AppError');

const router = express.Router();

router.post('/register', [
  body('name').isString().isLength({ min: 2 }).withMessage('Nombre inválido'),
  body('email').isEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('Password min 6'),
  body('role').optional().isIn(['admin','client'])
], validate, async (req, res, next) => {
  try {
    const { name, email, password, role = 'client' } = req.body;
    const [exists] = await pool.query('SELECT id FROM users WHERE email=?', [email]);
    if (exists.length) throw new AppError('Email ya registrado', 409);

    const password_hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [name, email, password_hash, role]
    );

    return res.status(201).json({ id: result.insertId, name, email, role });
  } catch (err) { next(err); }
});

router.post('/login', [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').isString().withMessage('Password requerido')
], validate, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const [rows] = await pool.query('SELECT * FROM users WHERE email=? LIMIT 1', [email]);
    if (!rows.length) throw new AppError('Credenciales inválidas', 401);

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) throw new AppError('Credenciales inválidas', 401);

    const token = jwt.sign({ id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES || '1h' }
    );

    res.json({ token, user: { id: user.id, name: user.name, role: user.role, email: user.email } });
  } catch (err) { next(err); }
});

module.exports = router;
