# Pitada de Alecrim - Sistema de Gestão de Restaurante

Sistema interno de gestão para restaurante com controle de pedidos, pratos e caixa.

## Funcionalidades

- ✅ Fazer pedido (Delivery e Mesa)
- ✅ Cadastro de Items (CMS)
- ✅ Alterar Pedido (Delivery e Mesa)
- ✅ Ver histórico de pedidos
- ✅ Ver detalhes do pedido
- ✅ Controle de caixa (Diário, Mensal, Trimestral, Anual)
- ✅ Perfil Garçom e Administrador
- ✅ Encerrar expediente (consolida vendas do dia e limpa pedidos)
- ✅ Marcar prato como indisponível (quando acaba)

## Tecnologias

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Prisma + PostgreSQL (Supabase - banco na nuvem, plano gratuito)
- NextAuth.js (autenticação)

## Instalação

1. Instale as dependências:

```bash
npm install
```

2. Configure as variáveis de ambiente:

```bash
cp .env.example .env
```

Edite o arquivo `.env` e configure:

- `DATABASE_URL`: URL de conexão do Supabase (formato: `postgresql://user:password@host:port/database?schema=public`)
- `NEXTAUTH_SECRET`: Gere uma chave secreta (pode usar: `openssl rand -base64 32`)
- `NEXTAUTH_URL`: URL da aplicação (ex: `http://localhost:3000`)

3. Configure o banco de dados:

```bash
npm run db:push
npm run db:generate
```

4. (Opcional) Popule o banco com dados de exemplo:

```bash
npm run db:seed
```

5. Execute o servidor de desenvolvimento:

```bash
npm run dev
```

6. Acesse [http://localhost:3000](http://localhost:3000)

## Usuários Padrão (após seed)

- **Administrador**:

  - Email: `admin@restaurante.com`
  - Senha: `admin123`

- **Garçom**:
  - Email: `garcom@restaurante.com`
  - Senha: `garcom123`

## Funcionalidades Especiais

### Encerrar Expediente

- Apenas administradores podem encerrar o expediente
- Ao encerrar, o sistema:
  - Calcula todas as vendas do dia
  - Salva um resumo na tabela `DailySummary`
  - Remove todos os pedidos do dia (para economizar espaço)
  - Os dados consolidados ficam disponíveis para consulta histórica

### Marcar Prato como Indisponível

- Na página de Pratos, clique no status do prato para alternar entre disponível/indisponível
- Pratos indisponíveis não aparecem na tela de criar pedido

## Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria build de produção
- `npm run start` - Inicia servidor de produção
- `npm run db:push` - Sincroniza schema com o banco
- `npm run db:studio` - Abre Prisma Studio (interface visual do banco)
- `npm run db:generate` - Gera Prisma Client
- `npm run db:seed` - Popula o banco com dados de exemplo
