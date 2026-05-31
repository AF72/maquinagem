ALTER TABLE "colaboradores_dm" ADD COLUMN IF NOT EXISTS "email" VARCHAR(150);
ALTER TABLE "colaboradores_dm" ADD COLUMN IF NOT EXISTS "password_hash" VARCHAR(255);
ALTER TABLE "colaboradores_dm" ADD COLUMN IF NOT EXISTS "role" VARCHAR(20) NOT NULL DEFAULT 'operador';
ALTER TABLE "colaboradores_dm" ADD COLUMN IF NOT EXISTS "primeiro_login" BOOLEAN NOT NULL DEFAULT true;

CREATE UNIQUE INDEX IF NOT EXISTS "colaboradores_dm_email_key" ON "colaboradores_dm"("email");
