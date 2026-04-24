const jwt = require('jsonwebtoken');
const { createError } = require('../utils/http');

function authMiddleware(req, res, next) {
	const authorization = req.headers.authorization || '';
	const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : null;

	if (!token) {
		return next(createError(401, 'Token não informado'));
	}

	try {
		const payload = jwt.verify(token, process.env.JWT_SECRET || 'jac-delivery-secret');
		req.user = {
			id: payload.sub,
			role: payload.role,
			name: payload.name,
			email: payload.email
		};
		return next();
	} catch (error) {
		return next(createError(401, 'Token inválido ou expirado'));
	}
}

function authorize(...roles) {
	return (req, res, next) => {
		if (!req.user) {
			return next(createError(401, 'Usuário não autenticado'));
		}

		if (!roles.includes(req.user.role)) {
			return next(createError(403, 'Acesso negado'));
		}

		return next();
	};
}

module.exports = {
	authMiddleware,
	authorize
};
