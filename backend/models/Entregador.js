const mongoose = require('mongoose');

const entregadorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    cpf: {
        type: String,
        required: true,
        unique: true
    },
    telefone: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
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
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['Ativo', 'Inativo'],
        default: 'Ativo'
    },
    user_login: {
        type: String,
        //required: true,
        unique: true
    },
    password: {
        type: String,
        //required: true
    }
});

module.exports = mongoose.model('Entregador', entregadorSchema);