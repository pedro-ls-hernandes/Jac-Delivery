const Admin = require('../models/Admin');
const { hashPassword } = require('../utils/hash');
const { createError } = require('../utils/http');

function sanitizarAdmin(admin) {
	if (!admin) {
		return null;
	}

	const objeto = admin.toObject ? admin.toObject() : admin;
	delete objeto.password;
	return objeto;
}

async function buscarAdminPorIdentificador(identificador) {
	if (!identificador) {
		return null;
	}

	return Admin.findOne({
		$or: [
			{ username: identificador },
			{ email: identificador }
		]
	});
}

async function criarAdmin(dados) {
	const { name, username, email, password } = dados;

	if (!name || !username || !email || !password) {
		throw createError(400, 'Nome, usuário, e-mail e senha são obrigatórios');
	}

	const existente = await Admin.findOne({
		$or: [{ username }, { email }]
	});

	if (existente) {
		throw createError(409, 'Admin já cadastrado');
	}

	const admin = await Admin.create({
		name,
		username,
		email,
		password: await hashPassword(password)
	});

	return sanitizarAdmin(admin);
}

async function listarAdmins() {
	const admins = await Admin.find().sort({ createdAt: -1 });
	return admins.map(sanitizarAdmin);
}

async function buscarAdminPorId(id) {
	const admin = await Admin.findById(id);
	return sanitizarAdmin(admin);
}

async function atualizarAdmin(id, dados) {
	const admin = await Admin.findById(id);

	if (!admin) {
		throw createError(404, 'Admin não encontrado');
	}

	if (dados.password) {
		dados.password = await hashPassword(dados.password);
	}

	Object.assign(admin, dados);
	await admin.save();

	return sanitizarAdmin(admin);
}

async function excluirAdmin(id) {
	const admin = await Admin.findByIdAndDelete(id);

	if (!admin) {
		throw createError(404, 'Admin não encontrado');
	}

	return sanitizarAdmin(admin);
}

module.exports = {
	sanitizarAdmin,
	buscarAdminPorIdentificador,
	criarAdmin,
	listarAdmins,
	buscarAdminPorId,
	atualizarAdmin,
	excluirAdmin
};
