
// Middleware de autenticação
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const token = req.headers['x-access-token'] || req.headers['authorization'];
  
  if (!token) {
    return res.status(403).send({
      message: "Nenhum token fornecido!"
    });
  }

  // Remove 'Bearer ' do token se existir
  const tokenValue = token.startsWith('Bearer ') ? token.slice(7) : token;
  
  try {
    const decoded = jwt.verify(tokenValue, process.env.JWT_SECRET || 'sua_chave_secreta');
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    return res.status(401).send({
      message: "Não autorizado!"
    });
  }
};

const isAdmin = (req, res, next) => {
  if (req.userRole === 'admin') {
    next();
  } else {
    res.status(403).send({
      message: "Requer privilégios de administrador!"
    });
  }
};

module.exports = {
  verifyToken,
  isAdmin
};
