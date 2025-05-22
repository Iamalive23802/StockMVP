const pool = require('../db');

const getTeams = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.*, l.name AS location_name
      FROM teams t
      LEFT JOIN locations l ON t.location_id = l.id
      ORDER BY t.name
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
};

const addTeam = async (req, res) => {
  const { name, location_id } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO teams (name, location_id) VALUES ($1, $2) RETURNING *',
      [name, location_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add team' });
  }
};

const deleteTeam = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM teams WHERE id = $1', [id]);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete team' });
  }
};

module.exports = {
  getTeams,
  addTeam,
  deleteTeam
};
