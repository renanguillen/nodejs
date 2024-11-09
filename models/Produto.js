const mongoose = require('mongoose');

const ProdutoSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  preco: { type: Number, required: true },
  categoriaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Categoria' },
});

module.exports = mongoose.model('Produto', ProdutoSchema);
