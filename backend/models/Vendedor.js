const mongoose = require('mongoose');

const vendedorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    numero_venda: {
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
    },
    entregas: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Entrega'
    }]
});

module.exports = mongoose.model('Vendedor', vendedorSchema);