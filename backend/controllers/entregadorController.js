const entregadorService = require('../services/entregadorService');

async function criarEntregador(req, res, next) {
    try {
        const entregador = await entregadorService.criarEntregador(req.body);
        return res.status(201).json(entregador);
    } catch (error) {
        return next(error);
    }
}

async function listarEntregadores(req, res, next) {
    try {
        const entregadores = await entregadorService.listarEntregadores();
        return res.status(200).json(entregadores);
    } catch (error) {
        return next(error);
    }
}

async function buscarEntregadorPorId(req, res, next) {
    try {
        const entregador = await entregadorService.buscarEntregadorPorId(req.params.id);
        return res.status(200).json(entregador);
    } catch (error) {
        return next(error);
    }
}

async function atualizarEntregador(req, res, next) {
    try {
        const entregador = await entregadorService.atualizarEntregador(req.params.id, req.body);
        return res.status(200).json(entregador);
    } catch (error) {
        return next(error);
    }
}

async function alterarStatusEntregador(req, res, next) {
    try {
        const entregador = await entregadorService.alterarStatusEntregador(req.params.id, req.body.status);
        return res.status(200).json(entregador);
    } catch (error) {
        return next(error);
    }
}

async function excluirEntregador(req, res, next) {
    try {
        const entregador = await entregadorService.excluirEntregador(req.params.id);
        return res.status(200).json(entregador);
    } catch (error) {
        return next(error);
    }
}

module.exports = {
    criarEntregador,
    listarEntregadores,
    buscarEntregadorPorId,
    atualizarEntregador,
    alterarStatusEntregador,
    excluirEntregador
};