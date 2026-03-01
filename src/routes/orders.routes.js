
const express = require('express');
const pool = require('../config/db');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');
const AppError = require('../utils/AppError');

const router = express.Router();

router.post('/', requireAuth, [
  body('items').isArray({ min: 1 }),
  body('items.*.product_id').isInt({ min: 1 }),
  body('items.*.quantity').isInt({ min: 1 })
], validate, async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const { items } = req.body;
    await conn.beginTransaction();

    const ids = items.map(i => i.product_id);
    const [products] = await conn.query(
      `SELECT id, price, stock FROM products WHERE id IN (${ids.map(()=>'?').join(',')})`,
      ids
    );
    const map = new Map(products.map(p => [p.id, p]));

    let total = 0;
    for (const it of items) {
      const p = map.get(it.product_id);
      if (!p) throw new AppError(`Producto ${it.product_id} no existe`, 400);
      if (p.stock < it.quantity) throw new AppError(`Stock insuficiente para producto ${it.product_id}`, 400);
      total += Number(p.price) * it.quantity;
    }

    const [orderRes] = await conn.query('INSERT INTO orders (user_id, total) VALUES (?, ?)', [req.user.id, total]);
    const orderId = orderRes.insertId;

    for (const it of items) {
      const p = map.get(it.product_id);
      await conn.query(
        'INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)',
        [orderId, it.product_id, it.quantity, p.price]
      );
      await conn.query('UPDATE products SET stock = stock - ? WHERE id=?', [it.quantity, it.product_id]);
    }

    await conn.commit();
    res.status(201).json({ order_id: orderId, total, items });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
});

module.exports = router;
