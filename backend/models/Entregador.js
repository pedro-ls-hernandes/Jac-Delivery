const mongoose = require('mongoose');

const entregadorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    cpf: {
        type: String,
        required: true,
        unique: true
    },
    telefone: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true
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
        trim: true
    },
    status: {
        type: String,
        required: true,
        enum: ['Ativo', 'Inativo'],
        default: 'Ativo'
    },
    entregas: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Entrega'
    }],
    user_login: {
        type: String,
        //required: true,
        unique: true,
        sparse: true,
        trim: true
    },
    password: {
        type: String,
        //required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Entregador', entregadorSchema);