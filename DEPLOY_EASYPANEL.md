# 🚀 Deploy no Easypanel

Guia completo para fazer deploy do SyncCore no Easypanel.

## 📋 Pré-requisitos

- VPS com Easypanel instalado
- Repositório Git (GitHub, GitLab, etc.)
- Banco PostgreSQL (pode ser no próprio Easypanel)

## 🗄️ Passo 1: Configurar Banco de Dados PostgreSQL

### Opção A: PostgreSQL no Easypanel

1. No Easypanel, vá em **Templates** → **Databases**
2. Selecione **PostgreSQL**
3. Configure:
   - **Name**: `synccore-db`
   - **Password**: Gere uma senha forte
4. Clique em **Create**
5. Anote as credenciais geradas

### Opção B: Usar seu PostgreSQL existente

Se já tem um PostgreSQL, apenas anote as credenciais:
- Host, Porta, Database, Usuário, Senha

## 📦 Passo 2: Criar Aplicação no Easypanel

1. No Easypanel, clique em **+ New Project**
2. Nome: `synccore`
3. Dentro do projeto, clique em **+ New Service** → **App**

### Configurar Source

1. **Source**: GitHub (ou GitLab)
2. Conecte sua conta do GitHub se ainda não conectou
3. Selecione o repositório do SyncCore
4. **Branch**: `main` (ou sua branch de produção)

### Configurar Build

1. **Build Type**: Dockerfile
2. **Dockerfile Path**: `Dockerfile` (padrão)
3. O Easypanel detectará automaticamente o Dockerfile

## ⚙️ Passo 3: Configurar Variáveis de Ambiente

No Easypanel, vá em **Environment** e adicione:

```env
# Banco de Dados
DB_HOST=seu_host_postgres
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=sua_senha

# JWT (gere com: openssl rand -base64 32)
JWT_SECRET=sua_chave_jwt_secreta_aqui_com_32_caracteres_ou_mais

# URL do Site
NEXT_PUBLIC_SITE_URL=https://seudominio.com.br

# ImageKit.io
IMAGEKIT_PUBLIC_KEY=public_sua_key
IMAGEKIT_PRIVATE_KEY=private_sua_key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/sua_conta

# Resend (E-mails)
RESEND_API_KEY=re_sua_api_key
FROM_EMAIL=noreply@seudominio.com.br
```

### Se usando PostgreSQL do Easypanel:

O host será algo como: `synccore-db.internal` ou o nome do container.
Você pode ver isso nas configurações do serviço PostgreSQL.

## 🌐 Passo 4: Configurar Domínio

1. Vá em **Domains** no serviço
2. Clique em **+ Add Domain**
3. Configure:
   - **Domain**: `app.seudominio.com.br` (ou seu domínio)
   - **HTTPS**: Ativado
   - **Force HTTPS**: Ativado

### Configurar DNS

No seu provedor de DNS (Cloudflare, etc.), adicione:

```
Tipo: A
Nome: app (ou @ para raiz)
Valor: IP_DA_SUA_VPS
TTL: Auto
```

Ou se usar Cloudflare com proxy:

```
Tipo: CNAME
Nome: app
Valor: seudominio.com.br
Proxy: Ativado (laranja)
```

## 🔧 Passo 5: Configurar Recursos (Opcional)

Em **Resources**:

- **Memory**: 512MB - 1GB (recomendado)
- **CPU**: 0.5 - 1 core

## 🚀 Passo 6: Deploy

1. Clique em **Deploy**
2. Aguarde o build (primeira vez pode demorar ~5 minutos)
3. Verifique os logs se houver erro

## ✅ Verificar Deploy

1. Acesse seu domínio: `https://app.seudominio.com.br`
2. Verifique se a página de login carrega
3. Tente fazer login

## 🔄 Atualizações Automáticas

### Ativar Auto Deploy

1. Vá em **Source** → **Settings**
2. Ative **Auto Deploy**
3. Selecione a branch (ex: `main`)

Agora, cada push para a branch `main` fará deploy automático!

### Ou Deploy Manual

1. Vá no serviço
2. Clique em **Rebuild**

## 🐛 Troubleshooting

### Erro de Build

Verifique os logs de build em **Deployments** → selecione o deployment → **Build Logs**

### Erro de Runtime

Verifique em **Logs** no serviço

### Problemas Comuns

1. **Erro de conexão com banco**
   - Verifique se DB_HOST está correto
   - Se PostgreSQL está no Easypanel, use o nome interno (ex: `synccore-db`)

2. **Variáveis de ambiente não funcionam**
   - Certifique-se de fazer Rebuild após alterar variáveis
   - Variáveis com `NEXT_PUBLIC_` são injetadas no build

3. **Erro 502 Bad Gateway**
   - Aguarde o container iniciar completamente
   - Verifique se a porta 3000 está configurada

4. **Imagens não carregam**
   - Verifique as credenciais do ImageKit
   - Confirme que os domínios estão em `next.config.mjs`

## 📊 Monitoramento

### Health Check

Configure em **Health Checks**:
- **Path**: `/api/health` (se tiver) ou `/`
- **Interval**: 30s
- **Timeout**: 10s

### Logs

Acesse logs em tempo real em **Logs** no serviço.

## 🔐 Segurança

### Recomendações

1. **JWT_SECRET**: Use uma chave forte de pelo menos 32 caracteres
2. **Senhas do banco**: Use senhas complexas
3. **HTTPS**: Sempre ativo em produção
4. **Variáveis sensíveis**: Nunca commite no repositório

### Gerar JWT Secret

```bash
# Linux/Mac
openssl rand -base64 32

# Ou use: https://generate-secret.vercel.app/32
```

## 📁 Arquivos de Configuração

```
├── Dockerfile          # Configuração do container
├── .dockerignore       # Arquivos ignorados no build
├── next.config.mjs     # Configuração do Next.js (standalone)
└── .env.example        # Exemplo de variáveis de ambiente
```

## 🎉 Pronto!

Seu SyncCore está rodando no Easypanel!

### Próximos Passos

1. Configure backup do banco de dados
2. Configure monitoramento (Uptime Robot, etc.)
3. Configure alertas de erro (Sentry, etc.)
