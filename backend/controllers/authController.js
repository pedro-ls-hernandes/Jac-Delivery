const authService = require('../services/authService');

async function login(req, res, next) {
    try {
        const resultado = await authService.login(req.body);
        return res.status(200).json(resultado);
    } catch (error) {
        return next(error);
    }
}

async function registrarAdmin(req, res, next) {
    try {
        const admin = await authService.registrarAdmin(req.body);
        return res.status(201).json(admin);
    } catch (error) {
        return next(error);
    }
}

module.exports = {
    login,
    registrarAdmin
};
