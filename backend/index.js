require('dotenv').config();

const app = require('./app');
const { connectDatabase } = require('./config/database');

async function bootstrap() {
    const port = process.env.PORT || 3000;
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

    await connectDatabase(mongoUri);

    app.listen(port, () => {
        console.log(`Backend executando na porta ${port}`);
    });
}

bootstrap().catch((error) => {
    console.error('Falha ao iniciar o servidor:', error.message);
    process.exit(1);
});