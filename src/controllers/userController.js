const bcrypt = require('bcryptjs');
const { generateToken } = require('../middleware/authMiddleware');

// Base de datos simulada (en producción usar base de datos real)
let users = [];

/**
 * Registrar un nuevo usuario
 * POST /api/users/register
 */
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validar campos requeridos
    if (!name || !email || !password) {
      return res.status(400).json({
        error: 'Campos requeridos',
        message: 'Nombre, email y contraseña son obligatorios'
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Email inválido',
        message: 'Por favor, proporciona un email válido'
      });
    }

    // Verificar si el usuario ya existe
    const userExists = users.find(u => u.email === email);
    if (userExists) {
      return res.status(409).json({
        error: 'Usuario ya existe',
        message: 'El email ya está registrado'
      });
    }

    // Validar longitud de contraseña
    if (password.length < 6) {
      return res.status(400).json({
        error: 'Contraseña débil',
        message: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear nuevo usuario
    const newUser = {
      id: users.length + 1,
      name,
      email,
      password: hashedPassword,
      createdAt: new Date()
    };

    users.push(newUser);

    // Generar JWT
    const token = generateToken({
      id: newUser.id,
      email: newUser.email,
      name: newUser.name
    });

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email
      },
      token
    });

  } catch (error) {
    res.status(500).json({
      error: 'Error al registrar usuario',
      message: error.message
    });
  }
};

/**
 * Login de usuario
 * POST /api/users/login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar campos requeridos
    if (!email || !password) {
      return res.status(400).json({
        error: 'Campos requeridos',
        message: 'Email y contraseña son obligatorios'
      });
    }

    // Buscar usuario por email
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({
        error: 'Credenciales inválidas',
        message: 'Email o contraseña incorrectos'
      });
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Credenciales inválidas',
        message: 'Email o contraseña incorrectos'
      });
    }

    // Generar JWT
    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name
    });

    res.status(200).json({
      message: 'Login exitoso',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      token
    });

  } catch (error) {
    res.status(500).json({
      error: 'Error al iniciar sesión',
      message: error.message
    });
  }
};

/**
 * Obtener perfil del usuario autenticado
 * GET /api/users/profile
 */
const getProfile = (req, res) => {
  try {
    const user = users.find(u => u.id === req.user.id);

    if (!user) {
      return res.status(404).json({
        error: 'Usuario no encontrado',
        message: 'El usuario no existe'
      });
    }

    res.status(200).json({
      message: 'Perfil obtenido exitosamente',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    res.status(500).json({
      error: 'Error al obtener perfil',
      message: error.message
    });
  }
};

/**
 * Obtener todos los usuarios (solo admin)
 * GET /api/users
 */
const getAllUsers = (req, res) => {
  try {
    const usersList = users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      createdAt: u.createdAt
    }));

    res.status(200).json({
      message: 'Usuarios obtenidos exitosamente',
      count: usersList.length,
      users: usersList
    });

  } catch (error) {
    res.status(500).json({
      error: 'Error al obtener usuarios',
      message: error.message
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  getAllUsers
};