# Base de Dados Local para Testes

Dado que o roadmap (`docs/evolucao.md`) e o esquema (`docs/base_dados.md`) já estão escritos para **PostgreSQL**, faz todo o sentido testar com PostgreSQL — assim o que for testado localmente é exatamente o que vai para produção.

O phpMyAdmin é para MySQL/MariaDB, que tem sintaxe diferente em vários pontos (sem `SERIAL`, sem `GENERATED ALWAYS AS ... STORED`, índices parciais diferentes, etc.). Testar em MySQL e depois migrar para PostgreSQL pode esconder problemas.

---

## Recomendação para macOS

| Ferramenta | Para quê | Grátis |
|---|---|---|
| **[Postgres.app](https://postgresapp.com)** | Servidor PostgreSQL local — instala como qualquer app, zero configuração | ✓ |
| **[Postico 2](https://eggerapps.at/postico2/)** | GUI Mac-nativa, muito limpa, boa para explorar tabelas e correr SQL | Freemium |
| **[TablePlus](https://tableplus.com)** | Alternativa ao Postico, suporta múltiplas DBs | Freemium |
| **[pgAdmin 4](https://www.pgadmin.org)** | GUI oficial do PostgreSQL, mais completa mas mais pesada | ✓ |

---

## Setup em 5 minutos

1. Instalar **Postgres.app** → arrasta para Applications, clica "Initialize"
2. Instalar **Postico** ou **TablePlus** → ligar a `localhost:5432`
3. Criar base de dados `maquinagem_dev`
4. Colar o SQL de `docs/base_dados.md` e executar

Quando chegar a fase de Node/Express + Prisma, a transição é direta porque o schema já estará testado no motor correto.
