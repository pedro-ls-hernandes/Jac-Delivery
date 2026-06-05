const mongoose = require('mongoose');
const { randomUUID } = require('crypto');

const entregaSchema = new mongoose.Schema({
    cadastro_loja: {
        type: String,
        unique: true,
        default: () => randomUUID()
    },
    cliente_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cliente',
        required: true
    },
    cliente: {
        type: String,
        required: true,
        trim: true
    },
    telefone: {
        type: String,
        required: true,
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
    vendedor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendedor',
        required: true
    },
    entregador: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Entregador',
        default: null
    },
    tipo_entregador: {
        type: String,
        required: true,
        enum: ['Registrado', 'Terceirizado'],
        default: 'Registrado'
    },
    entregador_terceirizado: {
        nome: {
            type: String,
            trim: true,
            default: ''
        },
        telefone: {
            type: String,
            trim: true,
            default: ''
        }
    },
    observacoes: {
        type: String,
        trim: true,
        default: ''
    },
    valor: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        required: true,
        enum: ['Não Coletada', 'Coletada', 'Em Rota', 'Entregue', 'Confirmada', 'Cancelada'],
        default: 'Não Coletada'
    },
    forma_pagamento: {
        type: String,
        required: true,
        enum: ['Dinheiro', 'Cartão de Crédito', 'Cartão de Débito', 'Pix Bradesco', 'Pix QR Code', 'Crediário Loja', 'Pagamento Combinado']
    },
    valor_pago_dinheiro: {
        type: Number,
        default: 0,
        min: 0
    },
    troco: {
        type: Number,
        default: 0,
        min: 0
    },
    pagamentos_combinados: [{
        forma: {
            type: String,
            enum: ['Dinheiro', 'Cartão de Crédito', 'Cartão de Débito', 'Pix Bradesco', 'Pix QR Code', 'Crediário Loja'],
            required: true
        },
        valor: {
            type: Number,
            required: true,
            min: 0
        },
        valor_pago: {
            type: Number,
            default: 0,
            min: 0
        },
        troco: {
            type: Number,
            default: 0,
            min: 0
        }
    }],
    taxa_entrega: {
        type: Number,
        default: 0
    },
    valor_corrida: {
        type: Number,
        default: 0
    },
    ordem: {
        type: Number,
        default: 0
    },
    data_coleta: {
        type: Date
    },
    data_entrega: {
        type: Date
    },
    data_confirmacao: {
        type: Date
    },
    cancelada_em: {
        type: Date
    },
    cancelada_por: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        default: null
    },
    coletada_por: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Entregador',
        default: null
    },
    data_criacao: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Entrega', entregaSchema);
