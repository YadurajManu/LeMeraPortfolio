const jwt = require('jsonwebtoken');

// Simple JWT-based auth for serverless compatibility
const JWT_SECRET = process.env.SESSION_SECRET || 'admin-panel-secret-change-this';

function generateToken(adminData) {
  return jwt.sign(
    { 
      adminId: adminData.id, 
      username: adminData.username,
      email: adminData.email 
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

function setAuthCookie(res, token) {
  res.cookie('admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  });
}

function clearAuthCookie(res) {
  res.clearCookie('admin_token');
}

function requireAuth(req, res, next) {
  const token = req.cookies.admin_token;
  
  if (!token) {
    console.log('❌ No auth token found');
    return res.redirect('/login');
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    console.log('❌ Invalid auth token');
    clearAuthCookie(res);
    return res.redirect('/login');
  }

  // Add admin data to request
  req.admin = decoded;
  console.log('✅ Auth passed for:', decoded.username);
  next();
}

module.exports = {
  generateToken,
  verifyToken,
  setAuthCookie,
  clearAuthCookie,
  requireAuth
}; 