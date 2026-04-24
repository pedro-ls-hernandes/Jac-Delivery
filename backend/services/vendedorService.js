const Vendedor = require('../models/Vendedor');
const { hashPassword } = require('../utils/hash');
const { createError } = require('../utils/http');

function sanitizarVendedor(vendedor) {
	if (!vendedor) {
		return null;
	}

	const objeto = vendedor.toObject ? vendedor.toObject() : vendedor;
	delete objeto.password;
	return objeto;
}

async function buscarVendedorPorUsuario(login) {
	if (!login) {
		return null;
	}

	return Vendedor.findOne({ user_login: login });
}

async function criarVendedor(dados) {
	const { name, numero_venda, user_login, password } = dados;

	if (!name || !numero_venda) {
		throw createError(400, 'Nome e número da venda são obrigatórios');
	}

	if (user_login && password === undefined) {
		throw createError(400, 'Senha é obrigatória quando o login é informado');
	}

	if (user_login) {
		const existente = await Vendedor.findOne({ user_login });

		if (existente) {
			throw createError(409, 'Login de vendedor já cadastrado');
		}
	}

	const vendedor = await Vendedor.create({
		...dados,
		password: password ? await hashPassword(password) : undefined
	});

	return sanitizarVendedor(vendedor);
}

async function listarVendedores() {
	const vendedores = await Vendedor.find().sort({ createdAt: -1 });
	return vendedores.map(sanitizarVendedor);
}

async function buscarVendedorPorId(id) {
	const vendedor = await Vendedor.findById(id);
	return sanitizarVendedor(vendedor);
}

async function atualizarVendedor(id, dados) {
	const vendedor = await Vendedor.findById(id);

	if (!vendedor) {
		throw createError(404, 'Vendedor não encontrado');
	}

	if (dados.password) {
		dados.password = await hashPassword(dados.password);
	}

	Object.assign(vendedor, dados);
	await vendedor.save();

	return sanitizarVendedor(vendedor);
}

async function alterarStatusVendedor(id, status) {
	if (!['Ativo', 'Inativo'].includes(status)) {
		throw createError(400, 'Status inválido');
	}

	return atualizarVendedor(id, { status });
}

async function excluirVendedor(id) {
	const vendedor = await Vendedor.findByIdAndDelete(id);

	if (!vendedor) {
		throw createError(404, 'Vendedor não encontrado');
	}

	return sanitizarVendedor(vendedor);
}

module.exports = {
	sanitizarVendedor,
	buscarVendedorPorUsuario,
	criarVendedor,
	listarVendedores,
	buscarVendedorPorId,
	atualizarVendedor,
	alterarStatusVendedor,
	excluirVendedor
};
