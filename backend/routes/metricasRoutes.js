const express = require('express');
const metricasController = require('../controllers/metricasController');
const { authMiddleware, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authMiddleware);
router.use(authorize('admin'));

router.get('/', metricasController.buscarResumoPorPeriodo);
router.get('/diaria/:data', metricasController.buscarMetricaDiaria);
router.get('/resumo', metricasController.buscarResumoPorPeriodo);

module.exports = router;