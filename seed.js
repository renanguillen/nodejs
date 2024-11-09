const mongoose = require('mongoose');
const Produto = require('./models/Produto');
const Categoria = require('./models/Categoria');
const Pedido = require('./models/Pedido');
const Usuario = require('./models/Usuario');
const bcrypt = require('bcrypt');

const seedDatabase = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/seu_database');
    console.log('MongoDB conectado para população inicial');

    await Categoria.deleteMany({});
    await Produto.deleteMany({});
    await Pedido.deleteMany({});
    await Usuario.deleteMany({});
    console.log('Banco de dados limpo');

    const categoriaExemplo = new Categoria({ nome: 'Eletrônicos' });
    await categoriaExemplo.save();

    const produtoExemplo = new Produto({
      nome: 'Smartphone',
      preco: 1500,
      categoriaId: categoriaExemplo._id,
    });
    await produtoExemplo.save();

    const pedidoExemplo = new Pedido({
      produtoId: produtoExemplo._id,
      quantidade: 2,
      data: new Date(),
    });
    await pedidoExemplo.save();

    const senhaHash = await bcrypt.hash('string', 10);
    const usuarioExemplo = new Usuario({
      nome: 'User',
      email: 'user@example.com',
      senha: senhaHash,
    });
    await usuarioExemplo.save();

    console.log('Banco populado com sucesso');
    process.exit(0);
  } catch (error) {
    console.error('Erro ao popular o banco:', error);
    process.exit(1);
  }
};

seedDatabase();
