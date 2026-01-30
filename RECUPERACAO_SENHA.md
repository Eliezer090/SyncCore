# 📧 Sistema de Recuperação de Senha

Sistema completo de recuperação de senha por e-mail usando Resend.

## 🎯 Funcionalidades

- ✅ Solicitação de reset de senha por e-mail
- ✅ E-mail HTML personalizado com branding SyncCore
- ✅ Token único e seguro (expira em 1 hora)
- ✅ Validação de token com proteção contra reutilização
- ✅ Página de confirmação com nova senha
- ✅ Redirecionamento automático para login
- ✅ Mensagens em português
- ✅ Proteção contra enumeração de e-mails

## 📋 Pré-requisitos

### 1. Criar Conta no Resend

1. Acesse [https://resend.com](https://resend.com)
2. Crie uma conta gratuita (100 e-mails/dia)
3. Obtenha sua API Key em **API Keys**

### 2. Configurar Domínio (Opcional mas Recomendado)

**Opção A: Usar domínio próprio**
1. No Resend, vá em **Domains**
2. Adicione seu domínio (ex: `seudominio.com.br`)
3. Configure os registros DNS conforme instruções
4. Aguarde verificação

**Opção B: Usar e-mail de teste**
- Para testes, use `onboarding@resend.dev` como remetente
- ⚠️ Limitado para desenvolvimento apenas

## ⚙️ Configuração

### 1. Variáveis de Ambiente

Edite o arquivo `.env.local` e configure:

```env
# Resend - Envio de E-mails
RESEND_API_KEY=re_SuaApiKeyAqui123456789
FROM_EMAIL=noreply@seudominio.com.br
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Onde encontrar:**
- `RESEND_API_KEY`: Dashboard do Resend > API Keys
- `FROM_EMAIL`: 
  - Se tem domínio verificado: `noreply@seudominio.com.br`
  - Para testes: `onboarding@resend.dev`
- `NEXT_PUBLIC_SITE_URL`: URL do seu site (produção: `https://seusite.com.br`)

### 2. Banco de Dados

A tabela `password_reset_tokens` já foi criada automaticamente. Para recriar:

```bash
node scripts/create-password-reset-table.js
```

## 🚀 Como Usar

### Fluxo do Usuário

1. **Solicitar Recuperação**
   - Acessar `/auth/reset-password`
   - Digitar e-mail cadastrado
   - Clicar em "Enviar link de recuperação"

2. **Receber E-mail**
   - Verificar caixa de entrada (e spam)
   - E-mail contém link válido por 1 hora

3. **Redefinir Senha**
   - Clicar no link do e-mail
   - Digitar nova senha (mínimo 6 caracteres)
   - Confirmar nova senha
   - Ser redirecionado para login

### URLs

- **Solicitar reset**: `/auth/reset-password`
- **Confirmar reset**: `/auth/reset-password/confirm?token=...`
- **Login**: `/auth/sign-in`

## 🔒 Segurança

✅ **Implementado:**
- Token aleatório de 64 caracteres (32 bytes hex)
- Expiração de 1 hora
- Tokens de uso único (não podem ser reutilizados)
- Hash bcrypt para novas senhas
- Invalidação automática de tokens antigos
- Proteção contra enumeração de e-mails
- Validação de força de senha (mínimo 6 caracteres)

## 📁 Arquivos Criados

```
src/
├── app/
│   └── api/
│       └── auth/
│           └── reset-password/
│               ├── route.ts                 # API: solicitar reset
│               └── confirm/
│                   └── route.ts             # API: confirmar reset
└── lib/
    └── email/
        └── password-reset.ts                # Serviço de envio de e-mail

src/components/auth/
├── reset-password-form.tsx                  # Formulário: solicitar reset
└── confirm-reset-password-form.tsx          # Formulário: confirmar reset

src/app/auth/
├── reset-password/
│   ├── page.tsx                             # Página: solicitar reset
│   └── confirm/
│       └── page.tsx                         # Página: confirmar reset

scripts/
├── create-password-reset-table.js           # Script de criação da tabela
└── create-password-reset-table.sql          # SQL da tabela
```

## 🗃️ Estrutura do Banco

```sql
CREATE TABLE password_reset_tokens (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🧪 Testar

### Modo Desenvolvimento

1. Inicie o servidor:
```bash
pnpm dev
```

2. Acesse: http://localhost:3000/auth/reset-password

3. Use um e-mail cadastrado no sistema

4. Verifique o e-mail na caixa de entrada

### Verificar Logs

Os logs aparecem no terminal onde o Next.js está rodando:
- ✅ E-mail enviado com sucesso
- ❌ Erros de envio

### Debug Resend

No dashboard do Resend você pode:
- Ver histórico de e-mails enviados
- Verificar status de entrega
- Ver erros de envio
- Testar domínio

## 🐛 Troubleshooting

### E-mail não chega

1. **Verifique RESEND_API_KEY**
   ```bash
   # No terminal do Next.js, procure por erros
   ```

2. **Verifique FROM_EMAIL**
   - Domínio deve estar verificado no Resend
   - Ou use `onboarding@resend.dev` para testes

3. **Verifique spam**
   - Primeiros e-mails podem ir para spam

4. **Verifique logs no Resend**
   - Dashboard > Emails > ver status

### Token inválido/expirado

- Token expira em 1 hora
- Token só pode ser usado uma vez
- Solicite novo reset se necessário

### Erro de banco de dados

```bash
# Recrie a tabela
node scripts/create-password-reset-table.js
```

## 📧 Personalizar E-mail

Edite o arquivo: `src/lib/email/password-reset.ts`

Você pode personalizar:
- Layout HTML
- Cores e estilos
- Textos e mensagens
- Logo (adicione URL da imagem)
- Tempo de expiração

## 🚀 Produção

### Antes de Ir para Produção

1. ✅ Configure domínio próprio no Resend
2. ✅ Verifique DNS do domínio
3. ✅ Atualize `NEXT_PUBLIC_SITE_URL` para URL de produção
4. ✅ Atualize `FROM_EMAIL` com e-mail do domínio
5. ✅ Teste fluxo completo
6. ✅ Configure monitoramento de e-mails

### Limites Resend

- **Free**: 100 e-mails/dia, 3.000/mês
- **Pro**: $20/mês, 50.000 e-mails/mês
- **Enterprise**: Customizado

## 📊 Manutenção

### Limpar Tokens Expirados

Crie um cron job para limpar tokens antigos:

```sql
-- Deletar tokens com mais de 24 horas
DELETE FROM password_reset_tokens 
WHERE created_at < NOW() - INTERVAL '24 hours';
```

### Monitorar Uso

```sql
-- Tokens criados hoje
SELECT COUNT(*) FROM password_reset_tokens 
WHERE DATE(created_at) = CURRENT_DATE;

-- Tokens usados vs não usados
SELECT used, COUNT(*) 
FROM password_reset_tokens 
GROUP BY used;
```

## 🎨 Customizações Futuras

- [ ] Adicionar logo SyncCore no e-mail
- [ ] Suporte a múltiplos idiomas
- [ ] Rate limiting (prevenir spam)
- [ ] Autenticação de dois fatores (2FA)
- [ ] Notificação de mudança de senha
- [ ] Histórico de alterações de senha
- [ ] Blacklist de senhas comuns

## 📝 Suporte

Em caso de dúvidas:
- Documentação Resend: https://resend.com/docs
- Suporte Resend: support@resend.com
