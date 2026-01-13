const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your-secret-key-change-in-production';

function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token manquant' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET);

    req.userId = decoded.userId;
    req.clubId = decoded.clubId;
    req.userRole = decoded.role;

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token invalide' });
  }
}

module.exports = { authenticate };
