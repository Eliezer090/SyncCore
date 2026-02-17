'use client';

import * as React from 'react';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Divider from '@mui/material/Divider';
import { useTheme, alpha } from '@mui/material/styles';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import type { ApexOptions } from 'apexcharts';

import { ChartBar as ChartBarIcon } from '@phosphor-icons/react/dist/ssr/ChartBar';
import { CalendarCheck as CalendarCheckIcon } from '@phosphor-icons/react/dist/ssr/CalendarCheck';
import { CurrencyDollar as CurrencyDollarIcon } from '@phosphor-icons/react/dist/ssr/CurrencyDollar';
import { Users as UsersIcon } from '@phosphor-icons/react/dist/ssr/Users';
import { Scissors as ScissorsIcon } from '@phosphor-icons/react/dist/ssr/Scissors';
import { TrendUp as TrendUpIcon } from '@phosphor-icons/react/dist/ssr/TrendUp';
import { XCircle as XCircleIcon } from '@phosphor-icons/react/dist/ssr/XCircle';
import { Clock as ClockIcon } from '@phosphor-icons/react/dist/ssr/Clock';
import { UserCircle as UserCircleIcon } from '@phosphor-icons/react/dist/ssr/UserCircle';
import { Export as ExportIcon } from '@phosphor-icons/react/dist/ssr/Export';

import { Chart } from '@/components/core/chart';
import { useUser } from '@/hooks/use-user';
import { getAuthHeaders } from '@/lib/auth/client';

dayjs.locale('pt-br');

// ====== Interfaces ======

interface AgendamentoPorProfissional {
  profissional_id: number;
  profissional_nome: string;
  status: string;
  total: number;
}

interface AgendamentoDiario {
  data: string;
  profissional_id: number;
  profissional_nome: string;
  status: string;
  total: number;
}

interface ResumoStatus {
  status: string;
  total: number;
}

interface TaxaCancelamento {
  profissional_id: number;
  profissional_nome: string;
  total_agendamentos: number;
  total_cancelados: number;
  taxa_cancelamento: number;
}

interface FaturamentoPorProfissional {
  profissional_id: number;
  profissional_nome: string;
  total_faturamento: number;
  total_servicos: number;
}

interface ServicoMaisRealizado {
  servico_id: number;
  servico_nome: string;
  total: number;
  receita_total: number;
}

interface HorarioPico {
  hora: number;
  total: number;
}

interface DiaSemana {
  dia_semana: number;
  dia_nome: string;
  total: number;
}

interface ClienteFrequente {
  cliente_id: number;
  cliente_nome: string;
  cliente_telefone: string;
  total_agendamentos: number;
  total_concluidos: number;
  total_gasto: number;
}

interface TicketMedio {
  profissional_id: number;
  profissional_nome: string;
  ticket_medio: number;
  total_atendimentos: number;
}

interface FaturamentoDiario {
  data: string;
  total_faturamento: number;
  total_agendamentos: number;
}

interface NovoCliente {
  data: string;
  total: number;
}

interface RelatorioData {
  agendamentosPorProfissional: AgendamentoPorProfissional[];
  agendamentosDiarios: AgendamentoDiario[];
  resumoAgendamentos: ResumoStatus[];
  taxaCancelamento: TaxaCancelamento[];
  faturamentoPorProfissional: FaturamentoPorProfissional[];
  servicosMaisRealizados: ServicoMaisRealizado[];
  horariosPico: HorarioPico[];
  diasSemana: DiaSemana[];
  clientesFrequentes: ClienteFrequente[];
  ticketMedio: TicketMedio[];
  faturamentoDiario: FaturamentoDiario[];
  novosClientes: NovoCliente[];
}

// ====== Status helpers ======

const statusLabels: Record<string, string> = {
  agendado: 'Agendado',
  pendente: 'Pendente',
  confirmado: 'Confirmado',
  aguardando: 'Aguardando',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
};

const statusColors: Record<string, string> = {
  agendado: '#3b82f6',
  pendente: '#f59e0b',
  confirmado: '#06b6d4',
  aguardando: '#8b5cf6',
  concluido: '#10b981',
  cancelado: '#ef4444',
};

const chipColors: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  agendado: 'primary',
  pendente: 'warning',
  confirmado: 'info',
  aguardando: 'secondary',
  concluido: 'success',
  cancelado: 'error',
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

// ====== Presets de período ======

type PeriodoPreset = '7d' | '15d' | '30d' | '90d' | 'mes_atual' | 'mes_anterior' | 'customizado';

function getPresetDates(preset: PeriodoPreset): { inicio: string; fim: string } {
  const hoje = dayjs();
  switch (preset) {
    case '7d':
      return { inicio: hoje.subtract(7, 'day').format('YYYY-MM-DD'), fim: hoje.format('YYYY-MM-DD') };
    case '15d':
      return { inicio: hoje.subtract(15, 'day').format('YYYY-MM-DD'), fim: hoje.format('YYYY-MM-DD') };
    case '30d':
      return { inicio: hoje.subtract(30, 'day').format('YYYY-MM-DD'), fim: hoje.format('YYYY-MM-DD') };
    case '90d':
      return { inicio: hoje.subtract(90, 'day').format('YYYY-MM-DD'), fim: hoje.format('YYYY-MM-DD') };
    case 'mes_atual':
      return { inicio: hoje.startOf('month').format('YYYY-MM-DD'), fim: hoje.endOf('month').format('YYYY-MM-DD') };
    case 'mes_anterior':
      return {
        inicio: hoje.subtract(1, 'month').startOf('month').format('YYYY-MM-DD'),
        fim: hoje.subtract(1, 'month').endOf('month').format('YYYY-MM-DD'),
      };
    default:
      return { inicio: hoje.subtract(30, 'day').format('YYYY-MM-DD'), fim: hoje.format('YYYY-MM-DD') };
  }
}

// ====== Profissional colors ======

const profissionalColors = [
  '#635bff', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444',
  '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#6366f1',
  '#14b8a6', '#d946ef', '#84cc16', '#e11d48', '#0891b2',
];

// ====== Page Component ======

export default function RelatoriosPage(): React.JSX.Element {
  const theme = useTheme();
  const { user } = useUser();
  const [loading, setLoading] = React.useState(false);
  const [data, setData] = React.useState<RelatorioData | null>(null);
  const [tabAtiva, setTabAtiva] = React.useState(0);

  // Filtros de período
  const [periodoPreset, setPeriodoPreset] = React.useState<PeriodoPreset>('30d');
  const defaults = getPresetDates('30d');
  const [dataInicio, setDataInicio] = React.useState(defaults.inicio);
  const [dataFim, setDataFim] = React.useState(defaults.fim);

  const fetchRelatorios = React.useCallback(async () => {
    setLoading(true);
    try {
      const headers = getAuthHeaders();
      const res = await fetch(`/api/relatorios?data_inicio=${dataInicio}&data_fim=${dataFim}`, { headers });
      if (!res.ok) throw new Error('Erro ao buscar relatórios');
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
    } finally {
      setLoading(false);
    }
  }, [dataInicio, dataFim]);

  React.useEffect(() => {
    fetchRelatorios();
  }, [fetchRelatorios]);

  const handlePeriodoChange = (preset: PeriodoPreset) => {
    setPeriodoPreset(preset);
    if (preset !== 'customizado') {
      const dates = getPresetDates(preset);
      setDataInicio(dates.inicio);
      setDataFim(dates.fim);
    }
  };

  // ====== Computed data ======

  // Agregar agendamentos por profissional (todas as statuses em uma tabela)
  const profissionalResumo = React.useMemo(() => {
    if (!data) return [];
    const map = new Map<number, { 
      id: number; nome: string; 
      agendado: number; pendente: number; confirmado: number; aguardando: number; concluido: number; cancelado: number; total: number;
    }>();
    data.agendamentosPorProfissional.forEach((item) => {
      if (!map.has(item.profissional_id)) {
        map.set(item.profissional_id, {
          id: item.profissional_id,
          nome: item.profissional_nome || 'Sem profissional',
          agendado: 0, pendente: 0, confirmado: 0, aguardando: 0, concluido: 0, cancelado: 0, total: 0,
        });
      }
      const entry = map.get(item.profissional_id)!;
      switch (item.status) {
        case 'agendado': entry.agendado = item.total; break;
        case 'pendente': entry.pendente = item.total; break;
        case 'confirmado': entry.confirmado = item.total; break;
        case 'aguardando': entry.aguardando = item.total; break;
        case 'concluido': entry.concluido = item.total; break;
        case 'cancelado': entry.cancelado = item.total; break;
      }
      entry.total += item.total;
    });
    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [data]);

  // Totais gerais
  const totais = React.useMemo(() => {
    if (!data) return { agendamentos: 0, concluidos: 0, cancelados: 0, faturamento: 0, novosClientes: 0 };
    const ag = data.resumoAgendamentos.reduce((acc, r) => acc + r.total, 0);
    const conc = data.resumoAgendamentos.find(r => r.status === 'concluido')?.total || 0;
    const canc = data.resumoAgendamentos.find(r => r.status === 'cancelado')?.total || 0;
    const fat = data.faturamentoPorProfissional.reduce((acc, f) => acc + f.total_faturamento, 0);
    const nc = data.novosClientes.reduce((acc, n) => acc + n.total, 0);
    return { agendamentos: ag, concluidos: conc, cancelados: canc, faturamento: fat, novosClientes: nc };
  }, [data]);

  // ====== Chart Options ======

  // Gráfico de linha: Agendamentos diários por profissional
  const lineChartData = React.useMemo(() => {
    if (!data) return { series: [] as { name: string; data: number[] }[], categories: [] as string[] };

    // Gerar todas as datas do período
    const dates: string[] = [];
    let current = dayjs(dataInicio);
    const end = dayjs(dataFim);
    while (current.isBefore(end) || current.isSame(end, 'day')) {
      dates.push(current.format('YYYY-MM-DD'));
      current = current.add(1, 'day');
    }

    // Agrupar por profissional
    const profMap = new Map<string, Map<string, number>>();
    data.agendamentosDiarios.forEach((item) => {
      const name = item.profissional_nome || 'Sem profissional';
      if (!profMap.has(name)) profMap.set(name, new Map());
      const dateMap = profMap.get(name)!;
      dateMap.set(item.data, (dateMap.get(item.data) || 0) + item.total);
    });

    const series = Array.from(profMap.entries()).map(([name, dateMap]) => ({
      name,
      data: dates.map(d => dateMap.get(d) || 0),
    }));

    return {
      series,
      categories: dates.map(d => dayjs(d).format('DD/MM')),
    };
  }, [data, dataInicio, dataFim]);

  const lineChartOptions: ApexOptions = {
    chart: { background: 'transparent', toolbar: { show: true }, zoom: { enabled: true } },
    colors: profissionalColors,
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2 },
    grid: { borderColor: theme.palette.divider, strokeDashArray: 2 },
    theme: { mode: theme.palette.mode },
    xaxis: {
      categories: lineChartData.categories,
      labels: { style: { colors: theme.palette.text.secondary }, rotate: -45, rotateAlways: lineChartData.categories.length > 15 },
      axisBorder: { color: theme.palette.divider },
    },
    yaxis: {
      labels: { style: { colors: theme.palette.text.secondary } },
      title: { text: 'Agendamentos', style: { color: theme.palette.text.secondary } },
    },
    legend: { position: 'top', labels: { colors: theme.palette.text.primary } },
    tooltip: { theme: theme.palette.mode },
  };

  // Gráfico de linha por status (concluídos vs cancelados)
  const statusLineData = React.useMemo(() => {
    if (!data) return { series: [] as { name: string; data: number[] }[], categories: [] as string[] };

    const dates: string[] = [];
    let current = dayjs(dataInicio);
    const end = dayjs(dataFim);
    while (current.isBefore(end) || current.isSame(end, 'day')) {
      dates.push(current.format('YYYY-MM-DD'));
      current = current.add(1, 'day');
    }

    const statusMap = new Map<string, Map<string, number>>();
    data.agendamentosDiarios.forEach((item) => {
      const statusLabel = statusLabels[item.status] || item.status;
      if (!statusMap.has(statusLabel)) statusMap.set(statusLabel, new Map());
      const dateMap = statusMap.get(statusLabel)!;
      dateMap.set(item.data, (dateMap.get(item.data) || 0) + item.total);
    });

    const series = Array.from(statusMap.entries()).map(([name, dateMap]) => ({
      name,
      data: dates.map(d => dateMap.get(d) || 0),
    }));

    return { series, categories: dates.map(d => dayjs(d).format('DD/MM')) };
  }, [data, dataInicio, dataFim]);

  const statusLineOptions: ApexOptions = {
    chart: { background: 'transparent', toolbar: { show: true }, zoom: { enabled: true } },
    colors: Object.values(statusColors),
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2 },
    grid: { borderColor: theme.palette.divider, strokeDashArray: 2 },
    theme: { mode: theme.palette.mode },
    xaxis: {
      categories: statusLineData.categories,
      labels: { style: { colors: theme.palette.text.secondary }, rotate: -45, rotateAlways: statusLineData.categories.length > 15 },
      axisBorder: { color: theme.palette.divider },
    },
    yaxis: {
      labels: { style: { colors: theme.palette.text.secondary } },
      title: { text: 'Quantidade', style: { color: theme.palette.text.secondary } },
    },
    legend: { position: 'top', labels: { colors: theme.palette.text.primary } },
    tooltip: { theme: theme.palette.mode },
  };

  // Gráfico donut: Distribuição por status
  const donutData = React.useMemo(() => {
    if (!data) return { series: [] as number[], labels: [] as string[] };
    return {
      series: data.resumoAgendamentos.map(r => r.total),
      labels: data.resumoAgendamentos.map(r => statusLabels[r.status] || r.status),
    };
  }, [data]);

  const donutOptions: ApexOptions = {
    chart: { background: 'transparent' },
    colors: data?.resumoAgendamentos.map(r => statusColors[r.status] || '#9ca3af') || [],
    labels: donutData.labels,
    legend: { position: 'bottom', labels: { colors: theme.palette.text.primary } },
    theme: { mode: theme.palette.mode },
    dataLabels: { enabled: true, formatter: (val: number) => `${val.toFixed(0)}%` },
    plotOptions: { pie: { donut: { size: '60%', labels: { show: true, total: { show: true, label: 'Total', fontSize: '16px', fontWeight: 600, color: theme.palette.text.primary } } } } },
  };

  // Gráfico de barras: Faturamento por profissional
  const faturamentoBarData = React.useMemo(() => {
    if (!data) return { series: [] as { name: string; data: number[] }[], categories: [] as string[] };
    return {
      series: [{ name: 'Faturamento (R$)', data: data.faturamentoPorProfissional.map(f => f.total_faturamento) }],
      categories: data.faturamentoPorProfissional.map(f => f.profissional_nome || 'Sem nome'),
    };
  }, [data]);

  const faturamentoBarOptions: ApexOptions = {
    chart: { background: 'transparent', toolbar: { show: false } },
    colors: ['#10b981'],
    plotOptions: { bar: { borderRadius: 4, horizontal: true } },
    dataLabels: { enabled: true, formatter: (val: number) => formatCurrency(val), style: { fontSize: '11px' } },
    grid: { borderColor: theme.palette.divider, strokeDashArray: 2 },
    theme: { mode: theme.palette.mode },
    xaxis: {
      categories: faturamentoBarData.categories,
      labels: { style: { colors: theme.palette.text.secondary }, formatter: (val: string) => formatCurrency(Number(val)) },
    },
    yaxis: { labels: { style: { colors: theme.palette.text.secondary } } },
    tooltip: { theme: theme.palette.mode, y: { formatter: (val: number) => formatCurrency(val) } },
  };

  // Gráfico de barras: Horários pico
  const horarioBarData = React.useMemo(() => {
    if (!data) return { series: [] as { name: string; data: number[] }[], categories: [] as string[] };
    return {
      series: [{ name: 'Agendamentos', data: data.horariosPico.map(h => h.total) }],
      categories: data.horariosPico.map(h => `${String(h.hora).padStart(2, '0')}:00`),
    };
  }, [data]);

  const horarioBarOptions: ApexOptions = {
    chart: { background: 'transparent', toolbar: { show: false } },
    colors: [alpha(theme.palette.primary.main, 0.8)],
    plotOptions: { bar: { borderRadius: 4, columnWidth: '60%' } },
    dataLabels: { enabled: false },
    grid: { borderColor: theme.palette.divider, strokeDashArray: 2 },
    theme: { mode: theme.palette.mode },
    xaxis: {
      categories: horarioBarData.categories,
      labels: { style: { colors: theme.palette.text.secondary } },
    },
    yaxis: { labels: { style: { colors: theme.palette.text.secondary } } },
    tooltip: { theme: theme.palette.mode },
  };

  // Gráfico: Dias da semana
  const diaSemanaData = React.useMemo(() => {
    if (!data) return { series: [] as { name: string; data: number[] }[], categories: [] as string[] };
    return {
      series: [{ name: 'Agendamentos', data: data.diasSemana.map(d => d.total) }],
      categories: data.diasSemana.map(d => d.dia_nome),
    };
  }, [data]);

  const diaSemanaOptions: ApexOptions = {
    chart: { background: 'transparent', toolbar: { show: false } },
    colors: ['#8b5cf6'],
    plotOptions: { bar: { borderRadius: 4, columnWidth: '50%' } },
    dataLabels: { enabled: true },
    grid: { borderColor: theme.palette.divider, strokeDashArray: 2 },
    theme: { mode: theme.palette.mode },
    xaxis: {
      categories: diaSemanaData.categories,
      labels: { style: { colors: theme.palette.text.secondary } },
    },
    yaxis: { labels: { style: { colors: theme.palette.text.secondary } } },
    tooltip: { theme: theme.palette.mode },
  };

  // Gráfico de faturamento diário
  const faturamentoDiarioData = React.useMemo(() => {
    if (!data) return { series: [] as { name: string; data: number[] }[], categories: [] as string[] };
    return {
      series: [
        { name: 'Faturamento (R$)', data: data.faturamentoDiario.map(f => f.total_faturamento) },
      ],
      categories: data.faturamentoDiario.map(f => dayjs(f.data).format('DD/MM')),
    };
  }, [data]);

  const faturamentoDiarioOptions: ApexOptions = {
    chart: { background: 'transparent', toolbar: { show: true }, zoom: { enabled: true } },
    colors: ['#10b981'],
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 3 },
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.1 } },
    grid: { borderColor: theme.palette.divider, strokeDashArray: 2 },
    theme: { mode: theme.palette.mode },
    xaxis: {
      categories: faturamentoDiarioData.categories,
      labels: { style: { colors: theme.palette.text.secondary }, rotate: -45, rotateAlways: faturamentoDiarioData.categories.length > 15 },
      axisBorder: { color: theme.palette.divider },
    },
    yaxis: {
      labels: { style: { colors: theme.palette.text.secondary }, formatter: (val: number) => formatCurrency(val) },
    },
    tooltip: { theme: theme.palette.mode, y: { formatter: (val: number) => formatCurrency(val) } },
  };

  // Gráfico barras: Serviços mais realizados
  const servicosBarData = React.useMemo(() => {
    if (!data) return { series: [] as { name: string; data: number[] }[], categories: [] as string[] };
    return {
      series: [{ name: 'Quantidade', data: data.servicosMaisRealizados.map(s => s.total) }],
      categories: data.servicosMaisRealizados.map(s => s.servico_nome),
    };
  }, [data]);

  const servicosBarOptions: ApexOptions = {
    chart: { background: 'transparent', toolbar: { show: false } },
    colors: ['#06b6d4'],
    plotOptions: { bar: { borderRadius: 4, horizontal: true } },
    dataLabels: { enabled: true },
    grid: { borderColor: theme.palette.divider, strokeDashArray: 2 },
    theme: { mode: theme.palette.mode },
    xaxis: {
      categories: servicosBarData.categories,
      labels: { style: { colors: theme.palette.text.secondary } },
    },
    yaxis: { labels: { style: { colors: theme.palette.text.secondary } } },
    tooltip: { theme: theme.palette.mode },
  };

  // ====== Render ======

  return (
    <Stack spacing={3}>
      {/* Header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar sx={{ bgcolor: '#635bff', width: 48, height: 48 }}>
            <ChartBarIcon size={28} />
          </Avatar>
          <Box>
            <Typography variant="h4">Relatórios Gerenciais</Typography>
            <Typography variant="body2" color="text.secondary">
              Análise completa de agendamentos, faturamento e desempenho
            </Typography>
          </Box>
        </Stack>
      </Stack>

      {/* Filtros de Período */}
      <Card>
        <CardContent>
          <Stack direction="row" alignItems="center" flexWrap="wrap" gap={2}>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Período</InputLabel>
              <Select
                value={periodoPreset}
                label="Período"
                onChange={(e) => handlePeriodoChange(e.target.value as PeriodoPreset)}
              >
                <MenuItem value="7d">Últimos 7 dias</MenuItem>
                <MenuItem value="15d">Últimos 15 dias</MenuItem>
                <MenuItem value="30d">Últimos 30 dias</MenuItem>
                <MenuItem value="90d">Últimos 90 dias</MenuItem>
                <MenuItem value="mes_atual">Mês atual</MenuItem>
                <MenuItem value="mes_anterior">Mês anterior</MenuItem>
                <MenuItem value="customizado">Personalizado</MenuItem>
              </Select>
            </FormControl>

            <TextField
              type="date"
              label="Data Início"
              size="small"
              value={dataInicio}
              onChange={(e) => { setDataInicio(e.target.value); setPeriodoPreset('customizado'); }}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              type="date"
              label="Data Fim"
              size="small"
              value={dataFim}
              onChange={(e) => { setDataFim(e.target.value); setPeriodoPreset('customizado'); }}
              slotProps={{ inputLabel: { shrink: true } }}
            />

            <Button variant="contained" onClick={fetchRelatorios} disabled={loading}>
              {loading ? 'Carregando...' : 'Atualizar'}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {loading && <LinearProgress />}

      {data && !loading && (
        <>
          {/* KPIs Cards */}
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <KpiCard
                title="Total de Agendamentos"
                value={totais.agendamentos}
                icon={<CalendarCheckIcon fontSize="var(--icon-fontSize-lg)" />}
                color="#635bff"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <KpiCard
                title="Concluídos"
                value={totais.concluidos}
                subtitle={totais.agendamentos > 0 ? `${((totais.concluidos / totais.agendamentos) * 100).toFixed(0)}% do total` : undefined}
                icon={<TrendUpIcon fontSize="var(--icon-fontSize-lg)" />}
                color="#10b981"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <KpiCard
                title="Cancelados"
                value={totais.cancelados}
                subtitle={totais.agendamentos > 0 ? `${((totais.cancelados / totais.agendamentos) * 100).toFixed(0)}% do total` : undefined}
                icon={<XCircleIcon fontSize="var(--icon-fontSize-lg)" />}
                color="#ef4444"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <KpiCard
                title="Faturamento Total"
                value={formatCurrency(totais.faturamento)}
                isText
                icon={<CurrencyDollarIcon fontSize="var(--icon-fontSize-lg)" />}
                color="#10b981"
              />
            </Grid>
          </Grid>

          {/* Tabs de Seções */}
          <Card>
            <Tabs
              value={tabAtiva}
              onChange={(_, v) => setTabAtiva(v)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
            >
              <Tab label="Profissionais" icon={<UsersIcon size={18} />} iconPosition="start" />
              <Tab label="Faturamento" icon={<CurrencyDollarIcon size={18} />} iconPosition="start" />
              <Tab label="Serviços" icon={<ScissorsIcon size={18} />} iconPosition="start" />
              <Tab label="Horários & Dias" icon={<ClockIcon size={18} />} iconPosition="start" />
              <Tab label="Clientes" icon={<UserCircleIcon size={18} />} iconPosition="start" />
            </Tabs>
          </Card>

          {/* ==================== TAB 0: PROFISSIONAIS ==================== */}
          {tabAtiva === 0 && (
            <Stack spacing={3}>
              {/* Tabela resumo por profissional */}
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>Agendamentos por Profissional</Typography>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Profissional</TableCell>
                        <TableCell align="center">Agendado</TableCell>
                        <TableCell align="center">Confirmado</TableCell>
                        <TableCell align="center">Concluído</TableCell>
                        <TableCell align="center">Cancelado</TableCell>
                        <TableCell align="center">Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {profissionalResumo.length === 0 ? (
                        <TableRow><TableCell colSpan={6} align="center">Nenhum dado para o período</TableCell></TableRow>
                      ) : (
                        profissionalResumo.map((p) => (
                          <TableRow key={p.id} hover>
                            <TableCell>
                              <Typography variant="body2" fontWeight="medium">{p.nome}</Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Chip label={p.agendado} size="small" color="primary" variant={p.agendado ? 'filled' : 'outlined'} />
                            </TableCell>
                            <TableCell align="center">
                              <Chip label={p.confirmado} size="small" color="info" variant={p.confirmado ? 'filled' : 'outlined'} />
                            </TableCell>
                            <TableCell align="center">
                              <Chip label={p.concluido} size="small" color="success" variant={p.concluido ? 'filled' : 'outlined'} />
                            </TableCell>
                            <TableCell align="center">
                              <Chip label={p.cancelado} size="small" color="error" variant={p.cancelado ? 'filled' : 'outlined'} />
                            </TableCell>
                            <TableCell align="center">
                              <Typography variant="body2" fontWeight="bold">{p.total}</Typography>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Gráfico de linha: Agendamentos diários por profissional */}
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>Agendamentos Diários por Profissional</Typography>
                  {lineChartData.series.length > 0 ? (
                    <Chart
                      height={380}
                      options={lineChartOptions}
                      series={lineChartData.series}
                      type="line"
                      width="100%"
                    />
                  ) : (
                    <Typography color="text.secondary" align="center" sx={{ py: 4 }}>Sem dados para o período</Typography>
                  )}
                </CardContent>
              </Card>

              {/* Gráfico de linha: Status diário */}
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>Evolução Diária por Status</Typography>
                  {statusLineData.series.length > 0 ? (
                    <Chart
                      height={380}
                      options={statusLineOptions}
                      series={statusLineData.series}
                      type="line"
                      width="100%"
                    />
                  ) : (
                    <Typography color="text.secondary" align="center" sx={{ py: 4 }}>Sem dados para o período</Typography>
                  )}
                </CardContent>
              </Card>

              {/* Taxa de cancelamento por profissional */}
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>Taxa de Cancelamento por Profissional</Typography>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Profissional</TableCell>
                        <TableCell align="center">Total Agend.</TableCell>
                        <TableCell align="center">Cancelados</TableCell>
                        <TableCell align="center">Taxa Cancelamento</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.taxaCancelamento.length === 0 ? (
                        <TableRow><TableCell colSpan={4} align="center">Nenhum dado</TableCell></TableRow>
                      ) : (
                        data.taxaCancelamento.map((t) => (
                          <TableRow key={t.profissional_id} hover>
                            <TableCell>{t.profissional_nome || 'Sem nome'}</TableCell>
                            <TableCell align="center">{t.total_agendamentos}</TableCell>
                            <TableCell align="center">
                              <Chip label={t.total_cancelados} size="small" color={t.total_cancelados > 0 ? 'error' : 'default'} />
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                label={`${t.taxa_cancelamento || 0}%`}
                                size="small"
                                color={t.taxa_cancelamento > 20 ? 'error' : t.taxa_cancelamento > 10 ? 'warning' : 'success'}
                              />
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Ticket médio */}
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>Ticket Médio por Profissional</Typography>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Profissional</TableCell>
                        <TableCell align="center">Atendimentos</TableCell>
                        <TableCell align="center">Ticket Médio</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.ticketMedio.length === 0 ? (
                        <TableRow><TableCell colSpan={3} align="center">Nenhum dado</TableCell></TableRow>
                      ) : (
                        data.ticketMedio.map((t) => (
                          <TableRow key={t.profissional_id} hover>
                            <TableCell>{t.profissional_nome || 'Sem nome'}</TableCell>
                            <TableCell align="center">{t.total_atendimentos}</TableCell>
                            <TableCell align="center">
                              <Typography variant="body2" fontWeight="bold" color="success.main">
                                {formatCurrency(t.ticket_medio)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </Stack>
          )}

          {/* ==================== TAB 1: FATURAMENTO ==================== */}
          {tabAtiva === 1 && (
            <Stack spacing={3}>
              {/* Resumo de status (donut) + Faturamento por profissional (bar) */}
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, lg: 5 }}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2 }}>Distribuição por Status</Typography>
                      {donutData.series.length > 0 ? (
                        <Chart
                          height={350}
                          options={donutOptions}
                          series={donutData.series}
                          type="donut"
                          width="100%"
                        />
                      ) : (
                        <Typography color="text.secondary" align="center" sx={{ py: 4 }}>Sem dados</Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, lg: 7 }}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2 }}>Faturamento por Profissional</Typography>
                      {faturamentoBarData.series[0]?.data?.length > 0 ? (
                        <Chart
                          height={350}
                          options={faturamentoBarOptions}
                          series={faturamentoBarData.series}
                          type="bar"
                          width="100%"
                        />
                      ) : (
                        <Typography color="text.secondary" align="center" sx={{ py: 4 }}>Sem dados</Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Faturamento diário */}
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>Faturamento Diário</Typography>
                  {faturamentoDiarioData.series[0]?.data?.length > 0 ? (
                    <Chart
                      height={350}
                      options={faturamentoDiarioOptions}
                      series={faturamentoDiarioData.series}
                      type="area"
                      width="100%"
                    />
                  ) : (
                    <Typography color="text.secondary" align="center" sx={{ py: 4 }}>Sem dados de faturamento</Typography>
                  )}
                </CardContent>
              </Card>

              {/* Tabela detalhada faturamento */}
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>Detalhamento de Faturamento</Typography>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Profissional</TableCell>
                        <TableCell align="center">Serviços Realizados</TableCell>
                        <TableCell align="center">Faturamento</TableCell>
                        <TableCell align="center">Ticket Médio</TableCell>
                        <TableCell align="center">% do Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.faturamentoPorProfissional.length === 0 ? (
                        <TableRow><TableCell colSpan={5} align="center">Nenhum dado</TableCell></TableRow>
                      ) : (
                        data.faturamentoPorProfissional.map((f) => {
                          const pctTotal = totais.faturamento > 0 ? ((f.total_faturamento / totais.faturamento) * 100).toFixed(1) : '0';
                          const ticketM = data.ticketMedio.find(t => t.profissional_id === f.profissional_id);
                          return (
                            <TableRow key={f.profissional_id} hover>
                              <TableCell>
                                <Typography variant="body2" fontWeight="medium">{f.profissional_nome || 'Sem nome'}</Typography>
                              </TableCell>
                              <TableCell align="center">{f.total_servicos}</TableCell>
                              <TableCell align="center">
                                <Typography variant="body2" fontWeight="bold" color="success.main">
                                  {formatCurrency(f.total_faturamento)}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">{formatCurrency(ticketM?.ticket_medio || 0)}</TableCell>
                              <TableCell align="center">
                                <Chip label={`${pctTotal}%`} size="small" variant="outlined" />
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                      {data.faturamentoPorProfissional.length > 0 && (
                        <TableRow sx={{ bgcolor: 'action.hover' }}>
                          <TableCell><Typography variant="body2" fontWeight="bold">TOTAL</Typography></TableCell>
                          <TableCell align="center">
                            <Typography variant="body2" fontWeight="bold">
                              {data.faturamentoPorProfissional.reduce((s, f) => s + f.total_servicos, 0)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2" fontWeight="bold" color="success.main">
                              {formatCurrency(totais.faturamento)}
                            </Typography>
                          </TableCell>
                          <TableCell />
                          <TableCell align="center"><Chip label="100%" size="small" /></TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </Stack>
          )}

          {/* ==================== TAB 2: SERVIÇOS ==================== */}
          {tabAtiva === 2 && (
            <Stack spacing={3}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, lg: 6 }}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2 }}>Serviços Mais Realizados</Typography>
                      {servicosBarData.series[0]?.data?.length > 0 ? (
                        <Chart
                          height={Math.max(300, data.servicosMaisRealizados.length * 45)}
                          options={servicosBarOptions}
                          series={servicosBarData.series}
                          type="bar"
                          width="100%"
                        />
                      ) : (
                        <Typography color="text.secondary" align="center" sx={{ py: 4 }}>Sem dados</Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, lg: 6 }}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2 }}>Ranking de Serviços</Typography>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>#</TableCell>
                            <TableCell>Serviço</TableCell>
                            <TableCell align="center">Quantidade</TableCell>
                            <TableCell align="center">Receita Total</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {data.servicosMaisRealizados.length === 0 ? (
                            <TableRow><TableCell colSpan={4} align="center">Nenhum dado</TableCell></TableRow>
                          ) : (
                            data.servicosMaisRealizados.map((s, idx) => (
                              <TableRow key={s.servico_id} hover>
                                <TableCell>
                                  <Chip
                                    label={idx + 1}
                                    size="small"
                                    color={idx === 0 ? 'warning' : idx === 1 ? 'default' : idx === 2 ? 'info' : 'default'}
                                    variant={idx < 3 ? 'filled' : 'outlined'}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2" fontWeight={idx < 3 ? 'bold' : 'regular'}>
                                    {s.servico_nome}
                                  </Typography>
                                </TableCell>
                                <TableCell align="center">{s.total}</TableCell>
                                <TableCell align="center">
                                  <Typography variant="body2" color="success.main" fontWeight="medium">
                                    {formatCurrency(s.receita_total)}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Stack>
          )}

          {/* ==================== TAB 3: HORÁRIOS & DIAS ==================== */}
          {tabAtiva === 3 && (
            <Stack spacing={3}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, lg: 6 }}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2 }}>Agendamentos por Horário</Typography>
                      {horarioBarData.series[0]?.data?.length > 0 ? (
                        <Chart
                          height={350}
                          options={horarioBarOptions}
                          series={horarioBarData.series}
                          type="bar"
                          width="100%"
                        />
                      ) : (
                        <Typography color="text.secondary" align="center" sx={{ py: 4 }}>Sem dados</Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, lg: 6 }}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2 }}>Agendamentos por Dia da Semana</Typography>
                      {diaSemanaData.series[0]?.data?.length > 0 ? (
                        <Chart
                          height={350}
                          options={diaSemanaOptions}
                          series={diaSemanaData.series}
                          type="bar"
                          width="100%"
                        />
                      ) : (
                        <Typography color="text.secondary" align="center" sx={{ py: 4 }}>Sem dados</Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Stack>
          )}

          {/* ==================== TAB 4: CLIENTES ==================== */}
          {tabAtiva === 4 && (
            <Stack spacing={3}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
                  <KpiCard
                    title="Novos Clientes"
                    value={totais.novosClientes}
                    subtitle="no período selecionado"
                    icon={<UsersIcon fontSize="var(--icon-fontSize-lg)" />}
                    color="#0ea5e9"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
                  <KpiCard
                    title="Clientes Atendidos"
                    value={data.clientesFrequentes.length}
                    subtitle="clientes únicos"
                    icon={<UserCircleIcon fontSize="var(--icon-fontSize-lg)" />}
                    color="#8b5cf6"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
                  <KpiCard
                    title="Receita Média/Cliente"
                    value={data.clientesFrequentes.length > 0
                      ? formatCurrency(data.clientesFrequentes.reduce((s, c) => s + c.total_gasto, 0) / data.clientesFrequentes.length)
                      : formatCurrency(0)
                    }
                    isText
                    icon={<CurrencyDollarIcon fontSize="var(--icon-fontSize-lg)" />}
                    color="#10b981"
                  />
                </Grid>
              </Grid>

              {/* Tabela de clientes mais frequentes */}
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>Top 10 Clientes Mais Frequentes</Typography>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell>Cliente</TableCell>
                        <TableCell>Telefone</TableCell>
                        <TableCell align="center">Agendamentos</TableCell>
                        <TableCell align="center">Concluídos</TableCell>
                        <TableCell align="center">Total Gasto</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.clientesFrequentes.length === 0 ? (
                        <TableRow><TableCell colSpan={6} align="center">Nenhum dado</TableCell></TableRow>
                      ) : (
                        data.clientesFrequentes.map((c, idx) => (
                          <TableRow key={c.cliente_id} hover>
                            <TableCell>
                              <Chip
                                label={idx + 1}
                                size="small"
                                color={idx === 0 ? 'warning' : idx === 1 ? 'default' : idx === 2 ? 'info' : 'default'}
                                variant={idx < 3 ? 'filled' : 'outlined'}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight={idx < 3 ? 'bold' : 'regular'}>
                                {c.cliente_nome || '-'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">{c.cliente_telefone || '-'}</Typography>
                            </TableCell>
                            <TableCell align="center">{c.total_agendamentos}</TableCell>
                            <TableCell align="center">
                              <Chip label={c.total_concluidos} size="small" color="success" />
                            </TableCell>
                            <TableCell align="center">
                              <Typography variant="body2" fontWeight="medium" color="success.main">
                                {formatCurrency(c.total_gasto)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </Stack>
          )}
        </>
      )}
    </Stack>
  );
}

// ====== KPI Card Component ======

interface KpiCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
  isText?: boolean;
}

function KpiCard({ title, value, subtitle, icon, color, isText }: KpiCardProps) {
  return (
    <Card>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography color="text.secondary" variant="overline">{title}</Typography>
            <Typography variant="h4">
              {isText ? value : (typeof value === 'number' ? value.toLocaleString('pt-BR') : value)}
            </Typography>
            {subtitle && <Typography color="text.secondary" variant="caption">{subtitle}</Typography>}
          </Box>
          <Avatar sx={{ bgcolor: `${color}20`, color, height: 56, width: 56 }}>{icon}</Avatar>
        </Stack>
      </CardContent>
    </Card>
  );
}
