const { pool } = require('../config/db');

exports.listInventory = async (req, res) => {
  try {
    const [inventory] = await pool.query('SELECT * FROM inventory ORDER BY date_added DESC');
    res.render('inventory/index', { user: req.session.user, inventory });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Inventory listing error', user: req.session.user });
  }
};

exports.createItem = async (req, res) => {
  try {
    const { item_name, category, quantity, unit_price, supplier, date_added } = req.body;
    await pool.query(
      'INSERT INTO inventory (item_name, category, quantity, unit_price, supplier, date_added) VALUES (?, ?, ?, ?, ?, ?)',
      [item_name, category, quantity, unit_price, supplier, date_added]
    );
    res.redirect('/inventory');
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Inventory create error', user: req.session.user });
  }
};
