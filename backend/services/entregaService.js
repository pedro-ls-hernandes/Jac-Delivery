const Entrega = require('../models/Entrega');
const Cliente = require('../models/Cliente');
const Vendedor = require('../models/Vendedor');
const Entregador = require('../models/Entregador');
const clienteService = require('./clienteService');
const metricasService = require('./metricasService');
const { CIDADES, FORMAS_PAGAMENTO, STATUS_ENTREGA, normalizarTelefone } = require('../utils/domain');
const { createError } = require('../utils/http');

function isObjectId(value) {
    return value && typeof value === 'string' && /^[a-fA-F0-9]{24}$/.test(value);
}

function sanitizarEntrega(entrega) {
    return entrega;
}

async function buscarVendedorValido(vendedorId, actor) {
    const id = actor?.role === 'vendedor' ? actor.id : vendedorId;
    const vendedor = await Vendedor.findById(id);

    if (!vendedor) {
        throw createError(404, 'Vendedor não encontrado');
    }

    if (vendedor.status === 'Inativo') {
        throw createError(409, 'Vendedor inativo');
    }

    return vendedor;
}

async function buscarEntregadorValido(dados) {
    if (dados.tipo_entregador === 'Terceirizado') {
        if (!dados.entregador_terceirizado || !dados.entregador_terceirizado.nome) {
            throw createError(400, 'Informações do entregador terceirizado são obrigatórias');
        }

        return {
            tipo_entregador: 'Terceirizado',
            entregador: null,
            entregador_terceirizado: {
                nome: dados.entregador_terceirizado.nome,
                telefone: dados.entregador_terceirizado.telefone || '',
                documento: dados.entregador_terceirizado.documento || ''
            }
        };
    }

    if (!dados.entregador || !isObjectId(dados.entregador)) {
        throw createError(400, 'Entregador registrado é obrigatório');
    }

    const entregador = await Entregador.findById(dados.entregador);

    if (!entregador) {
        throw createError(404, 'Entregador não encontrado');
    }

    if (entregador.status === 'Inativo') {
        throw createError(409, 'Entregador inativo');
    }

    return {
        tipo_entregador: 'Registrado',
        entregador: entregador._id,
        entregador_terceirizado: {
            nome: '',
            telefone: '',
            documento: ''
        }
    };
}

async function criarEntrega(dados, actor = {}) {
    const telefone = normalizarTelefone(dados.telefone);

    if (!telefone) {
        throw createError(400, 'Telefone é obrigatório');
    }

    if (!FORMAS_PAGAMENTO.includes(dados.forma_pagamento)) {
        throw createError(400, 'Forma de pagamento inválida');
    }

    if (dados.cidade && !CIDADES.includes(dados.cidade)) {
        throw createError(400, 'Cidade inválida');
    }

    const vendedor = await buscarVendedorValido(dados.vendedor, actor);
    const clienteExistente = await Cliente.findOne({ telefone });

    let cliente;

    if (clienteExistente) {
        cliente = clienteExistente;
    } else {
        cliente = await clienteService.criarCliente({
            name: dados.cliente || dados.cliente_nome,
            telefone,
            logradouro: dados.logradouro,
            numero: dados.numero,
            bairro: dados.bairro,
            cidade: dados.cidade
        });
    }

    const entregadorData = await buscarEntregadorValido(dados);

    const ultimaEntrega = await Entrega.findOne({
        $or: [
            { entregador: entregadorData.entregador },
            {
                tipo_entregador: 'Terceirizado',
                'entregador_terceirizado.nome': entregadorData.entregador_terceirizado.nome
            }
        ],
        status: { $ne: 'Cancelada' }
    }).sort({ ordem: -1 });

    const entrega = await Entrega.create({
        cliente_id: cliente._id,
        cliente: cliente.name,
        telefone: cliente.telefone,
        logradouro: cliente.logradouro,
        numero: cliente.numero || dados.numero || '',
        bairro: cliente.bairro,
        cidade: cliente.cidade,
        vendedor: vendedor._id,
        entregador: entregadorData.entregador,
        tipo_entregador: entregadorData.tipo_entregador,
        entregador_terceirizado: entregadorData.entregador_terceirizado,
        observacoes: dados.observacoes || '',
        valor: dados.valor,
        forma_pagamento: dados.forma_pagamento,
        valor_pago_dinheiro: dados.valor_pago_dinheiro || 0,
        troco: dados.troco || 0,
        pagamentos_combinados: dados.pagamentos_combinados || [],
        taxa_entrega: dados.taxa_entrega || 0,
        valor_corrida: dados.valor_corrida || 0,
        ordem: ultimaEntrega ? ultimaEntrega.ordem + 1 : 1,
        status: 'Não Coletada'
    });

    await clienteService.anexarEntregaAoCliente(cliente._id, entrega._id);
    await Vendedor.findByIdAndUpdate(vendedor._id, { $addToSet: { entregas: entrega._id } });

    if (entregadorData.entregador) {
        await Entregador.findByIdAndUpdate(entregadorData.entregador, { $addToSet: { entregas: entrega._id } });
    }

    await metricasService.registrarCriacaoEntrega(entrega.data_criacao, entrega.valor);

    return entrega.populate(['cliente_id', 'vendedor', 'entregador', 'coletada_por', 'cancelada_por']);
}

async function listarEntregas(filtros = {}, actor = {}) {
    const query = {};

    if (actor.role === 'vendedor') {
        query.vendedor = actor.id;
    }

    if (actor.role === 'entregador') {
        query.entregador = actor.id;
    }

    if (filtros.status) {
        query.status = filtros.status;
    }

    if (filtros.entregador && isObjectId(filtros.entregador)) {
        query.entregador = filtros.entregador;
    }

    const entregas = await Entrega.find(query)
        .populate('cliente_id vendedor entregador coletada_por cancelada_por')
        .sort({ ordem: 1, createdAt: -1 });

    return entregas.map(sanitizarEntrega);
}

async function buscarEntregaPorId(id, actor = {}) {
    const entrega = await Entrega.findById(id).populate('cliente_id vendedor entregador coletada_por cancelada_por');

    if (!entrega) {
        throw createError(404, 'Entrega não encontrada');
    }

    if (actor.role === 'vendedor' && entrega.vendedor._id.toString() !== actor.id) {
        throw createError(403, 'Acesso negado');
    }

    if (actor.role === 'entregador') {
        const entregadorRegistrado = entrega.entregador && entrega.entregador._id.toString() === actor.id;
        if (!entregadorRegistrado) {
            throw createError(403, 'Acesso negado');
        }
    }

    return sanitizarEntrega(entrega);
}

async function listarFilaDoEntregador(entregadorId) {
    return Entrega.find({
        entregador: entregadorId,
        status: { $nin: ['Cancelada', 'Confirmada'] }
    })
        .populate('cliente_id vendedor entregador')
        .sort({ ordem: 1 });
}

async function reordenarFilaEntregador(entregadorId, ordemIds, actor = {}) {
    if (!Array.isArray(ordemIds) || ordemIds.length === 0) {
        throw createError(400, 'A lista de ordem é obrigatória');
    }

    if (actor.role === 'entregador' && actor.id !== entregadorId) {
        throw createError(403, 'Você só pode reorganizar a própria fila');
    }

    const filaAtual = await Entrega.find({
        entregador: entregadorId,
        status: { $nin: ['Cancelada', 'Confirmada'] }
    });

    const idsFilaAtual = filaAtual.map((item) => item._id.toString());
    const idsSolicitados = ordemIds.map((item) => item.toString());

    if (idsFilaAtual.length !== idsSolicitados.length || !idsSolicitados.every((id) => idsFilaAtual.includes(id))) {
        throw createError(400, 'A fila enviada não corresponde às entregas atribuídas');
    }

    await Promise.all(ordemIds.map((entregaId, index) => Entrega.findByIdAndUpdate(entregaId, { ordem: index + 1 })));

    return listarFilaDoEntregador(entregadorId);
}

async function coletarEntrega(id, actor = {}) {
    const entrega = await Entrega.findById(id);

    if (!entrega) {
        throw createError(404, 'Entrega não encontrada');
    }

    if (actor.role === 'entregador' && entrega.entregador && entrega.entregador.toString() !== actor.id) {
        throw createError(403, 'Acesso negado');
    }

    if (actor.role === 'entregador' && entrega.tipo_entregador === 'Terceirizado') {
        throw createError(403, 'Acesso negado');
    }

    if (entrega.status === 'Cancelada' || entrega.status === 'Confirmada') {
        throw createError(409, 'Não é possível alterar uma entrega finalizada');
    }

    entrega.status = 'Coletada';
    entrega.data_coleta = new Date();
    entrega.coletada_por = actor.role === 'entregador' ? actor.id : entrega.coletada_por;
    await entrega.save();

    await metricasService.registrarColeta(entrega.data_coleta);

    return buscarEntregaPorId(entrega._id, actor);
}

async function marcarComoEntregue(id, actor = {}) {
    const entrega = await Entrega.findById(id);

    if (!entrega) {
        throw createError(404, 'Entrega não encontrada');
    }

    if (actor.role === 'entregador' && entrega.entregador && entrega.entregador.toString() !== actor.id) {
        throw createError(403, 'Acesso negado');
    }

    if (actor.role === 'entregador' && entrega.tipo_entregador === 'Terceirizado') {
        throw createError(403, 'Acesso negado');
    }

    if (entrega.status === 'Cancelada' || entrega.status === 'Confirmada') {
        throw createError(409, 'Não é possível alterar uma entrega finalizada');
    }

    entrega.status = 'Entregue';
    entrega.data_entrega = new Date();
    await entrega.save();

    await metricasService.registrarEntrega(entrega.data_entrega);

    const proximaEntrega = entrega.entregador
        ? await Entrega.findOne({
            entregador: entrega.entregador,
            status: 'Não Coletada'
        }).sort({ ordem: 1 })
        : null;

    return {
        entrega: await buscarEntregaPorId(entrega._id, actor),
        proximaEntrega: proximaEntrega ? await buscarEntregaPorId(proximaEntrega._id, actor) : null
    };
}

async function confirmarEntrega(id, actor = {}) {
    const entrega = await Entrega.findById(id);

    if (!entrega) {
        throw createError(404, 'Entrega não encontrada');
    }

    if (entrega.status === 'Cancelada') {
        throw createError(409, 'Não é possível confirmar uma entrega cancelada');
    }

    if (entrega.status === 'Confirmada') {
        throw createError(409, 'Entrega já confirmada');
    }

    entrega.status = 'Confirmada';
    entrega.data_confirmacao = new Date();
    await entrega.save();

    await metricasService.registrarConfirmacao(entrega.data_confirmacao, entrega.valor);

    return buscarEntregaPorId(entrega._id, actor);
}

async function cancelarEntrega(id, actor = {}) {
    const entrega = await Entrega.findById(id);

    if (!entrega) {
        throw createError(404, 'Entrega não encontrada');
    }

    entrega.status = 'Cancelada';
    entrega.cancelada_em = new Date();
    entrega.cancelada_por = actor.role === 'admin' ? actor.id : entrega.cancelada_por;
    await entrega.save();

    await metricasService.registrarCancelamento(entrega.cancelada_em);

    return buscarEntregaPorId(entrega._id, actor);
}

async function atualizarEntrega(id, dados, actor = {}) {
    const entrega = await Entrega.findById(id);

    if (!entrega) {
        throw createError(404, 'Entrega não encontrada');
    }

    if (actor.role === 'entregador') {
        throw createError(403, 'Entregador não pode editar a entrega completa');
    }

    if (dados.forma_pagamento && !FORMAS_PAGAMENTO.includes(dados.forma_pagamento)) {
        throw createError(400, 'Forma de pagamento inválida');
    }

    if (dados.cidade && !CIDADES.includes(dados.cidade)) {
        throw createError(400, 'Cidade inválida');
    }

    Object.assign(entrega, dados);
    await entrega.save();

    return buscarEntregaPorId(entrega._id, actor);
}

module.exports = {
    criarEntrega,
    listarEntregas,
    buscarEntregaPorId,
    listarFilaDoEntregador,
    reordenarFilaEntregador,
    coletarEntrega,
    marcarComoEntregue,
    confirmarEntrega,
    cancelarEntrega,
    atualizarEntrega
};
