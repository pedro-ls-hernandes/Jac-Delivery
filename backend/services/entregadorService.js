const Entregador = require('../models/Entregador');
const { hashPassword } = require('../utils/hash');
const { createError } = require('../utils/http');

function sanitizarEntregador(entregador) {
	if (!entregador) {
		return null;
	}

	const objeto = entregador.toObject ? entregador.toObject() : entregador;
	delete objeto.password;
	return objeto;
}

async function buscarEntregadorPorUsuario(login) {
	if (!login) {
		return null;
	}

	return Entregador.findOne({ user_login: login });
}

async function criarEntregador(dados) {
	const { name, cpf, telefone, email, logradouro, bairro, cidade, user_login, password } = dados;

	if (!name || !cpf || !telefone || !email || !logradouro || !bairro || !cidade) {
		throw createError(400, 'Nome, CPF, telefone, e-mail e endereço são obrigatórios');
	}

	if (user_login && password === undefined) {
		throw createError(400, 'Senha é obrigatória quando o login é informado');
	}

	if (user_login) {
		const existenteLogin = await Entregador.findOne({ user_login });

		if (existenteLogin) {
			throw createError(409, 'Login de entregador já cadastrado');
		}
	}

	const existenteCpf = await Entregador.findOne({ cpf });
	if (existenteCpf) {
		throw createError(409, 'CPF já cadastrado');
	}

	const existenteEmail = await Entregador.findOne({ email });
	if (existenteEmail) {
		throw createError(409, 'E-mail já cadastrado');
	}

	const entregador = await Entregador.create({
		...dados,
		password: password ? await hashPassword(password) : undefined
	});

	return sanitizarEntregador(entregador);
}

async function listarEntregadores(filtro = {}) {
	const entregadores = await Entregador.find(filtro).sort({ createdAt: -1 });
	return entregadores.map(sanitizarEntregador);
}

async function buscarEntregadorPorId(id) {
	const entregador = await Entregador.findById(id);
	return sanitizarEntregador(entregador);
}

async function atualizarEntregador(id, dados) {
	const entregador = await Entregador.findById(id);

	if (!entregador) {
		throw createError(404, 'Entregador não encontrado');
	}

	if (dados.password) {
		dados.password = await hashPassword(dados.password);
	}

	Object.assign(entregador, dados);
	await entregador.save();

	return sanitizarEntregador(entregador);
}

async function alterarStatusEntregador(id, status) {
	if (!['Ativo', 'Inativo'].includes(status)) {
		throw createError(400, 'Status inválido');
	}

	return atualizarEntregador(id, { status });
}

async function excluirEntregador(id) {
	const entregador = await Entregador.findByIdAndDelete(id);

	if (!entregador) {
		throw createError(404, 'Entregador não encontrado');
	}

	return sanitizarEntregador(entregador);
}

module.exports = {
	sanitizarEntregador,
	buscarEntregadorPorUsuario,
	criarEntregador,
	listarEntregadores,
	buscarEntregadorPorId,
	atualizarEntregador,
	alterarStatusEntregador,
	excluirEntregador
};
