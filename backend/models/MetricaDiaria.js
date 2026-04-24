const mongoose = require('mongoose');

const metricaDiariaSchema = new mongoose.Schema({
    data_referencia: {
        type: String,
        required: true,
        unique: true
    },
    data_inicio: {
        type: Date,
        required: true
    },
    total_entregas_criadas: {
        type: Number,
        default: 0
    },
    total_entregas_coletadas: {
        type: Number,
        default: 0
    },
    total_entregas_entregues: {
        type: Number,
        default: 0
    },
    total_entregas_confirmadas: {
        type: Number,
        default: 0
    },
    total_entregas_canceladas: {
        type: Number,
        default: 0
    },
    valor_total: {
        type: Number,
        default: 0
    },
    valor_confirmado: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('MetricaDiaria', metricaDiariaSchema);