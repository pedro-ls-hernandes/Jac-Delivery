const clienteService = require('../services/clienteService');

async function criarCliente(req, res, next) {
    try {
        const cliente = await clienteService.criarCliente(req.body);
        return res.status(201).json(cliente);
    } catch (error) {
        return next(error);
    }
}

async function listarClientes(req, res, next) {
    try {
        const clientes = await clienteService.listarClientes();
        return res.status(200).json(clientes);
    } catch (error) {
        return next(error);
    }
}

async function buscarClientePorId(req, res, next) {
    try {
        const cliente = await clienteService.buscarClientePorId(req.params.id);
        return res.status(200).json(cliente);
    } catch (error) {
        return next(error);
    }
}

async function buscarClientePorTelefone(req, res, next) {
    try {
        const cliente = await clienteService.buscarClientePorTelefone(req.params.telefone);
        return res.status(200).json(cliente);
    } catch (error) {
        return next(error);
    }
}

async function atualizarCliente(req, res, next) {
    try {
        const cliente = await clienteService.atualizarCliente(req.params.id, req.body);
        return res.status(200).json(cliente);
    } catch (error) {
        return next(error);
    }
}

async function excluirCliente(req, res, next) {
    try {
        const cliente = await clienteService.excluirCliente(req.params.id);
        return res.status(200).json(cliente);
    } catch (error) {
        return next(error);
    }
}

module.exports = {
    criarCliente,
    listarClientes,
    buscarClientePorId,
    buscarClientePorTelefone,
    atualizarCliente,
    excluirCliente
};