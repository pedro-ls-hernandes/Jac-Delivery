const express = require('express');
const adminController = require('../controllers/adminController');
const { authMiddleware, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

// Permitir criar o primeiro admin sem autenticação
router.post('/', adminController.criarAdmin);

// Aplicar autenticação e autorização para as outras rotas
router.use(authMiddleware);
router.use(authorize('admin'));

router.get('/', adminController.listarAdmins);
router.get('/:id', adminController.buscarAdminPorId);
router.put('/:id', adminController.atualizarAdmin);
router.delete('/:id', adminController.excluirAdmin);

module.exports = router;