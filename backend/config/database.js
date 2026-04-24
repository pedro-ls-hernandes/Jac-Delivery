const mongoose = require('mongoose');

async function connectDatabase(uri) {
    if (!uri) {
        throw new Error('A variável de ambiente MONGODB_URI é obrigatória');
    }

    mongoose.set('strictQuery', true);
    await mongoose.connect(uri);
}

module.exports = {
    connectDatabase
};