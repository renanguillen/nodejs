const mongoose = require('mongoose');

const PedidoSchema = new mongoose.Schema({
  produtoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Produto', required: true },
  quantidade: { type: Number, required: true },
  data: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Pedido', PedidoSchema);
