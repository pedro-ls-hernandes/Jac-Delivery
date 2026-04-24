const express = require('express');
const adminController = require('../controllers/adminController');
const { authMiddleware, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authMiddleware);
router.use(authorize('admin'));

router.get('/', adminController.listarAdmins);
router.get('/:id', adminController.buscarAdminPorId);
router.post('/', adminController.criarAdmin);
router.put('/:id', adminController.atualizarAdmin);
router.delete('/:id', adminController.excluirAdmin);

module.exports = router;