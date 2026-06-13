const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Vendedor = require('../models/Vendedor');
const Entregador = require('../models/Entregador');
const { comparePassword } = require('../utils/hash');
const { createError } = require('../utils/http');
const { sanitizarAdmin } = require('./adminService');
const adminService = require('./adminService');
const { sanitizarVendedor } = require('./vendedorService');
const { sanitizarEntregador } = require('./entregadorService');

function gerarToken(payload) {
	return jwt.sign(payload, process.env.JWT_SECRET || 'jac-delivery-secret', {
		expiresIn: '12h'
	});
}

async function login({ role, identificador, login, username, email, password }) {
	const usuario = String(identificador || login || username || email || '').trim();

	if (!usuario || !password) {
		throw createError(400, 'Identificador e senha são obrigatórios');
	}

	if (!['admin', 'vendedor', 'entregador'].includes(role)) {
		throw createError(400, 'Perfil de acesso inválido');
	}

	let registro = null;
	let sanitizado = null;

	if (role === 'admin') {
		registro = await Admin.findOne({
			$or: [
				{ username: usuario },
				{ email: usuario }
			]
		});
		sanitizado = sanitizarAdmin(registro);
	}

	if (role === 'vendedor') {
		registro = await Vendedor.findOne({
			$or: [
				{ user_login: usuario },
				{ numero_venda: usuario }
			]
		});
		sanitizado = sanitizarVendedor(registro);
	}

	if (role === 'entregador') {
		registro = await Entregador.findOne({
			$or: [
				{ user_login: usuario },
				{ email: usuario }
			]
		});
		sanitizado = sanitizarEntregador(registro);
	}

	if (!registro) {
		throw createError(401, 'Credenciais inválidas');
	}

	if (role !== 'admin' && registro.status === 'Inativo') {
		throw createError(403, 'Usuário inativo');
	}

	const senhaValida = await comparePassword(registro.password, password);
	if (!senhaValida) {
		throw createError(401, 'Credenciais inválidas');
	}

	const token = gerarToken({
		sub: registro._id.toString(),
		role,
		name: registro.name,
		email: registro.email
	});

	return {
		token,
		user: sanitizado
	};
}

async function registrarAdmin(dados) {
	return adminService.criarAdmin(dados);
}

module.exports = {
	login,
	registrarAdmin
};
