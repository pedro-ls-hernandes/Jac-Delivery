const Cliente = require('../models/Cliente');

exports.criarCliente = async (clienteData) => {
    try {
        const cliente = new Cliente(clienteData);
        await cliente.save();
        return cliente;
    } catch (error) {
        throw new Error('Erro ao criar cliente: ' + error.message);
    }
};

exports.buscarClientePorTelefone = async (telefone) => {
    try {
        const cliente = await Cliente.findOne({ telefone });
        return cliente  || null;
    } catch (error) {
        throw new Error('Erro ao buscar cliente por telefone: ' + error.message);
    }
};

exports.excluirCliente = async (id) => {
    try {
        const cliente = await Cliente.findByIdAndDelete(id);
        return cliente || null;
    } catch (error) {
        throw new Error('Erro ao excluir cliente: ' + error.message);
    }
};

exports.atualizarCliente = async (id, clienteData) => {
    try {
        const cliente = await Cliente.findByIdAndUpdate(id, clienteData, { new: true });
        return cliente || null;
    } catch (error) {
        throw new Error('Erro ao atualizar cliente: ' + error.message);
    }
};

exports.listarClientes = async () => {
    try {
        const clientes = await Cliente.find();
        return clientes;
    } catch (error) {
        throw new Error('Erro ao listar clientes: ' + error.message);
    }
};