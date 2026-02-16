'use client';

import * as React from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { GearSix as GearIcon } from '@phosphor-icons/react/dist/ssr/GearSix';

interface RabbitStatus {
  configured: boolean;
  url: string | null;
  timestamp: string;
}

interface ConsumerStatus {
  consumerStarted: boolean;
  consumerError: string | null;
  rabbitmqConfigured: boolean;
}

interface TestResult {
  success: boolean;
  message?: string;
  error?: string;
  data?: Record<string, unknown>;
}

export function TestRabbitMQ(): React.JSX.Element {
  const [status, setStatus] = React.useState<RabbitStatus | null>(null);
  const [consumerStatus, setConsumerStatus] = React.useState<ConsumerStatus | null>(null);
  const [testResult, setTestResult] = React.useState<TestResult | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [startingConsumer, setStartingConsumer] = React.useState(false);
  const [checking, setChecking] = React.useState(true);

  // Verificar status ao montar
  React.useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    setChecking(true);
    try {
      const [rabbitRes, consumerRes] = await Promise.all([
        fetch('/api/admin/test-rabbitmq'),
        fetch('/api/admin/start-consumer')
      ]);
      const rabbitData = await rabbitRes.json();
      const consumerData = await consumerRes.json();
      setStatus(rabbitData);
      setConsumerStatus(consumerData);
    } catch (error) {
      console.error('Erro ao verificar status:', error);
    } finally {
      setChecking(false);
    }
  };

  const startConsumer = async () => {
    setStartingConsumer(true);
    try {
      const response = await fetch('/api/admin/start-consumer', {
        method: 'POST'
      });
      const data = await response.json();
      if (data.success) {
        setConsumerStatus(prev => prev ? { ...prev, consumerStarted: true, consumerError: null } : null);
        setTestResult({ success: true, message: data.message });
      } else {
        setTestResult({ success: false, error: data.error });
      }
    } catch (error) {
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao iniciar consumer'
      });
    } finally {
      setStartingConsumer(false);
    }
  };

  const sendTestMessage = async () => {
    setLoading(true);
    setTestResult(null);
    
    try {
      const response = await fetch('/api/admin/test-rabbitmq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empresa_id: 1,
          cliente_id: 1
        })
      });
      
      const data = await response.json();
      setTestResult(data);
    } catch (error) {
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : 'Erro de conexão'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader
        avatar={<GearIcon fontSize="var(--icon-fontSize-lg)" />}
        subheader="Teste de comunicação com RabbitMQ (remover em produção)"
        title="🐰 Teste RabbitMQ"
      />
      <Divider />
      <CardContent>
        <Stack spacing={2}>
          {/* Status */}
          {checking ? (
            <Typography color="text.secondary">Verificando status...</Typography>
          ) : (
            <>
              {status ? (
                <Alert severity={status.configured ? 'success' : 'warning'}>
                  <strong>RabbitMQ:</strong> {status.configured ? 'Configurado' : 'Não configurado'}
                  {status.url && (
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      URL: {status.url}
                    </Typography>
                  )}
                </Alert>
              ) : (
                <Alert severity="error">Erro ao verificar status do RabbitMQ</Alert>
              )}
              
              {consumerStatus && (
                <Alert severity={consumerStatus.consumerStarted ? 'success' : 'warning'}>
                  <strong>Consumer:</strong> {consumerStatus.consumerStarted ? '✅ Rodando' : '⚠️ Não iniciado'}
                  {consumerStatus.consumerError && (
                    <Typography variant="body2" color="error" sx={{ mt: 0.5 }}>
                      Erro: {consumerStatus.consumerError}
                    </Typography>
                  )}
                </Alert>
              )}
            </>
          )}

          {/* Resultado do teste */}
          {testResult && (
            <Alert severity={testResult.success ? 'success' : 'error'}>
              <strong>{testResult.success ? '✅ Sucesso!' : '❌ Erro!'}</strong>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {testResult.success ? testResult.message : testResult.error}
              </Typography>
              {testResult.data ? (
                <Typography variant="caption" component="pre" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
                  {String(JSON.stringify(testResult.data, null, 2))}
                </Typography>
              ) : null}
            </Alert>
          )}

          <Typography variant="body2" color="text.secondary">
            1. Primeiro, inicie o Consumer (se não estiver rodando).<br />
            2. Depois, envie uma mensagem de teste.<br />
            3. Verifique os logs do servidor para ver se a mensagem foi processada.
          </Typography>
        </Stack>
      </CardContent>
      <Divider />
      <CardActions sx={{ justifyContent: 'flex-end', p: 2, gap: 1 }}>
        <Button
          variant="outlined"
          onClick={checkStatus}
          disabled={checking}
        >
          Atualizar Status
        </Button>
        <Button
          variant="contained"
          color="warning"
          onClick={startConsumer}
          disabled={startingConsumer || consumerStatus?.consumerStarted}
          startIcon={startingConsumer ? <CircularProgress size={16} color="inherit" /> : null}
        >
          {consumerStatus?.consumerStarted ? 'Consumer Ativo' : startingConsumer ? 'Iniciando...' : 'Iniciar Consumer'}
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={sendTestMessage}
          disabled={loading || !status?.configured}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
        >
          {loading ? 'Enviando...' : 'Enviar Mensagem'}
        </Button>
      </CardActions>
    </Card>
  );
}
