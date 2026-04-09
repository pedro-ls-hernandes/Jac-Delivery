const mongoose = require('mongoose');
require

const entregaSchema = new mongoose.Schema({
    cliente: {
        type: String,
        required: true
    },
    cadastro_loja: {
        type: String,
        unique: true
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
    vendedor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendedor',
        required: true
    },
    entregador: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Entregador',
        required: true
    },
    observacoes:
    {
        type: String,
    },
    valor: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['Não Coletada', 'Em Rota', 'Entregue', 'Confirmada', 'Cancelada'],
        default: 'Não Coletada',
    },
    forma_pagamento: {
        type: String,
        required: true,
        enum: ['Dinheiro', 'Cartão de Crédito', 'Cartão de Débito', 'Pix Bradesco', 'Pix QR Code', 'Crediário Loja'],
    },
    taxa_entrega: {
        type: Number,
    },
    valor_corrida:{
        type: Number,
    },
    data_coleta: {
        type: Date,
    },
    data_entrega: {
        type: Date,
    },
    data_criacao: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Entrega', entregaSchema);
