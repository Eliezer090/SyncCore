# Estágio 1: Instalação de dependências
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Instalar pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copiar arquivos de dependências
COPY package.json pnpm-lock.yaml ./

# Instalar dependências
RUN pnpm install --frozen-lockfile

# Estágio 2: Build da aplicação
FROM node:20-alpine AS builder
WORKDIR /app

# Instalar pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copiar dependências do estágio anterior
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variáveis de ambiente para build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Argumentos de build que serão convertidos em variáveis de ambiente
ARG DB_HOST
ARG DB_PORT
ARG DB_NAME
ARG DB_USER
ARG DB_PASSWORD
ARG NEXT_PUBLIC_SITE_URL
ARG JWT_SECRET
ARG IMAGEKIT_PUBLIC_KEY
ARG IMAGEKIT_PRIVATE_KEY
ARG IMAGEKIT_URL_ENDPOINT
ARG RESEND_API_KEY
ARG FROM_EMAIL

# Converter ARGs em ENVs para o build
ENV DB_HOST=$DB_HOST
ENV DB_PORT=$DB_PORT
ENV DB_NAME=$DB_NAME
ENV DB_USER=$DB_USER
ENV DB_PASSWORD=$DB_PASSWORD
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV JWT_SECRET=$JWT_SECRET
ENV IMAGEKIT_PUBLIC_KEY=$IMAGEKIT_PUBLIC_KEY
ENV IMAGEKIT_PRIVATE_KEY=$IMAGEKIT_PRIVATE_KEY
ENV IMAGEKIT_URL_ENDPOINT=$IMAGEKIT_URL_ENDPOINT
ENV RESEND_API_KEY=$RESEND_API_KEY
ENV FROM_EMAIL=$FROM_EMAIL

# Build da aplicação
RUN pnpm build

# Estágio 3: Runner de produção
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Criar usuário não-root para segurança
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar arquivos públicos
COPY --from=builder /app/public ./public

# Configurar permissões para o cache do Next.js
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copiar build output (standalone mode)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
