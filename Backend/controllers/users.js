const pool = require('../db');

const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.*, l.name AS location_name, t.name AS team_name
      FROM users u
      LEFT JOIN locations l ON u.location_id = l.id
      LEFT JOIN teams t ON u.team_id = t.id
      ORDER BY u.display_name
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

const addUser = async (req, res) => {
  const {
    displayName,
    email,
    phoneNumber,
    password,
    role,
    status,
    location_id,
    team_id
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO users 
        (display_name, email, phone_number, password, role, status, location_id, team_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [displayName, email, phoneNumber, password, role, status, location_id, team_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add user' });
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const {
    displayName,
    email,
    phoneNumber,
    password,
    role,
    status,
    location_id,
    team_id
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE users SET 
        display_name = $1,
        email = $2,
        phone_number = $3,
        password = $4,
        role = $5,
        status = $6,
        location_id = $7,
        team_id = $8
       WHERE id = $9 RETURNING *`,
      [displayName, email, phoneNumber, password, role, status, location_id, team_id, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user' });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

module.exports = {
  getAllUsers,
  addUser,
  updateUser,
  deleteUser
};
