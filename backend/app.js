const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const clienteRoutes = require('./routes/clienteRoutes');
const entregadorRoutes = require('./routes/entregadorRoutes');
const entregaRoutes = require('./routes/entregaRoutes');
const vendedorRoutes = require('./routes/vendedorRoutes');
const metricasRoutes = require('./routes/metricasRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.use('/auth', authRoutes);
app.use('/admins', adminRoutes);
app.use('/clientes', clienteRoutes);
app.use('/entregadores', entregadorRoutes);
app.use('/entregas', entregaRoutes);
app.use('/vendedores', vendedorRoutes);
app.use('/metricas', metricasRoutes);

app.use((req, res) => {
    res.status(404).json({ message: 'Rota não encontrada' });
});

app.use((error, req, res, next) => {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
        message: error.message || 'Erro interno do servidor'
    });
});

module.exports = app;