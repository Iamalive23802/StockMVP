const pool = require('../db');

const getLocations = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM locations ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
};

const addLocation = async (req, res) => {
  const { name } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO locations (name) VALUES ($1) RETURNING *',
      [name]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add location' });
  }
};

const deleteLocation = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM locations WHERE id = $1', [id]);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete location' });
  }
};

module.exports = {
  getLocations,
  addLocation,
  deleteLocation
};
