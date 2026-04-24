const express = require('express');
const vendedorController = require('../controllers/vendedorController');
const { authMiddleware, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', authorize('admin'), vendedorController.listarVendedores);
router.get('/:id', authorize('admin'), vendedorController.buscarVendedorPorId);
router.post('/', authorize('admin'), vendedorController.criarVendedor);
router.put('/:id', authorize('admin'), vendedorController.atualizarVendedor);
router.patch('/:id/status', authorize('admin'), vendedorController.alterarStatusVendedor);
router.delete('/:id', authorize('admin'), vendedorController.excluirVendedor);

module.exports = router;