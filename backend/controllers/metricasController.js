const metricasService = require('../services/metricasService');

async function buscarMetricaDiaria(req, res, next) {
    try {
        const metrica = await metricasService.buscarMetricaDiaria(req.params.data || req.query.data);
        return res.status(200).json(metrica);
    } catch (error) {
        return next(error);
    }
}

async function buscarResumoPorPeriodo(req, res, next) {
    try {
        const periodo = req.query.periodo || 'dia';
        const resumo = await metricasService.buscarResumoPorPeriodo(periodo);
        return res.status(200).json(resumo);
    } catch (error) {
        return next(error);
    }
}

module.exports = {
    buscarMetricaDiaria,
    buscarResumoPorPeriodo
};