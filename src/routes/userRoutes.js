

const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const {
  register,
  login,
  getProfile,
  getAllUsers
} = require('../controllers/userController');

/**
 * POST /api/users/register
 * Registrar un nuevo usuario
 * Body: { name, email, password }
 */
router.post('/register', register);

/**
 * POST /api/users/login
 * Login de usuario
 * Body: { email, password }
 */
router.post('/login', login);

/**
 * GET /api/users/profile
 * Obtener perfil del usuario autenticado
 * Headers: Authorization: Bearer <token>
 */
router.get('/profile', verifyToken, getProfile);

/**
 * GET /api/users
 * Obtener todos los usuarios
 */
router.get('/', getAllUsers);

module.exports = router;