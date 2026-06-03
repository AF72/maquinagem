-- CreateTable
CREATE TABLE "historico_precos_processos" (
    "id"          SERIAL NOT NULL,
    "processo_id" INTEGER NOT NULL,
    "custo_hora"  DECIMAL(10,2) NOT NULL,
    "data"        DATE NOT NULL DEFAULT CURRENT_DATE,
    "notas"       TEXT,
    "criado_em"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historico_precos_processos_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "historico_precos_processos" ADD CONSTRAINT "historico_precos_processos_processo_id_fkey"
    FOREIGN KEY ("processo_id") REFERENCES "processos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
