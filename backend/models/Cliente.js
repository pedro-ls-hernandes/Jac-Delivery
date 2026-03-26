const mongoose = require('mongoose');


const clienteSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    telefone: {
        type: String,
        required: true
    },
    logradouro: {
        type: String,
        required: true
    },
    numero: {
        type: String,
    },
    bairro: {
        type: String,
        required: true
    },
    cidade: {
        type: String,
        required: true,
        enum: ['Jaú', 'Mineiros', 'Dois Córregos'],
        default: 'Jaú'
    },
});

module.exports = mongoose.model('Cliente', clienteSchema);