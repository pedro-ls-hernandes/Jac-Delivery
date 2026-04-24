const Cliente = require('../models/Cliente');
const { normalizarTelefone } = require('../utils/domain');
const { createError } = require('../utils/http');

function sanitizarCliente(cliente) {
    if (!cliente) {
        return null;
    }

    return cliente.toObject ? cliente.toObject() : cliente;
}

async function criarCliente(clienteData) {
    const telefone = normalizarTelefone(clienteData.telefone);

    if (!clienteData.name || !telefone || !clienteData.logradouro || !clienteData.bairro || !clienteData.cidade) {
        throw createError(400, 'Nome, telefone, endereço, bairro e cidade são obrigatórios');
    }

    const existente = await Cliente.findOne({ telefone });

    if (existente) {
        throw createError(409, 'Cliente já cadastrado com este telefone');
    }

    const cliente = await Cliente.create({
        ...clienteData,
        telefone
    });

    return sanitizarCliente(cliente);
}

async function buscarClientePorTelefone(telefone) {
    const telefoneNormalizado = normalizarTelefone(telefone);
    return Cliente.findOne({ telefone: telefoneNormalizado });
}

async function encontrarOuCriarClientePorTelefone(clienteData) {
    const telefone = normalizarTelefone(clienteData.telefone);
    const clienteExistente = await Cliente.findOne({ telefone });

    if (clienteExistente) {
        return clienteExistente;
    }

    if (!clienteData.name || !clienteData.logradouro || !clienteData.bairro || !clienteData.cidade) {
        throw createError(400, 'Nome e endereço são obrigatórios para cadastrar um novo cliente');
    }

    return Cliente.create({
        name: clienteData.name,
        telefone,
        logradouro: clienteData.logradouro,
        numero: clienteData.numero || '',
        bairro: clienteData.bairro,
        cidade: clienteData.cidade
    });
}

async function anexarEntregaAoCliente(clienteId, entregaId) {
    await Cliente.findByIdAndUpdate(clienteId, {
        $addToSet: { entregas: entregaId }
    });
}

async function excluirCliente(id) {
    const cliente = await Cliente.findByIdAndDelete(id);

    if (!cliente) {
        throw createError(404, 'Cliente não encontrado');
    }

    return sanitizarCliente(cliente);
}

async function atualizarCliente(id, clienteData) {
    const cliente = await Cliente.findById(id);

    if (!cliente) {
        throw createError(404, 'Cliente não encontrado');
    }

    if (clienteData.telefone) {
        clienteData.telefone = normalizarTelefone(clienteData.telefone);
    }

    Object.assign(cliente, clienteData);
    await cliente.save();

    return sanitizarCliente(cliente);
}

async function listarClientes() {
    const clientes = await Cliente.find().sort({ createdAt: -1 });
    return clientes.map(sanitizarCliente);
}

async function buscarClientePorId(id) {
    const cliente = await Cliente.findById(id);
    return sanitizarCliente(cliente);
}

module.exports = {
    sanitizarCliente,
    criarCliente,
    buscarClientePorTelefone,
    encontrarOuCriarClientePorTelefone,
    anexarEntregaAoCliente,
    excluirCliente,
    atualizarCliente,
    listarClientes,
    buscarClientePorId
};