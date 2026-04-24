const vendedorService = require('../services/vendedorService');

async function criarVendedor(req, res, next) {
    try {
        const vendedor = await vendedorService.criarVendedor(req.body);
        return res.status(201).json(vendedor);
    } catch (error) {
        return next(error);
    }
}

async function listarVendedores(req, res, next) {
    try {
        const vendedores = await vendedorService.listarVendedores();
        return res.status(200).json(vendedores);
    } catch (error) {
        return next(error);
    }
}

async function buscarVendedorPorId(req, res, next) {
    try {
        const vendedor = await vendedorService.buscarVendedorPorId(req.params.id);
        return res.status(200).json(vendedor);
    } catch (error) {
        return next(error);
    }
}

async function atualizarVendedor(req, res, next) {
    try {
        const vendedor = await vendedorService.atualizarVendedor(req.params.id, req.body);
        return res.status(200).json(vendedor);
    } catch (error) {
        return next(error);
    }
}

async function alterarStatusVendedor(req, res, next) {
    try {
        const vendedor = await vendedorService.alterarStatusVendedor(req.params.id, req.body.status);
        return res.status(200).json(vendedor);
    } catch (error) {
        return next(error);
    }
}

async function excluirVendedor(req, res, next) {
    try {
        const vendedor = await vendedorService.excluirVendedor(req.params.id);
        return res.status(200).json(vendedor);
    } catch (error) {
        return next(error);
    }
}

module.exports = {
    criarVendedor,
    listarVendedores,
    buscarVendedorPorId,
    atualizarVendedor,
    alterarStatusVendedor,
    excluirVendedor
};