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
const colaboradoresDmRoutes = require('./routes/colaboradoresDm');
const pecasPedidosRoutes = require('./routes/pecasPedidos');
const notasPedidoRoutes = require('./routes/notasPedido');
const fornecedoresRoutes = require('./routes/fornecedores');
const historicoPrecosRoutes = require('./routes/historicoPrecos');
const servicosRoutes = require('./routes/servicos');
const servicosPedidosRoutes = require('./routes/servicosPedidos');
const processosRoutes = require('./routes/processos');
const pecasProcessosRoutes = require('./routes/pecasProcessos');
const historicoPrecosMateriaPrimaRoutes = require('./routes/historicoPrecosMateriaPrima');

const app = express();

app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));

app.use('/api/empresas', empresasRoutes);
app.use('/api/colaboradores', colaboradoresRoutes);
app.use('/api/dados-pedido', dadosPedidoRoutes);
app.use('/api/particulares', particularesRoutes);
app.use('/api/pecas', pecasRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/ordens', ordensRoutes);
app.use('/api/orcamentos', orcamentosRoutes);
app.use('/api/materia-prima', materiaPrimaRoutes);
app.use('/api/colaboradores-dm', colaboradoresDmRoutes);
app.use('/api/pecas-pedidos', pecasPedidosRoutes);
app.use('/api/notas-pedido', notasPedidoRoutes);
app.use('/api/fornecedores', fornecedoresRoutes);
app.use('/api/historico-precos', historicoPrecosRoutes);
app.use('/api/servicos', servicosRoutes);
app.use('/api/servicos-pedidos', servicosPedidosRoutes);
app.use('/api/processos', processosRoutes);
app.use('/api/pecas-processos', pecasProcessosRoutes);
app.use('/api/historico-precos-mp', historicoPrecosMateriaPrimaRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor a correr na porta ${PORT}`));
