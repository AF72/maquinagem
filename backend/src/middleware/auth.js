const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'maquinagest_drawmech_2026_secret';

function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ erro: 'Token em falta' });
  }

  try {
    const token = header.split(' ')[1];
    req.utilizador = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ erro: 'Token inválido ou expirado' });
  }
}

module.exports = auth;
