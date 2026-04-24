const adminService = require('../services/adminService');

async function criarAdmin(req, res, next) {
    try {
        const admin = await adminService.criarAdmin(req.body);
        return res.status(201).json(admin);
    } catch (error) {
        return next(error);
    }
}

async function listarAdmins(req, res, next) {
    try {
        const admins = await adminService.listarAdmins();
        return res.status(200).json(admins);
    } catch (error) {
        return next(error);
    }
}

async function buscarAdminPorId(req, res, next) {
    try {
        const admin = await adminService.buscarAdminPorId(req.params.id);
        return res.status(200).json(admin);
    } catch (error) {
        return next(error);
    }
}

async function atualizarAdmin(req, res, next) {
    try {
        const admin = await adminService.atualizarAdmin(req.params.id, req.body);
        return res.status(200).json(admin);
    } catch (error) {
        return next(error);
    }
}

async function excluirAdmin(req, res, next) {
    try {
        const admin = await adminService.excluirAdmin(req.params.id);
        return res.status(200).json(admin);
    } catch (error) {
        return next(error);
    }
}

module.exports = {
    criarAdmin,
    listarAdmins,
    buscarAdminPorId,
    atualizarAdmin,
    excluirAdmin
};