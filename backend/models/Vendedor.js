const mongoose = require('mongoose');

const vendedorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    numero_venda: {
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
    },
    entregas: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Entrega'
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Vendedor', vendedorSchema);