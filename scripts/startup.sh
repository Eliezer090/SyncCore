#!/bin/sh
# Script de inicialização que inicia o servidor e o consumer RabbitMQ

echo "🚀 Iniciando aplicação SyncCore..."

# Inicia o servidor Next.js em background
node server.js &
SERVER_PID=$!

echo "⏳ Aguardando servidor iniciar..."

# Detectar a porta (usa PORT do ambiente, fallback para 3000)
APP_PORT=${PORT:-3000}
echo "   Porta detectada: $APP_PORT"

# Aguarda o servidor estar pronto (máximo 30 segundos)
MAX_RETRIES=30
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  # Tenta fazer uma requisição de health check
  if wget -q --spider http://localhost:${APP_PORT}/api/admin/start-consumer 2>/dev/null; then
    echo "✅ Servidor pronto!"
    break
  fi
  
  RETRY_COUNT=$((RETRY_COUNT + 1))
  echo "   Tentativa $RETRY_COUNT/$MAX_RETRIES..."
  sleep 1
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
  echo "⚠️ Timeout aguardando servidor, continuando mesmo assim..."
fi

# Inicia o consumer RabbitMQ chamando o endpoint
echo "🐰 Iniciando consumer RabbitMQ..."

CONSUMER_RESPONSE=$(wget -q -O - --post-data="" http://localhost:${APP_PORT}/api/admin/start-consumer 2>/dev/null)

if echo "$CONSUMER_RESPONSE" | grep -q '"success":true'; then
  echo "✅ Consumer RabbitMQ iniciado com sucesso!"
else
  echo "⚠️ Resposta do consumer: $CONSUMER_RESPONSE"
fi

echo "🎉 Aplicação iniciada! PID do servidor: $SERVER_PID"

# Mantém o script rodando e repassa sinais para o servidor
trap "echo 'Encerrando...'; kill $SERVER_PID; exit 0" SIGTERM SIGINT

# Aguarda o processo do servidor
wait $SERVER_PID
