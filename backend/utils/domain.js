const CIDADES = ['Jaú', 'Mineiros', 'Dois Córregos'];
const FORMAS_PAGAMENTO = ['Dinheiro', 'Cartão de Crédito', 'Cartão de Débito', 'Pix Bradesco', 'Pix QR Code', 'Crediário Loja', 'Pagamento Combinado'];
const STATUS_ENTREGA = ['Não Coletada', 'Coletada', 'Em Rota', 'Entregue', 'Confirmada', 'Cancelada'];
const TIPOS_ENTREGADOR = ['Registrado', 'Terceirizado'];

function normalizarTelefone(telefone) {
    return String(telefone || '').replace(/\D/g, '');
}

function toDateKey(date = new Date()) {
    return new Date(date).toISOString().slice(0, 10);
}

function startOfDay(date = new Date()) {
    const value = new Date(date);
    value.setUTCHours(0, 0, 0, 0);
    return value;
}

function endOfDay(date = new Date()) {
    const value = new Date(date);
    value.setUTCHours(23, 59, 59, 999);
    return value;
}

function getPeriodRange(periodo, baseDate = new Date()) {
    const date = new Date(baseDate);

    if (periodo === 'dia') {
        return {
            start: startOfDay(date),
            end: endOfDay(date)
        };
    }

    if (periodo === 'semana') {
        const day = date.getUTCDay();
        const diff = day === 0 ? -6 : 1 - day;
        const start = startOfDay(date);
        start.setUTCDate(start.getUTCDate() + diff);
        const end = endOfDay(start);
        end.setUTCDate(end.getUTCDate() + 6);

        return { start, end };
    }

    if (periodo === 'mes') {
        const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
        const end = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0, 23, 59, 59, 999));

        return { start, end };
    }

    if (periodo === 'ano') {
        const start = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
        const end = new Date(Date.UTC(date.getUTCFullYear(), 11, 31, 23, 59, 59, 999));

        return { start, end };
    }

    throw new Error('Período inválido');
}

module.exports = {
    CIDADES,
    FORMAS_PAGAMENTO,
    STATUS_ENTREGA,
    TIPOS_ENTREGADOR,
    normalizarTelefone,
    toDateKey,
    startOfDay,
    endOfDay,
    getPeriodRange
};
