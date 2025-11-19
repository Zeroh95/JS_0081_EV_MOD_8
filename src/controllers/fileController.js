

const path = require('path');
const fs = require('fs');

// Base de datos simulada de archivos
let files = [];

/**
 * Subir archivo
 * POST /api/files/upload
 */
const uploadFile = async (req, res) => {
  try {
    // Validar que exista archivo
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({
        error: 'No se proporcionó archivo',
        message: 'Debes enviar un archivo en el formulario'
      });
    }

    const uploadedFile = req.files.file;
    const userId = req.user.id;

    // Validar tipos de archivo permitidos
    const allowedExtensions = ['.pdf', '.doc', '.docx', '.txt', '.jpg', '.jpeg', '.png', '.gif', '.zip'];
    const fileExtension = path.extname(uploadedFile.name).toLowerCase();

    if (!allowedExtensions.includes(fileExtension)) {
      return res.status(400).json({
        error: 'Tipo de archivo no permitido',
        message: `Extensiones permitidas: ${allowedExtensions.join(', ')}`
      });
    }

    // Validar tamaño del archivo (máximo 50MB)
    const maxSize = 50 * 1024 * 1024;
    if (uploadedFile.size > maxSize) {
      return res.status(413).json({
        error: 'Archivo muy grande',
        message: `El tamaño máximo permitido es 50MB. Tu archivo pesa ${(uploadedFile.size / 1024 / 1024).toFixed(2)}MB`
      });
    }

    // Crear directorio de uploads si no existe
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Generar nombre único para el archivo
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const fileName = `${timestamp}_${randomString}_${uploadedFile.name}`;
    const filePath = path.join(uploadDir, fileName);

    // Mover archivo
    await uploadedFile.mv(filePath);

    // Guardar información del archivo
    const fileInfo = {
      id: files.length + 1,
      userId,
      originalName: uploadedFile.name,
      fileName: fileName,
      mimeType: uploadedFile.mimetype,
      size: uploadedFile.size,
      path: `/uploads/${fileName}`,
      uploadedAt: new Date()
    };

    files.push(fileInfo);

    res.status(201).json({
      message: 'Archivo subido exitosamente',
      file: {
        id: fileInfo.id,
        originalName: fileInfo.originalName,
        fileName: fileInfo.fileName,
        size: fileInfo.size,
        url: fileInfo.path,
        uploadedAt: fileInfo.uploadedAt
      }
    });

  } catch (error) {
    res.status(500).json({
      error: 'Error al subir archivo',
      message: error.message
    });
  }
};

/**
 * Obtener todos los archivos del usuario
 * GET /api/files
 */
const getUserFiles = (req, res) => {
  try {
    const userId = req.user.id;

    // Filtrar archivos del usuario actual
    const userFiles = files.filter(f => f.userId === userId);

    res.status(200).json({
      message: 'Archivos obtenidos exitosamente',
      count: userFiles.length,
      files: userFiles.map(f => ({
        id: f.id,
        originalName: f.originalName,
        fileName: f.fileName,
        size: f.size,
        url: f.path,
        uploadedAt: f.uploadedAt
      }))
    });

  } catch (error) {
    res.status(500).json({
      error: 'Error al obtener archivos',
      message: error.message
    });
  }
};

/**
 * Obtener detalle de un archivo específico
 * GET /api/files/:fileId
 */
const getFileDetail = (req, res) => {
  try {
    const { fileId } = req.params;
    const userId = req.user.id;

    const file = files.find(f => f.id === parseInt(fileId));

    if (!file) {
      return res.status(404).json({
        error: 'Archivo no encontrado',
        message: 'El archivo solicitado no existe'
      });
    }

    // Verificar que el archivo pertenezca al usuario
    if (file.userId !== userId) {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'No tienes permiso para acceder a este archivo'
      });
    }

    res.status(200).json({
      message: 'Detalle del archivo obtenido',
      file: {
        id: file.id,
        originalName: file.originalName,
        fileName: file.fileName,
        mimeType: file.mimeType,
        size: file.size,
        url: file.path,
        uploadedAt: file.uploadedAt
      }
    });

  } catch (error) {
    res.status(500).json({
      error: 'Error al obtener detalle del archivo',
      message: error.message
    });
  }
};

/**
 * Descargar archivo
 * GET /api/files/download/:fileId
 */
const downloadFile = (req, res) => {
  try {
    const { fileId } = req.params;
    const userId = req.user.id;

    const file = files.find(f => f.id === parseInt(fileId));

    if (!file) {
      return res.status(404).json({
        error: 'Archivo no encontrado',
        message: 'El archivo solicitado no existe'
      });
    }

    // Verificar que el archivo pertenezca al usuario
    if (file.userId !== userId) {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'No tienes permiso para descargar este archivo'
      });
    }

    const filePath = path.join(__dirname, '../../uploads', file.fileName);

    // Verificar que el archivo existe
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        error: 'Archivo no encontrado en el servidor',
        message: 'El archivo fue eliminado'
      });
    }

    // Descargar archivo
    res.download(filePath, file.originalName);

  } catch (error) {
    res.status(500).json({
      error: 'Error al descargar archivo',
      message: error.message
    });
  }
};

/**
 * Eliminar archivo
 * DELETE /api/files/:fileId
 */
const deleteFile = (req, res) => {
  try {
    const { fileId } = req.params;
    const userId = req.user.id;

    const fileIndex = files.findIndex(f => f.id === parseInt(fileId));

    if (fileIndex === -1) {
      return res.status(404).json({
        error: 'Archivo no encontrado',
        message: 'El archivo solicitado no existe'
      });
    }

    const file = files[fileIndex];

    // Verificar que el archivo pertenezca al usuario
    if (file.userId !== userId) {
      return res.status(403).json({
        error: 'Acceso denegado',
        message: 'No tienes permiso para eliminar este archivo'
      });
    }

    // Eliminar archivo del sistema
    const filePath = path.join(__dirname, '../../uploads', file.fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Eliminar registro de la base de datos
    files.splice(fileIndex, 1);

    res.status(200).json({
      message: 'Archivo eliminado exitosamente',
      fileId: parseInt(fileId)
    });

  } catch (error) {
    res.status(500).json({
      error: 'Error al eliminar archivo',
      message: error.message
    });
  }
};

module.exports = {
  uploadFile,
  getUserFiles,
  getFileDetail,
  downloadFile,
  deleteFile
};