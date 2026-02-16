#!/bin/sh
# Script de inicialização que inicia o servidor e o consumer RabbitMQ

# Capturar sinais antes de tudo
trap "echo 'Encerrando...'; kill $SERVER_PID 2>/dev/null; exit 0" SIGTERM SIGINT

echo "🚀 Iniciando aplicação SyncCore..."

# Detectar a porta (usa PORT do ambiente, fallback para 3000)
APP_PORT=${PORT:-3000}
echo "   Porta: $APP_PORT"

# Inicia o servidor Next.js em background
node server.js &
SERVER_PID=$!

echo "⏳ Aguardando servidor iniciar (porta $APP_PORT)..."

# Aguarda o servidor estar pronto (máximo 30 segundos)
MAX_RETRIES=30
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  # Tenta fazer um GET simples (sem --spider, que faz HEAD e pode não funcionar)
  HTTP_CODE=$(wget -q -O /dev/null -S http://localhost:${APP_PORT}/ 2>&1 | grep "HTTP/" | tail -1 | awk '{print $2}')
  if [ -n "$HTTP_CODE" ]; then
    echo "✅ Servidor pronto! (HTTP $HTTP_CODE)"
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

CONSUMER_RESPONSE=$(wget -q -O - --post-data="" http://localhost:${APP_PORT}/api/admin/start-consumer 2>&1)

if echo "$CONSUMER_RESPONSE" | grep -q '"success":true'; then
  echo "✅ Consumer RabbitMQ iniciado com sucesso!"
else
  echo "⚠️ Resposta do consumer: $CONSUMER_RESPONSE"
fi

echo "🎉 Aplicação iniciada! PID do servidor: $SERVER_PID"

# Aguarda o processo do servidor
wait $SERVER_PID
