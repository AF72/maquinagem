-- CreateTable
CREATE TABLE "historico_precos_mp" (
    "id"               SERIAL NOT NULL,
    "materia_prima_id" INTEGER NOT NULL,
    "preco_kg"         DECIMAL(10,2) NOT NULL,
    "data"             DATE NOT NULL DEFAULT CURRENT_DATE,
    "notas"            TEXT,
    "criado_em"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historico_precos_mp_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "pecas" ADD COLUMN "preco_mp_snapshot" DECIMAL(10,2);

-- AddForeignKey
ALTER TABLE "historico_precos_mp" ADD CONSTRAINT "historico_precos_mp_materia_prima_id_fkey"
    FOREIGN KEY ("materia_prima_id") REFERENCES "materia_prima"("id") ON DELETE CASCADE ON UPDATE CASCADE;
