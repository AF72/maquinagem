-- AlterTable
ALTER TABLE "ordens_trabalho" ADD COLUMN     "data_limite_entrega" DATE,
ADD COLUMN     "n_ft" VARCHAR(50),
ADD COLUMN     "n_gt" VARCHAR(50),
ADD COLUMN     "observacoes" TEXT;
