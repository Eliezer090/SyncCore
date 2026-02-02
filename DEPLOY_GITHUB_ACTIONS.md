# 🚀 Migração do Build: EasyPanel → GitHub Actions

Este guia explica como migrar o processo de build do Docker do EasyPanel para o GitHub Actions, reduzindo o consumo de recursos no servidor e evitando quedas durante o deploy.

## 📋 Resumo da Mudança

| Antes | Depois |
|-------|--------|
| Build no servidor (EasyPanel) | Build no GitHub Actions |
| Consumo alto de CPU/RAM no deploy | Deploy apenas baixa imagem pronta |
| ~5-10 min de downtime | Deploy em ~30 segundos |
| Servidor fica lento durante build | Servidor não é afetado |

---

## 🔧 Passo 1: Configurar Secrets no GitHub

Acesse seu repositório no GitHub:
1. Vá em **Settings** → **Secrets and variables** → **Actions**
2. Clique em **New repository secret**
3. Adicione cada secret abaixo:

### Secrets Obrigatórios

| Nome do Secret | Descrição | Exemplo |
|----------------|-----------|---------|
| `DB_HOST` | Host do PostgreSQL | `72.60.48.193` |
| `DB_PORT` | Porta do PostgreSQL | `578` |
| `DB_NAME` | Nome do banco | `postgres` |
| `DB_USER` | Usuário do banco | `postgres` |
| `DB_PASSWORD` | Senha do banco | `sua_senha` |
| `NEXT_PUBLIC_SITE_URL` | URL pública do site | `https://app.seudominio.com` |
| `JWT_SECRET` | Chave secreta JWT | `sua_chave_secreta_32_chars` |
| `IMAGEKIT_PUBLIC_KEY` | Chave pública ImageKit | `public_xxx` |
| `IMAGEKIT_PRIVATE_KEY` | Chave privada ImageKit | `private_xxx` |
| `IMAGEKIT_URL_ENDPOINT` | URL do ImageKit | `https://ik.imagekit.io/xxx` |
| `RESEND_API_KEY` | API Key do Resend | `re_xxx` |
| `FROM_EMAIL` | Email remetente | `noreply@seudominio.com` |

### Secrets Opcionais (Novas Integrações)

| Nome do Secret | Descrição | Exemplo |
|----------------|-----------|---------|
| `EVOLUTION_API_URL` | URL da Evolution API | `http://evolution:8080` |
| `EVOLUTION_API_KEY` | API Key da Evolution | `sua_api_key` |
| `N8N_WEBHOOK_URL` | Webhook do N8N | `https://n8n.xxx/webhook/xxx` |
| `RABBITMQ_URL` | URL do RabbitMQ | `amqp://user:pass@host:5672` |
| `WEBHOOK_SECRET` | Secret para webhooks | `sua_chave_webhook` |

---

## 🔧 Passo 2: Habilitar GitHub Container Registry

O GitHub Container Registry (ghcr.io) já está habilitado por padrão. A primeira vez que o workflow rodar, a imagem será criada automaticamente.

---

## 🔧 Passo 3: Fazer Push para Disparar o Build

```bash
# Commit suas alterações
git add .
git commit -m "ci: migrar build para GitHub Actions"

# Push para a branch main/master
git push origin main
```

O workflow será disparado automaticamente e você pode acompanhar em:
**GitHub → Actions → Build and Push Docker Image**

---

## 🔧 Passo 4: Configurar EasyPanel

### 4.1 Obter o Nome da Imagem

Após o primeiro build, sua imagem estará em:
```
ghcr.io/SEU_USUARIO/SEU_REPOSITORIO:latest
```

Exemplo:
```
ghcr.io/empresa/synccore:latest
```

### 4.2 Criar Token de Acesso (se repositório privado)

Se seu repositório for **privado**, crie um Personal Access Token:

1. GitHub → **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
2. **Generate new token (classic)**
3. Selecione o scope: `read:packages`
4. Copie o token gerado

### 4.3 Configurar no EasyPanel

1. Acesse o EasyPanel
2. Vá no seu App/Service
3. Mude o **Source** de "GitHub" para **"Docker Image"**
4. Configure:

```
Image: ghcr.io/SEU_USUARIO/SEU_REPOSITORIO:latest

# Se repositório privado, adicione Registry:
Registry URL: ghcr.io
Username: SEU_USUARIO_GITHUB
Password: TOKEN_CRIADO_NO_PASSO_4.2
```

5. **Importante**: Configure as variáveis de ambiente de runtime:

```env
NODE_ENV=production
PORT=3000

# Banco de dados (runtime)
DB_HOST=72.60.48.193
DB_PORT=578
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=sua_senha

# Outras variáveis de runtime
JWT_SECRET=sua_chave
EVOLUTION_API_URL=http://evolution:8080
EVOLUTION_API_KEY=sua_key
N8N_WEBHOOK_URL=https://n8n.xxx/webhook
RABBITMQ_URL=amqp://user:pass@host:5672
WEBHOOK_SECRET=sua_chave
```

6. Clique em **Deploy**

---

## 🔄 Passo 5: Configurar Deploy Automático (Webhook)

Para o EasyPanel atualizar automaticamente quando uma nova imagem for publicada:

### 5.1 Obter Webhook URL do EasyPanel

1. No EasyPanel, vá no seu App
2. Vá em **Settings** → **Webhooks** ou **Auto Deploy**
3. Copie a URL do webhook (algo como `https://easypanel.xxx/api/webhook/xxx`)

### 5.2 Adicionar ao GitHub Actions

Adicione um novo job no workflow (`.github/workflows/docker-build.yml`):

```yaml
  notify-easypanel:
    needs: build-and-push
    runs-on: ubuntu-latest
    steps:
      - name: Trigger EasyPanel Deploy
        run: |
          curl -X POST "${{ secrets.EASYPANEL_WEBHOOK_URL }}" \
            -H "Content-Type: application/json" \
            -d '{"action": "deploy"}'
```

E adicione o secret `EASYPANEL_WEBHOOK_URL` no GitHub.

---

## ✅ Verificação

Após configurar tudo, verifique:

1. **GitHub Actions**: Build passa sem erros ✅
2. **GitHub Packages**: Imagem aparece em `github.com/SEU_USER/SEU_REPO/packages` ✅
3. **EasyPanel**: App roda com a nova imagem ✅

---

## 🐛 Troubleshooting

### Erro: "unauthorized" ao puxar imagem

- Verifique se o token tem permissão `read:packages`
- Verifique se username/password estão corretos no EasyPanel

### Erro: Build falha no GitHub Actions

- Verifique se todos os secrets estão configurados
- Veja os logs detalhados na aba Actions

### Imagem não atualiza no EasyPanel

- Verifique se está usando tag `:latest`
- Force um redeploy manual
- Configure o webhook de auto-deploy

---

## 📊 Benefícios

| Métrica | Antes | Depois |
|---------|-------|--------|
| Tempo de Deploy | 5-10 min | ~30 seg |
| CPU durante deploy | 100% | 0% |
| RAM durante deploy | 2-4 GB | 0 |
| Downtime | Frequente | Zero |
| Cache de build | Não | Sim (GitHub) |

---

## 📝 Notas Importantes

1. **Variáveis de Build vs Runtime**: 
   - Secrets no GitHub = usados durante o BUILD
   - Variáveis no EasyPanel = usados em RUNTIME
   - `NEXT_PUBLIC_*` são embedadas no build, outras são de runtime

2. **Tags de Imagem**:
   - `:latest` = última versão da branch principal
   - `:sha-xxxxx` = versão específica de um commit
   - `:v1.0.0` = versão de uma tag

3. **Rollback**: Para voltar uma versão, mude a tag no EasyPanel para um SHA anterior
