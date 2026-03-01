
const express = require('express');
const pool = require('../config/db');
const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) { next(err); }
});

router.get('/:id', [param('id').isInt()], validate, async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products WHERE id=?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'No encontrado' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

router.post('/', requireAuth, requireRole('admin'), [
  body('name').isString().notEmpty(),
  body('price').isFloat({ gt: 0 }),
  body('stock').isInt({ min: 0 }),
  body('description').optional().isString(),
  body('image_url').optional().isURL()
], validate, async (req, res, next) => {
  try {
    const { name, description, price, stock, image_url } = req.body;
    const [result] = await pool.query(
      'INSERT INTO products (name, description, price, stock, image_url) VALUES (?, ?, ?, ?, ?)',
      [name, description || null, price, stock, image_url || null]
    );
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (err) { next(err); }
});

router.put('/:id', requireAuth, requireRole('admin'), [
  param('id').isInt(),
  body('name').optional().isString().notEmpty(),
  body('price').optional().isFloat({ gt: 0 }),
  body('stock').optional().isInt({ min: 0 }),
  body('description').optional().isString(),
  body('image_url').optional().isURL()
], validate, async (req, res, next) => {
  try {
    const fields = ['name','description','price','stock','image_url'];
    const updates = [];
    const values = [];

    fields.forEach(f => { if (req.body[f] !== undefined) { updates.push(`${f}=?`); values.push(req.body[f]); } });

    if (!updates.length) return res.status(400).json({ message: 'Nada que actualizar' });
    values.push(req.params.id);

    const [result] = await pool.query(`UPDATE products SET ${updates.join(', ')} WHERE id=?`, values);
    res.json({ updated: result.affectedRows > 0 });
  } catch (err) { next(err); }
});

router.delete('/:id', requireAuth, requireRole('admin'), [param('id').isInt()], validate, async (req, res, next) => {
  try {
    const [result] = await pool.query('DELETE FROM products WHERE id=?', [req.params.id]);
    res.json({ deleted: result.affectedRows > 0 });
  } catch (err) { next(err); }
});

module.exports = router;
