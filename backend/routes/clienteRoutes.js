const express = require('express');
const clienteController = require('../controllers/clienteController');
const { authMiddleware, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authMiddleware);
router.use(authorize('admin'));

router.get('/', clienteController.listarClientes);
router.get('/telefone/:telefone', clienteController.buscarClientePorTelefone);
router.get('/:id', clienteController.buscarClientePorId);
router.post('/', clienteController.criarCliente);
router.put('/:id', clienteController.atualizarCliente);
router.delete('/:id', clienteController.excluirCliente);

module.exports = router;