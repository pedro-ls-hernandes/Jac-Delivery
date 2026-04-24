const express = require('express');
const entregaController = require('../controllers/entregaController');
const { authMiddleware, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', authorize('admin', 'vendedor', 'entregador'), entregaController.listarEntregas);
router.get('/fila/:entregadorId', authorize('admin', 'entregador'), entregaController.listarFilaDoEntregador);
router.get('/:id', authorize('admin', 'vendedor', 'entregador'), entregaController.buscarEntregaPorId);
router.post('/', authorize('admin', 'vendedor'), entregaController.criarEntrega);
router.put('/:id', authorize('admin', 'vendedor'), entregaController.atualizarEntrega);
router.post('/:id/coletar', authorize('admin', 'entregador'), entregaController.coletarEntrega);
router.post('/:id/entregar', authorize('admin', 'entregador'), entregaController.marcarComoEntregue);
router.post('/:id/confirmar', authorize('admin'), entregaController.confirmarEntrega);
router.post('/:id/cancelar', authorize('admin'), entregaController.cancelarEntrega);
router.put('/fila/:entregadorId/ordem', authorize('admin', 'entregador'), entregaController.reordenarFilaEntregador);

module.exports = router;