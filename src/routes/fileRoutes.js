

const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const {
  uploadFile,
  getUserFiles,
  getFileDetail,
  downloadFile,
  deleteFile
} = require('../controllers/fileController');

/**
 * POST /api/files/upload
 * Subir un archivo
 * Headers: Authorization: Bearer <token>
 * Body: FormData con campo 'file'
 */
router.post('/upload', verifyToken, uploadFile);

/**
 * GET /api/files
 * Obtener todos los archivos del usuario autenticado
 * Headers: Authorization: Bearer <token>
 */
router.get('/', verifyToken, getUserFiles);

/**
 * GET /api/files/:fileId
 * Obtener detalle de un archivo específico
 * Headers: Authorization: Bearer <token>
 */
router.get('/:fileId', verifyToken, getFileDetail);

/**
 * GET /api/files/download/:fileId
 * Descargar un archivo
 * Headers: Authorization: Bearer <token>
 */
router.get('/download/:fileId', verifyToken, downloadFile);

/**
 * DELETE /api/files/:fileId
 * Eliminar un archivo
 * Headers: Authorization: Bearer <token>
 */
router.delete('/:fileId', verifyToken, deleteFile);

module.exports = router;