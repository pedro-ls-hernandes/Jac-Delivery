const MetricaDiaria = require('../models/MetricaDiaria');
const { getPeriodRange, toDateKey } = require('../utils/domain');

async function atualizarMetricaDiaria(dataReferencia, increments) {
    const data = new Date(`${dataReferencia}T00:00:00.000Z`);

    return MetricaDiaria.findOneAndUpdate(
        { data_referencia: dataReferencia },
        {
            $setOnInsert: {
                data_referencia: dataReferencia,
                data_inicio: data
            },
            $inc: increments
        },
        { new: true, upsert: true }
    );
}

async function registrarCriacaoEntrega(data = new Date(), valor = 0) {
    return atualizarMetricaDiaria(toDateKey(data), {
        total_entregas_criadas: 1,
        valor_total: valor
    });
}

async function registrarColeta(data = new Date()) {
    return atualizarMetricaDiaria(toDateKey(data), {
        total_entregas_coletadas: 1
    });
}

async function registrarEntrega(data = new Date()) {
    return atualizarMetricaDiaria(toDateKey(data), {
        total_entregas_entregues: 1
    });
}

async function registrarConfirmacao(data = new Date(), valor = 0) {
    return atualizarMetricaDiaria(toDateKey(data), {
        total_entregas_confirmadas: 1,
        valor_confirmado: valor
    });
}

async function registrarCancelamento(data = new Date()) {
    return atualizarMetricaDiaria(toDateKey(data), {
        total_entregas_canceladas: 1
    });
}

async function buscarMetricaDiaria(dataReferencia = toDateKey()) {
    return MetricaDiaria.findOne({ data_referencia: dataReferencia });
}

async function buscarResumoPorPeriodo(periodo, baseDate = new Date()) {
    const { start, end } = getPeriodRange(periodo, baseDate);
    const metricas = await MetricaDiaria.find({
        data_inicio: {
            $gte: start,
            $lte: end
        }
    }).sort({ data_inicio: 1 });

    return metricas.reduce((accumulator, item) => {
        accumulator.total_entregas_criadas += item.total_entregas_criadas || 0;
        accumulator.total_entregas_coletadas += item.total_entregas_coletadas || 0;
        accumulator.total_entregas_entregues += item.total_entregas_entregues || 0;
        accumulator.total_entregas_confirmadas += item.total_entregas_confirmadas || 0;
        accumulator.total_entregas_canceladas += item.total_entregas_canceladas || 0;
        accumulator.valor_total += item.valor_total || 0;
        accumulator.valor_confirmado += item.valor_confirmado || 0;
        return accumulator;
    }, {
        periodo,
        inicio: start,
        fim: end,
        total_entregas_criadas: 0,
        total_entregas_coletadas: 0,
        total_entregas_entregues: 0,
        total_entregas_confirmadas: 0,
        total_entregas_canceladas: 0,
        valor_total: 0,
        valor_confirmado: 0
    });
}

module.exports = {
    atualizarMetricaDiaria,
    registrarCriacaoEntrega,
    registrarColeta,
    registrarEntrega,
    registrarConfirmacao,
    registrarCancelamento,
    buscarMetricaDiaria,
    buscarResumoPorPeriodo
};