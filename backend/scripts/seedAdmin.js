require('dotenv').config();

const { connectDatabase } = require('../config/database');
const adminService = require('../services/adminService');

async function seedAdmin() {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

    await connectDatabase(mongoUri);

    const identificador = process.env.INITIAL_ADMIN_EMAIL || process.env.INITIAL_ADMIN_USERNAME;
    const existingAdmin = await adminService.buscarAdminPorIdentificador(identificador);

    if (existingAdmin) {
        console.log('Admin inicial já existe');
        process.exit(0);
    }

    const admin = await adminService.criarAdmin({
        name: process.env.INITIAL_ADMIN_NAME || 'Administrador',
        username: process.env.INITIAL_ADMIN_USERNAME || 'admin',
        email: process.env.INITIAL_ADMIN_EMAIL || 'admin@local',
        password: process.env.INITIAL_ADMIN_PASSWORD || 'admin123'
    });

    console.log(`Admin inicial criado: ${admin.email}`);
    process.exit(0);
}

seedAdmin().catch((error) => {
    console.error('Falha ao criar admin inicial:', error.message);
    process.exit(1);
});