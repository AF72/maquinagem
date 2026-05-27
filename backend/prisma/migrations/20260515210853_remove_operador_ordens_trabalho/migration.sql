-- CreateTable
CREATE TABLE "materia_prima" (
    "id" SERIAL NOT NULL,
    "ref_wnr" VARCHAR(20),
    "peso_esp" DECIMAL(6,3),
    "ref_din" VARCHAR(50),
    "ref_bs" VARCHAR(50),
    "ref_afnor" VARCHAR(50),
    "ref_une" VARCHAR(50),
    "ref_aisi" VARCHAR(50),
    "ref_jis" VARCHAR(50),
    "tipo_tt" VARCHAR(150),

    CONSTRAINT "materia_prima_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "empresas" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(150) NOT NULL,
    "nif" VARCHAR(20),
    "morada" VARCHAR(255),
    "codigo_postal" VARCHAR(20),
    "localidade" VARCHAR(100),
    "email" VARCHAR(150),
    "tel" VARCHAR(30),
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "empresas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "particulares" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(150) NOT NULL,
    "cc" VARCHAR(20),
    "morada" VARCHAR(255),
    "codigo_postal" VARCHAR(20),
    "localidade" VARCHAR(100),
    "email" VARCHAR(150),
    "tel" VARCHAR(30),
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "particulares_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dados_pedido" (
    "id" SERIAL NOT NULL,
    "ref" VARCHAR(30) NOT NULL,
    "equipamento" VARCHAR(100),
    "orgao" VARCHAR(100),
    "parte" VARCHAR(100),
    "breve_descricao" VARCHAR(255),
    "imagem" VARCHAR(255),
    "tipo_contacto" VARCHAR(50),
    "ordem_compra" VARCHAR(50),
    "data_rececao_oc" DATE,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dados_pedido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "servicos" (
    "id" SERIAL NOT NULL,
    "ref" VARCHAR(50) NOT NULL,
    "tipo_servico" VARCHAR(100) NOT NULL,
    "descricao" TEXT,
    "unidade" VARCHAR(20) DEFAULT 'un',
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "servicos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "colaboradores_dm" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(150) NOT NULL,
    "funcao" VARCHAR(100),
    "contacto" VARCHAR(150),
    "estado" VARCHAR(10) NOT NULL DEFAULT 'ativo',
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "colaboradores_dm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "colaboradores" (
    "id" SERIAL NOT NULL,
    "empresa_id" INTEGER NOT NULL,
    "nome" VARCHAR(150) NOT NULL,
    "cargo" VARCHAR(100),
    "email" VARCHAR(150),
    "tel" VARCHAR(30),
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "colaboradores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pecas" (
    "id" SERIAL NOT NULL,
    "ref" VARCHAR(50) NOT NULL,
    "plano" VARCHAR(100),
    "denominacao" VARCHAR(150) NOT NULL,
    "orgao" VARCHAR(100),
    "parte" VARCHAR(100),
    "materia_prima_id" INTEGER,
    "forma" VARCHAR(20),
    "comprimento" DECIMAL(10,2),
    "largura" DECIMAL(10,2),
    "altura" DECIMAL(10,2),
    "diametro_ext" DECIMAL(10,2),
    "diametro_int" DECIMAL(10,2),
    "nota_descritiva" TEXT,
    "imagem" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pecas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedidos" (
    "id" SERIAL NOT NULL,
    "ref" VARCHAR(20) NOT NULL,
    "cliente_tipo" VARCHAR(20) NOT NULL,
    "colaborador_id" INTEGER,
    "particular_id" INTEGER,
    "dados_pedido_id" INTEGER NOT NULL,
    "estado_pedido" VARCHAR(30) NOT NULL DEFAULT 'Orçamentar',
    "data_pedido" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "observacoes" TEXT,
    "custo_liquido" DECIMAL(10,2),
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pedidos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ordens_trabalho" (
    "id" SERIAL NOT NULL,
    "num" VARCHAR(20) NOT NULL,
    "pedido_id" INTEGER NOT NULL,
    "estado" VARCHAR(30) NOT NULL DEFAULT 'Em curso',
    "prazo" DATE,
    "mo_obra" DECIMAL(10,2) DEFAULT 0,
    "notas" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "concluido_em" TIMESTAMP(3),

    CONSTRAINT "ordens_trabalho_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pecas_pedidos" (
    "id" SERIAL NOT NULL,
    "peca_id" INTEGER NOT NULL,
    "pedido_id" INTEGER NOT NULL,

    CONSTRAINT "pecas_pedidos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orcamentos" (
    "id" SERIAL NOT NULL,
    "pedido_id" INTEGER NOT NULL,
    "ref" VARCHAR(30) NOT NULL,
    "data_emissao" DATE DEFAULT CURRENT_TIMESTAMP,
    "data_validade" DATE,
    "estado" VARCHAR(20) DEFAULT 'Pendente',
    "ativo" BOOLEAN DEFAULT false,
    "total_liquido" DECIMAL(12,2) DEFAULT 0,
    "observacoes" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "orcamentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orcamento_itens" (
    "id" SERIAL NOT NULL,
    "orcamento_id" INTEGER NOT NULL,
    "item_tipo" VARCHAR(20) NOT NULL,
    "peca_id" INTEGER,
    "servico_id" INTEGER,
    "quantidade" DECIMAL(10,2) NOT NULL DEFAULT 1,
    "valor_unitario" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "unidade" VARCHAR(20),

    CONSTRAINT "orcamento_itens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notas_pedido" (
    "id" SERIAL NOT NULL,
    "pedido_id" INTEGER NOT NULL,
    "colaborador_dm_id" INTEGER NOT NULL,
    "data" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nota" TEXT NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notas_pedido_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "empresas_nif_key" ON "empresas"("nif");

-- CreateIndex
CREATE UNIQUE INDEX "particulares_cc_key" ON "particulares"("cc");

-- CreateIndex
CREATE UNIQUE INDEX "dados_pedido_ref_key" ON "dados_pedido"("ref");

-- CreateIndex
CREATE UNIQUE INDEX "servicos_ref_key" ON "servicos"("ref");

-- CreateIndex
CREATE UNIQUE INDEX "pecas_ref_key" ON "pecas"("ref");

-- CreateIndex
CREATE UNIQUE INDEX "pedidos_ref_key" ON "pedidos"("ref");

-- CreateIndex
CREATE UNIQUE INDEX "ordens_trabalho_num_key" ON "ordens_trabalho"("num");

-- CreateIndex
CREATE UNIQUE INDEX "pecas_pedidos_peca_id_pedido_id_key" ON "pecas_pedidos"("peca_id", "pedido_id");

-- CreateIndex
CREATE UNIQUE INDEX "orcamentos_ref_key" ON "orcamentos"("ref");

-- AddForeignKey
ALTER TABLE "colaboradores" ADD CONSTRAINT "colaboradores_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pecas" ADD CONSTRAINT "pecas_materia_prima_id_fkey" FOREIGN KEY ("materia_prima_id") REFERENCES "materia_prima"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_colaborador_id_fkey" FOREIGN KEY ("colaborador_id") REFERENCES "colaboradores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_particular_id_fkey" FOREIGN KEY ("particular_id") REFERENCES "particulares"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_dados_pedido_id_fkey" FOREIGN KEY ("dados_pedido_id") REFERENCES "dados_pedido"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordens_trabalho" ADD CONSTRAINT "ordens_trabalho_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedidos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pecas_pedidos" ADD CONSTRAINT "pecas_pedidos_peca_id_fkey" FOREIGN KEY ("peca_id") REFERENCES "pecas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pecas_pedidos" ADD CONSTRAINT "pecas_pedidos_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedidos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orcamentos" ADD CONSTRAINT "orcamentos_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedidos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orcamento_itens" ADD CONSTRAINT "orcamento_itens_orcamento_id_fkey" FOREIGN KEY ("orcamento_id") REFERENCES "orcamentos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orcamento_itens" ADD CONSTRAINT "orcamento_itens_peca_id_fkey" FOREIGN KEY ("peca_id") REFERENCES "pecas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orcamento_itens" ADD CONSTRAINT "orcamento_itens_servico_id_fkey" FOREIGN KEY ("servico_id") REFERENCES "servicos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notas_pedido" ADD CONSTRAINT "notas_pedido_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedidos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notas_pedido" ADD CONSTRAINT "notas_pedido_colaborador_dm_id_fkey" FOREIGN KEY ("colaborador_dm_id") REFERENCES "colaboradores_dm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
