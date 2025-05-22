const pool = require('../db');
const multer = require('multer');
const Papa = require('papaparse');

const upload = multer({ storage: multer.memoryStorage() });

const getLeads = async (req, res) => {
  const { role, user_id } = req.query;

  try {
    let result;

    if (role === 'relationship_mgr') {
      result = await pool.query(
        `SELECT l.*, loc.name AS location_name
         FROM leads l
         LEFT JOIN locations loc ON l.location_id = loc.id
         WHERE l.assigned_to = $1
         ORDER BY l.created_at DESC`,
        [user_id]
      );
    } else if (role === 'admin') {
      const locationResult = await pool.query(
        `SELECT location_id FROM users WHERE id = $1`,
        [user_id]
      );
      const location_id = locationResult.rows[0]?.location_id;

      result = await pool.query(
        `SELECT l.*, u.display_name AS assigned_user_name, u.role AS assigned_user_role, loc.name AS location_name
         FROM leads l
         LEFT JOIN users u ON l.assigned_to = u.id
         LEFT JOIN locations loc ON l.location_id = loc.id
         WHERE l.location_id = $1
         ORDER BY l.created_at DESC`,
        [location_id]
      );
    } else {
      // super_admin and others
      result = await pool.query(
        `SELECT l.*, u.display_name AS assigned_user_name, u.role AS assigned_user_role, loc.name AS location_name
         FROM leads l
         LEFT JOIN users u ON l.assigned_to = u.id
         LEFT JOIN locations loc ON l.location_id = loc.id
         ORDER BY l.created_at DESC`
      );
    }

    res.json(result.rows);
  } catch (err) {
    console.error('❌ Failed to fetch leads:', err.message);
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
};

const addLead = async (req, res) => {
  const { fullName, email, phone, notes, location_id } = req.body;

  if (!fullName || !email) {
    return res.status(400).json({ error: 'Full name and email are required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO leads (full_name, email, phone, notes, status, location_id)
       VALUES ($1, $2, $3, $4, 'New', $5)
       RETURNING *`,
      [fullName, email, phone || null, notes || '', location_id || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('❌ Failed to add lead:', err.message);
    res.status(500).json({ error: 'Failed to add lead' });
  }
};

const updateLead = async (req, res) => {
  const { id } = req.params;
  const {
    fullName,
    email,
    phone,
    notes,
    status,
    team_id,
    assigned_to,
    location_id
  } = req.body;

  if (!fullName || !email || !status) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const result = await pool.query(
      `UPDATE leads
       SET full_name = $1, email = $2, phone = $3, notes = $4, status = $5,
           team_id = $6, assigned_to = $7, location_id = $8
       WHERE id = $9 RETURNING *`,
      [fullName, email, phone || null, notes || '', status, team_id || null, assigned_to || null, location_id || null, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('❌ Failed to update lead:', err.message);
    res.status(500).json({ error: 'Failed to update lead' });
  }
};

const assignLead = async (req, res) => {
  const { id } = req.params;
  const { assigned_to } = req.body;

  if (!assigned_to) {
    return res.status(400).json({ error: 'Missing assigned_to value' });
  }

  try {
    const result = await pool.query(
      `UPDATE leads
       SET assigned_to = $1
       WHERE id = $2
       RETURNING *`,
      [assigned_to, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    res.json({ message: 'Lead assigned successfully', lead: result.rows[0] });
  } catch (err) {
    console.error('❌ Failed to assign lead:', err.message);
    res.status(500).json({ error: 'Failed to assign lead' });
  }
};

const deleteLead = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM leads WHERE id = $1', [id]);
    res.status(204).end();
  } catch (err) {
    console.error('❌ Failed to delete lead:', err.message);
    res.status(500).json({ error: 'Failed to delete lead' });
  }
};

const uploadLeads = [
  upload.single('file'),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const csvData = req.file.buffer.toString('utf-8');
    const { data } = Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
    });

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const row of data) {
        const {
          fullName,
          email,
          phone,
          notes,
          location_id
        } = row;

        if (!fullName || !email) continue;

        await client.query(
          `INSERT INTO leads (full_name, email, phone, notes, status, location_id)
           VALUES ($1, $2, $3, $4, 'New', $5)`,
          [fullName, email, phone || null, notes || '', location_id || null]
        );
      }
      await client.query('COMMIT');
      res.status(201).json({ message: 'Leads uploaded successfully' });
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('❌ Failed to upload leads:', err.message);
      res.status(500).json({ error: 'Failed to upload leads' });
    } finally {
      client.release();
    }
  }
];

module.exports = {
  getLeads,
  addLead,
  updateLead,
  deleteLead,
  uploadLeads,
  assignLead
};
