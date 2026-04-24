const mongoose = require('mongoose');

const clienteSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    telefone: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    logradouro: {
        type: String,
        required: true,
        trim: true
    },
    numero: {
        type: String,
        trim: true,
        default: ''
    },
    bairro: {
        type: String,
        required: true,
        trim: true
    },
    cidade: {
        type: String,
        required: true,
        enum: ['Jaú', 'Mineiros', 'Dois Córregos'],
        default: 'Jaú'
    },
    entregas: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Entrega'
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Cliente', clienteSchema);