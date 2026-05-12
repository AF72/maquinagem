require('dotenv').config();
const express = require('express');
const cors = require('cors');

const errorHandler = require('./middleware/errorHandler');
const empresasRoutes = require('./routes/empresas');
const colaboradoresRoutes = require('./routes/colaboradores');
const dadosPedidoRoutes = require('./routes/dadosPedido');
const particularesRoutes = require('./routes/particulares');
const pecasRoutes = require('./routes/pecas');
const pedidosRoutes = require('./routes/pedidos');
const ordensRoutes = require('./routes/ordens');
const orcamentosRoutes = require('./routes/orcamentos');
const materiaPrimaRoutes = require('./routes/materiaPrima');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/empresas', empresasRoutes);
app.use('/api/colaboradores', colaboradoresRoutes);
app.use('/api/dados-pedido', dadosPedidoRoutes);
app.use('/api/particulares', particularesRoutes);
app.use('/api/pecas', pecasRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/ordens', ordensRoutes);
app.use('/api/orcamentos', orcamentosRoutes);
app.use('/api/materia-prima', materiaPrimaRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor a correr na porta ${PORT}`));
