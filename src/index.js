const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'ecommerce_jwt_secret_2024';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '24h';

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'authentication-service' }));

// Generate Token
app.post('/generate-token', (req, res) => {
  try {
    const { userId, email, role } = req.body;
    const token = jwt.sign({ userId, email, role }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
    res.json({ token, expiresIn: JWT_EXPIRY });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Verify Token
app.post('/verify-token', (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'Token required' });
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ valid: true, decoded });
  } catch (err) {
    res.status(401).json({ valid: false, error: 'Invalid or expired token' });
  }
});

// Validate Login (proxy to user-service)
app.post('/validate-login', async (req, res) => {
  try {
    const axios = require('axios');
    const USER_SERVICE = process.env.USER_SERVICE_URL || 'http://user-service:3001';
    const { email, password } = req.body;
    const response = await axios.post(`${USER_SERVICE}/login`, { email, password });
    const user = response.data.user;
    const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
    res.json({ message: 'Login successful', token, user });
  } catch (err) {
    const status = err.response?.status || 500;
    const error = err.response?.data?.error || err.message;
    res.status(status).json({ error });
  }
});

// Middleware endpoint - other services can call this to validate requests
app.post('/authenticate', (req, res) => {
  try {
    const authHeader = req.body.authorization || req.body.token;
    if (!authHeader) return res.status(401).json({ authenticated: false, error: 'No token provided' });
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ authenticated: true, user: decoded });
  } catch (err) {
    res.status(401).json({ authenticated: false, error: 'Invalid token' });
  }
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Authentication Service running on port ${PORT}`));
