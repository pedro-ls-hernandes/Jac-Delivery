const express = require('express');
const entregadorController = require('../controllers/entregadorController');
const { authMiddleware, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', authorize('admin'), entregadorController.listarEntregadores);
router.get('/:id', authorize('admin'), entregadorController.buscarEntregadorPorId);
router.post('/', authorize('admin'), entregadorController.criarEntregador);
router.put('/:id', authorize('admin'), entregadorController.atualizarEntregador);
router.patch('/:id/status', authorize('admin'), entregadorController.alterarStatusEntregador);
router.delete('/:id', authorize('admin'), entregadorController.excluirEntregador);

module.exports = router;