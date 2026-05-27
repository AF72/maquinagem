function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.name === 'ZodError') {
    return res.status(400).json({ erro: 'Dados inválidos', detalhes: err.errors });
  }

  if (err.code === 'P2002') {
    return res.status(409).json({ erro: 'Já existe um registo com esse valor único' });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({ erro: 'Registo não encontrado' });
  }

  res.status(err.status || 500).json({ erro: err.message || 'Erro interno do servidor' });
}

module.exports = errorHandler;
