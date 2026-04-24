const entregaService = require('../services/entregaService');

async function criarEntrega(req, res, next) {
    try {
        const entrega = await entregaService.criarEntrega(req.body, req.user || {});
        return res.status(201).json(entrega);
    } catch (error) {
        return next(error);
    }
}

async function listarEntregas(req, res, next) {
    try {
        const entregas = await entregaService.listarEntregas(req.query, req.user || {});
        return res.status(200).json(entregas);
    } catch (error) {
        return next(error);
    }
}

async function buscarEntregaPorId(req, res, next) {
    try {
        const entrega = await entregaService.buscarEntregaPorId(req.params.id, req.user || {});
        return res.status(200).json(entrega);
    } catch (error) {
        return next(error);
    }
}

async function atualizarEntrega(req, res, next) {
    try {
        const entrega = await entregaService.atualizarEntrega(req.params.id, req.body, req.user || {});
        return res.status(200).json(entrega);
    } catch (error) {
        return next(error);
    }
}

async function coletarEntrega(req, res, next) {
    try {
        const entrega = await entregaService.coletarEntrega(req.params.id, req.user || {});
        return res.status(200).json(entrega);
    } catch (error) {
        return next(error);
    }
}

async function marcarComoEntregue(req, res, next) {
    try {
        const resultado = await entregaService.marcarComoEntregue(req.params.id, req.user || {});
        return res.status(200).json(resultado);
    } catch (error) {
        return next(error);
    }
}

async function confirmarEntrega(req, res, next) {
    try {
        const entrega = await entregaService.confirmarEntrega(req.params.id, req.user || {});
        return res.status(200).json(entrega);
    } catch (error) {
        return next(error);
    }
}

async function cancelarEntrega(req, res, next) {
    try {
        const entrega = await entregaService.cancelarEntrega(req.params.id, req.user || {});
        return res.status(200).json(entrega);
    } catch (error) {
        return next(error);
    }
}

async function listarFilaDoEntregador(req, res, next) {
    try {
        const fila = await entregaService.listarFilaDoEntregador(req.params.entregadorId);
        return res.status(200).json(fila);
    } catch (error) {
        return next(error);
    }
}

async function reordenarFilaEntregador(req, res, next) {
    try {
        const fila = await entregaService.reordenarFilaEntregador(req.params.entregadorId, req.body.ordemIds, req.user || {});
        return res.status(200).json(fila);
    } catch (error) {
        return next(error);
    }
}

module.exports = {
    criarEntrega,
    listarEntregas,
    buscarEntregaPorId,
    atualizarEntrega,
    coletarEntrega,
    marcarComoEntregue,
    confirmarEntrega,
    cancelarEntrega,
    listarFilaDoEntregador,
    reordenarFilaEntregador
};