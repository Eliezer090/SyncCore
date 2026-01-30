'use client';

import * as React from 'react';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Alert from '@mui/material/Alert';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import {
  Calendar as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  Scissors as ScissorsIcon,
  Clock as ClockIcon,
} from '@phosphor-icons/react/dist/ssr';

import { useUser } from '@/hooks/use-user';
import { useEmpresa } from '@/hooks/use-empresa';
import { LoadingOverlay } from '@/components/core/loading-overlay';
import { getAuthHeaders } from '@/lib/auth/client';

dayjs.locale('pt-br');

interface AgendamentosHoje {
  id: number;
  cliente_nome: string;
  inicio: string;
  fim: string;
  servico_nome: string;
  status: string;
}

interface MetricasProfissional {
  agendamentosHoje: number;
  agendamentosEsteMes: number;
  agendamentosConcluidosEsteMes: number;
  servicosMaisRealizados: { nome: string; quantidade: number }[];
  proximosAgendamentos: AgendamentosHoje[];
}

const statusColors: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  pendente: 'warning',
  confirmado: 'info',
  em_andamento: 'secondary',
  concluido: 'success',
  cancelado: 'error',
};

export default function ProfissionalDashboard(): React.JSX.Element {
  const { user } = useUser();
  const { empresaId } = useEmpresa();
  
  const [metricas, setMetricas] = React.useState<MetricasProfissional | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [agendamentosHoje, setAgendamentosHoje] = React.useState<AgendamentosHoje[]>([]);

  const fetchMetricas = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/profissional/metricas', {
        headers: getAuthHeaders(),
      });
      
      if (response.ok) {
        const data = await response.json();
        setMetricas(data);
        setAgendamentosHoje(data.agendamentosHojeDetalhes || []);
      }
    } catch (error) {
      console.error('Erro ao buscar métricas:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (user?.id) {
      fetchMetricas();
    }
  }, [user?.id, fetchMetricas]);

  if (user?.papel !== 'profissional') {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">
          Este dashboard é específico para profissionais. Você está acessando como {user?.papel}.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative' }}>
      <LoadingOverlay open={loading} message="Carregando seu dashboard..." />
      
      <Stack spacing={3}>
        {/* Header */}
        <Stack spacing={1}>
          <Typography variant="h3">
            Bem-vindo, {user?.nome}!
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            {dayjs().format('dddd, D [de] MMMM [de] YYYY')}
          </Typography>
        </Stack>

        {/* KPIs */}
        <Grid container spacing={3}>
          {/* Agendamentos Hoje */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Stack spacing={1}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 48,
                        height: 48,
                        backgroundColor: 'primary.main',
                        borderRadius: '8px',
                        opacity: 0.1,
                      }}
                    >
                      <CalendarIcon fontSize={24} color="primary" />
                    </Box>
                    <Stack spacing={0}>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Agendamentos Hoje
                      </Typography>
                      <Typography variant="h4">
                        {metricas?.agendamentosHoje ?? 0}
                      </Typography>
                    </Stack>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Agendamentos Este Mês */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Stack spacing={1}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 48,
                        height: 48,
                        backgroundColor: 'info.main',
                        borderRadius: '8px',
                        opacity: 0.1,
                      }}
                    >
                      <CalendarIcon fontSize={24} color="info" />
                    </Box>
                    <Stack spacing={0}>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Agendamentos Este Mês
                      </Typography>
                      <Typography variant="h4">
                        {metricas?.agendamentosEsteMes ?? 0}
                      </Typography>
                    </Stack>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Concluídos Este Mês */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Stack spacing={1}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 48,
                        height: 48,
                        backgroundColor: 'success.main',
                        borderRadius: '8px',
                        opacity: 0.1,
                      }}
                    >
                      <CheckCircleIcon fontSize={24} color="success" />
                    </Box>
                    <Stack spacing={0}>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Concluídos Este Mês
                      </Typography>
                      <Typography variant="h4">
                        {metricas?.agendamentosConcluidosEsteMes ?? 0}
                      </Typography>
                    </Stack>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Taxa de Conclusão */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Stack spacing={1}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 48,
                        height: 48,
                        backgroundColor: 'warning.main',
                        borderRadius: '8px',
                        opacity: 0.1,
                      }}
                    >
                      <CheckCircleIcon fontSize={24} color="warning" />
                    </Box>
                    <Stack spacing={0}>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Taxa de Conclusão
                      </Typography>
                      <Typography variant="h4">
                        {metricas && metricas.agendamentosEsteMes > 0
                          ? Math.round((metricas.agendamentosConcluidosEsteMes / metricas.agendamentosEsteMes) * 100)
                          : 0}
                        %
                      </Typography>
                    </Stack>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Agenda de Hoje e Serviços Mais Realizados */}
        <Grid container spacing={3}>
          {/* Agenda de Hoje */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Card>
              <CardHeader
                title={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CalendarIcon fontSize={24} />
                    <Typography variant="h6">Agenda de Hoje</Typography>
                  </Stack>
                }
              />
              <CardContent>
                {agendamentosHoje.length === 0 ? (
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Nenhum agendamento para hoje.
                  </Typography>
                ) : (
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: 'action.hover' }}>
                        <TableCell>Horário</TableCell>
                        <TableCell>Cliente</TableCell>
                        <TableCell>Serviço</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {agendamentosHoje.map((agendamento) => (
                        <TableRow key={agendamento.id}>
                          <TableCell sx={{ fontWeight: 500 }}>
                            {dayjs(agendamento.inicio).format('HH:mm')} -{' '}
                            {dayjs(agendamento.fim).format('HH:mm')}
                          </TableCell>
                          <TableCell>{agendamento.cliente_nome}</TableCell>
                          <TableCell>{agendamento.servico_nome}</TableCell>
                          <TableCell>
                            <Chip
                              label={agendamento.status}
                              size="small"
                              color={statusColors[agendamento.status] || 'default'}
                              variant="outlined"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Serviços Mais Realizados */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Card>
              <CardHeader
                title={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <ScissorsIcon fontSize={24} />
                    <Typography variant="h6">Top Serviços (Este Mês)</Typography>
                  </Stack>
                }
              />
              <CardContent>
                {!metricas?.servicosMaisRealizados || metricas.servicosMaisRealizados.length === 0 ? (
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Nenhum dado disponível.
                  </Typography>
                ) : (
                  <Stack spacing={2}>
                    {metricas.servicosMaisRealizados.map((servico, index) => (
                      <Stack key={index} spacing={1}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {servico.nome}
                          </Typography>
                          <Chip
                            label={`${servico.quantidade} realizad${servico.quantidade !== 1 ? 'as' : 'a'}`}
                            size="small"
                            variant="outlined"
                          />
                        </Stack>
                      </Stack>
                    ))}
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Stack>
    </Box>
  );
}
