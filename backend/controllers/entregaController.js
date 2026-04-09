const Entrega = require('../models/Entrega');
const Cliente = require('../models/Cliente');
const clienteService = require('../services/clienteService');
const Entregador = require('../models/Entregador');
const Vendedor = require('../models/Vendedor');
const Admin = require('../models/Admin');

exports.criarEntrega = async (req, res) => {
    try {
        const { cliente, telefone, logradouro, numero, bairro, cidade, vendedor, entregador, observacoes, valor, forma_pagamento } = req.body;
        
        if (!cliente || !telefone || !logradouro || !bairro || !cidade || !vendedor || !entregador || !valor || !forma_pagamento) {
            return res.status(400).json({ message: 'Todos os campos obrigatórios devem ser preenchidos' });
        }

        if (!['Dinheiro', 'Cartão de Crédito', 'Cartão de Débito', 'Pix Bradesco', 'Pix QR Code', 'Crediário Loja'].includes(forma_pagamento)) {
            return res.status(400).json({ message: 'Forma de pagamento inválida' });
        }

        if (!['Jaú', 'Mineiros', 'Dois Córregos'].includes(cidade)) {
            return res.status(400).json({ message: 'Cidade inválida' });
        }

        cliente_existente = await Cliente.findOne({ telefone: telefone });

        if (!cliente_existente) {
            try{
                clienteService.criarCliente({
                    name: cliente,
                    telefone,
                    logradouro,
                    numero,
                    bairro,
                    cidade
                });
            } catch (error) {
                return res.status(400).json({ message: error.message });
            }
        }

        const entrega = new Entrega({
            cliente,
            logradouro,
            numero,
            bairro,
            cidade,
            vendedor,
            entregador,
            observacoes,
            valor,
            forma_pagamento
        });
        await entrega.save();
        res.status(201).json(entrega);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};