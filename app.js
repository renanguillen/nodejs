const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

const Produto = require('./models/Produto');
const Categoria = require('./models/Categoria');
const Pedido = require('./models/Pedido');
const Usuario = require('./models/Usuario');

const app = express();
app.use(express.json());

const JWT_SECRET = 'secret';

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/seu_database', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB conectado com sucesso');
  } catch (error) {
    console.error('Erro ao conectar com o MongoDB:', error);
    process.exit(1);
  }
};
connectDB();

const autenticarJWT = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/produtos', async (req, res) => {
  try {
    const produtos = await Produto.find();
    res.json(produtos);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar produtos' });
  }
});

app.post('/categoria', autenticarJWT, async (req, res) => {
  try {
    const { nome } = req.body;
    const novaCategoria = new Categoria({ nome });
    await novaCategoria.save();
    res.status(201).json(novaCategoria);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao adicionar categoria' });
  }
});

app.get('/pedidos', async (req, res) => {
  try {
    const pedidos = await Pedido.find().populate('produtoId');
    res.json(pedidos);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar pedidos' });
  }
});

app.post('/pedidos', autenticarJWT, async (req, res) => {
  try {
    const { produtoId, quantidade } = req.body;
    const novoPedido = new Pedido({ produtoId, quantidade });
    await novoPedido.save();
    res.status(201).json(novoPedido);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar pedido' });
  }
});

app.put('/produto/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, preco, categoriaId } = req.body;
    const produtoAtualizado = await Produto.findByIdAndUpdate(id, { nome, preco, categoriaId }, { new: true });
    if (!produtoAtualizado) return res.status(404).json({ error: 'Produto não encontrado' });
    res.json(produtoAtualizado);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar produto' });
  }
});

app.post('/register', async (req, res) => {
  try {
    const { nome, email, senha } = req.body;
    const senhaHash = await bcrypt.hash(senha, 10);
    const novoUsuario = new Usuario({ nome, email, senha: senhaHash });
    await novoUsuario.save();
    res.status(201).json({ message: 'Usuário registrado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao registrar usuário' });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    const usuario = await Usuario.findOne({ email });
    if (!usuario) return res.status(400).json({ error: 'Credenciais inválidas' });

    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) return res.status(400).json({ error: 'Credenciais inválidas' });

    const token = jwt.sign({ userId: usuario._id }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

app.listen(3000, () => {
  console.log('Swagger: http://localhost:3000/api-docs');
});
