'use client';

import * as React from 'react';
import { Calendar, dateFnsLocalizer, type View, type ToolbarProps as RBCToolbarProps } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select from '@mui/material/Select';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import CircularProgress from '@mui/material/CircularProgress';
import { PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { CaretLeftIcon } from '@phosphor-icons/react/dist/ssr/CaretLeft';
import { CaretRightIcon } from '@phosphor-icons/react/dist/ssr/CaretRight';
import { TrashIcon } from '@phosphor-icons/react/dist/ssr/Trash';
import { XIcon } from '@phosphor-icons/react/dist/ssr/X';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import dayjs from 'dayjs';

import type { Agendamento, Empresa, Cliente, Usuario, Servico, AgendamentoServico } from '@/types/database';
import { LoadingOverlay } from '@/components/core/loading-overlay';
import { useEmpresa } from '@/hooks/use-empresa';
import { getAuthHeaders } from '@/lib/auth/client';

import 'react-big-calendar/lib/css/react-big-calendar.css';

// Configurar localização pt-BR
const locales = { 'pt-BR': ptBR };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
});

const statusOptions = [
  { value: 'pendente', label: 'Pendente', color: '#ed6c02' },
  { value: 'confirmado', label: 'Confirmado', color: '#0288d1' },
  { value: 'concluido', label: 'Concluído', color: '#2e7d32' },
  { value: 'cancelado', label: 'Cancelado', color: '#d32f2f' },
];

const canceladoPorOptions = [
  { value: 'cliente', label: 'Cliente' },
  { value: 'profissional', label: 'Profissional' },
  { value: 'empresa', label: 'Empresa' },
  { value: 'sistema', label: 'Sistema' },
];

// Paleta de cores para profissionais (cores vibrantes e distinguíveis)
const profissionalColors = [
  '#2196F3', // Azul
  '#4CAF50', // Verde
  '#9C27B0', // Roxo
  '#FF9800', // Laranja
  '#E91E63', // Rosa
  '#00BCD4', // Ciano
  '#795548', // Marrom
  '#607D8B', // Cinza azulado
  '#F44336', // Vermelho
  '#3F51B5', // Índigo
  '#009688', // Teal
  '#CDDC39', // Lima
  '#FF5722', // Laranja escuro
  '#673AB7', // Roxo profundo
  '#8BC34A', // Verde claro
];

// Função para gerar cor baseada no ID do profissional
function getProfissionalColor(profissionalId: number): string {
  return profissionalColors[profissionalId % profissionalColors.length];
}

const schema = z.object({
  empresa_id: z.coerce.number().min(1, 'Empresa é obrigatória'),
  cliente_id: z.coerce.number().min(1, 'Cliente é obrigatório'),
  usuario_id: z.coerce.number().min(1, 'Profissional é obrigatório'),
  status: z.string(),
  inicio: z.string().min(1, 'Início é obrigatório'),
  fim: z.string().min(1, 'Fim é obrigatório'),
  observacao: z.string().nullable().optional(),
  duracao_total_minutos: z.coerce.number().nullable().optional(),
  cancelado_por: z.string().nullable().optional(),
});

type FormData = z.infer<typeof schema>;

interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  resource: Agendamento & { empresa_nome?: string; cliente_nome?: string; profissional_nome?: string };
}

// Componente Mini Calendário
function MiniCalendar({ selectedDate, onDateSelect }: { selectedDate: Date; onDateSelect: (date: Date) => void }) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const startDay = getDay(startOfMonth(currentMonth));
  const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

  return (
    <Paper sx={{ p: 2, minWidth: 240 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <IconButton size="small" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
          <CaretLeftIcon />
        </IconButton>
        <Typography variant="subtitle2" fontWeight={600} sx={{ textTransform: 'capitalize' }}>
          {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
        </Typography>
        <IconButton size="small" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
          <CaretRightIcon />
        </IconButton>
      </Stack>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5 }}>
        {weekDays.map((day, i) => (
          <Box key={i} sx={{ textAlign: 'center', py: 0.5 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              {day}
            </Typography>
          </Box>
        ))}
        {Array.from({ length: startDay }).map((_, i) => (
          <Box key={`empty-${i}`} />
        ))}
        {days.map((day) => {
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentDay = isToday(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);

          return (
            <Box
              key={day.toISOString()}
              onClick={() => onDateSelect(day)}
              sx={{
                textAlign: 'center',
                py: 0.5,
                cursor: 'pointer',
                borderRadius: '50%',
                bgcolor: isSelected ? 'primary.main' : isCurrentDay ? 'primary.light' : 'transparent',
                color: isSelected ? 'primary.contrastText' : isCurrentMonth ? 'text.primary' : 'text.disabled',
                '&:hover': {
                  bgcolor: isSelected ? 'primary.main' : 'action.hover',
                },
              }}
            >
              <Typography variant="caption" fontWeight={isCurrentDay || isSelected ? 600 : 400}>
                {format(day, 'd')}
              </Typography>
            </Box>
          );
        })}
      </Box>
      <Button
        fullWidth
        variant="text"
        size="small"
        sx={{ mt: 2 }}
        onClick={() => {
          setCurrentMonth(new Date());
          onDateSelect(new Date());
        }}
      >
        Hoje
      </Button>
    </Paper>
  );
}

// Componente Toolbar customizada
function CustomToolbar({ label, onNavigate, onView, view }: RBCToolbarProps<CalendarEvent, object>) {
  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2, flexWrap: 'wrap', gap: 2 }}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Button variant="outlined" size="small" onClick={() => onNavigate('TODAY')}>
          Hoje
        </Button>
        <IconButton size="small" onClick={() => onNavigate('PREV')}>
          <CaretLeftIcon />
        </IconButton>
        <IconButton size="small" onClick={() => onNavigate('NEXT')}>
          <CaretRightIcon />
        </IconButton>
        <Typography variant="h6" sx={{ ml: 2, textTransform: 'capitalize' }}>
          {label}
        </Typography>
      </Stack>
      <ToggleButtonGroup value={view} exclusive onChange={(_, v) => v && onView(v as View)} size="small">
        <ToggleButton value="day">Dia</ToggleButton>
        <ToggleButton value="week">Semana</ToggleButton>
        <ToggleButton value="month">Mês</ToggleButton>
      </ToggleButtonGroup>
    </Stack>
  );
}

// Componente de evento customizado
function EventComponent({ event }: { event: CalendarEvent }) {
  const status = statusOptions.find(s => s.value === event.resource.status);
  const profissionalColor = getProfissionalColor(event.resource.usuario_id);
  
  // Se cancelado, usa cor cinza; senão usa cor do profissional
  const bgColor = event.resource.status === 'cancelado' ? '#9e9e9e' : profissionalColor;
  
  // Indicador de status no canto (pequeno círculo colorido)
  const statusIndicatorColor = status?.color || '#1976d2';
  
  return (
    <Box
      sx={{
        bgcolor: bgColor,
        color: 'white',
        p: 0.5,
        borderRadius: 1,
        fontSize: '0.75rem',
        lineHeight: 1.3,
        overflow: 'hidden',
        height: '100%',
        cursor: 'pointer',
        position: 'relative',
        borderLeft: `4px solid ${statusIndicatorColor}`,
        '&:hover': {
          opacity: 0.9,
        },
      }}
    >
      <strong>{event.title}</strong>
      <br />
      <span style={{ opacity: 0.9, fontSize: '0.7rem' }}>{event.resource.profissional_nome}</span>
    </Box>
  );
}

export default function AgendamentosPage(): React.JSX.Element {
  const { empresaId, isAdminGlobal, refreshKey } = useEmpresa();
  const [agendamentos, setAgendamentos] = React.useState<(Agendamento & { empresa_nome?: string; cliente_nome?: string; profissional_nome?: string })[]>([]);
  const [empresas, setEmpresas] = React.useState<Empresa[]>([]);
  const [clientes, setClientes] = React.useState<Cliente[]>([]);
  const [profissionais, setProfissionais] = React.useState<Usuario[]>([]);
  const [servicos, setServicos] = React.useState<Servico[]>([]);
  const [loadingData, setLoadingData] = React.useState(true);
  const [loadingSave, setLoadingSave] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedAgendamento, setSelectedAgendamento] = React.useState<(Agendamento & { empresa_nome?: string; cliente_nome?: string; profissional_nome?: string }) | null>(null);
  const [selectedDate, setSelectedDate] = React.useState(new Date());
  const [view, setView] = React.useState<View>('week');
  
  // Estados para gerenciar serviços do agendamento
  const [servicosAgendamento, setServicosAgendamento] = React.useState<(AgendamentoServico & { servico_nome?: string })[]>([]);
  const [servicosPendentes, setServicosPendentes] = React.useState<{ servico_id: number; servico_nome: string; duracao_minutos: number; preco: number }[]>([]);
  const [loadingServicos, setLoadingServicos] = React.useState(false);
  const [selectedServicoId, setSelectedServicoId] = React.useState<number>(0);
  const [servicoDuracao, setServicoDuracao] = React.useState<number>(30);
  const [servicoPreco, setServicoPreco] = React.useState<number>(0);

  const { control, handleSubmit, reset, setValue, formState: { errors }, watch } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { empresa_id: empresaId || 0, cliente_id: 0, usuario_id: 0, status: 'pendente', inicio: '', fim: '', observacao: '', duracao_total_minutos: null, cancelado_por: null },
  });

  const watchStatus = watch('status');

  // Atualiza empresa_id quando o hook carrega (para não-admin)
  React.useEffect(() => {
    if (!isAdminGlobal && empresaId) {
      setValue('empresa_id', empresaId);
    }
  }, [empresaId, isAdminGlobal, setValue]);

  const fetchAgendamentos = React.useCallback(async () => {
    setLoadingData(true);
    try {
      const params = new URLSearchParams({ limit: '1000' });
      const response = await fetch(`/api/agendamentos?${params}`, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      setAgendamentos(data.data || []);
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
    } finally {
      setLoadingData(false);
    }
  }, [empresaId, refreshKey]); // empresaId e refreshKey como dependências para refetch quando admin muda de empresa

  const fetchEmpresas = React.useCallback(async () => {
    // Só carrega empresas se for admin_global
    if (!isAdminGlobal) return;
    try {
      const response = await fetch('/api/empresas?limit=1000', {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      setEmpresas(data.data || []);
    } catch (error) {
      console.error('Erro ao buscar empresas:', error);
    }
  }, [isAdminGlobal]);

  const fetchClientes = async () => {
    try {
      const response = await fetch('/api/clientes?limit=1000', {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      setClientes(data.data || []);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
    }
  };

  const fetchProfissionais = React.useCallback(async () => {
    try {
      const params = new URLSearchParams({ limit: '1000' });
      const response = await fetch(`/api/profissionais?${params}`, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      setProfissionais(data.data || []);
    } catch (error) {
      console.error('Erro ao buscar profissionais:', error);
    }
  }, [empresaId]); // empresaId como dependência para refetch quando admin muda de empresa

  const fetchServicos = React.useCallback(async () => {
    try {
      const params = new URLSearchParams({ limit: '1000' });
      const response = await fetch(`/api/servicos?${params}`, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      setServicos(data.data || []);
    } catch (error) {
      console.error('Erro ao buscar serviços:', error);
    }
  }, [empresaId, refreshKey]); // empresaId e refreshKey como dependências para refetch quando admin muda de empresa

  const fetchServicosAgendamento = async (agendamentoId: number) => {
    setLoadingServicos(true);
    try {
      const response = await fetch(`/api/agendamento-servicos?agendamento_id=${agendamentoId}&limit=100`, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      setServicosAgendamento(data.data || []);
    } catch (error) {
      console.error('Erro ao buscar serviços do agendamento:', error);
    } finally {
      setLoadingServicos(false);
    }
  };

  const handleAddServico = async () => {
    if (!selectedServicoId) return;
    
    // Se é um agendamento existente, salva no banco
    if (selectedAgendamento) {
      try {
        const response = await fetch('/api/agendamento-servicos', {
          method: 'POST',
          headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
          body: JSON.stringify({
            agendamento_id: selectedAgendamento.id,
            servico_id: selectedServicoId,
            duracao_minutos: servicoDuracao,
            preco: servicoPreco,
          }),
        });
        
        if (response.ok) {
          await fetchServicosAgendamento(selectedAgendamento.id);
          setSelectedServicoId(0);
          setServicoDuracao(30);
          setServicoPreco(0);
        }
      } catch (error) {
        console.error('Erro ao adicionar serviço:', error);
      }
    } else {
      // Se é novo agendamento, adiciona à lista pendente
      const servicoSelecionado = servicos.find(s => s.id === selectedServicoId);
      if (servicoSelecionado) {
        setServicosPendentes(prev => [...prev, {
          servico_id: selectedServicoId,
          servico_nome: servicoSelecionado.nome,
          duracao_minutos: servicoDuracao,
          preco: servicoPreco,
        }]);
        setSelectedServicoId(0);
        setServicoDuracao(30);
        setServicoPreco(0);
      }
    }
  };

  const handleRemoveServicoPendente = (servicoId: number) => {
    setServicosPendentes(prev => prev.filter(s => s.servico_id !== servicoId));
  };

  const handleRemoveServico = async (servicoId: number) => {
    if (!selectedAgendamento) return;
    
    try {
      const response = await fetch(`/api/agendamento-servicos?agendamento_id=${selectedAgendamento.id}&servico_id=${servicoId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      
      if (response.ok) {
        await fetchServicosAgendamento(selectedAgendamento.id);
      }
    } catch (error) {
      console.error('Erro ao remover serviço:', error);
    }
  };

  React.useEffect(() => {
    fetchAgendamentos();
    fetchEmpresas();
    fetchClientes();
    fetchProfissionais();
    fetchServicos();
  }, [fetchAgendamentos, fetchEmpresas, fetchProfissionais, fetchServicos]);

  // Formata data para input datetime-local (extrai valores sem conversão de timezone)
  const formatDateForInput = (date: Date | string | undefined) => {
    if (!date) return '';
    
    // Se for string ISO do backend (ex: "2026-02-16T14:00:00.000Z"), extrair valores sem conversão
    if (typeof date === 'string') {
      const match = date.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
      if (match) {
        const [, year, month, day, hour, minute] = match;
        return `${year}-${month}-${day}T${hour}:${minute}`;
      }
    }
    
    // Se for objeto Date, usar dayjs normalmente
    return dayjs(date).format('YYYY-MM-DDTHH:mm');
  };

  const handleOpenDialog = (agendamento?: Agendamento & { empresa_nome?: string; cliente_nome?: string; profissional_nome?: string }, slotInfo?: { start: Date; end: Date }) => {
    setSelectedAgendamento(agendamento || null);
    reset({
      empresa_id: agendamento?.empresa_id || empresaId || 0,
      cliente_id: agendamento?.cliente_id || 0,
      usuario_id: agendamento?.usuario_id || 0,
      status: agendamento?.status || 'pendente',
      inicio: formatDateForInput(agendamento?.inicio || slotInfo?.start),
      fim: formatDateForInput(agendamento?.fim || slotInfo?.end),
      observacao: agendamento?.observacao || '',
      duracao_total_minutos: agendamento?.duracao_total_minutos || null,
      cancelado_por: agendamento?.cancelado_por || null,
    });
    
    // Se for edição de agendamento existente, buscar serviços vinculados
    if (agendamento?.id) {
      fetchServicosAgendamento(agendamento.id);
    } else {
      setServicosAgendamento([]);
    }
    
    // Resetar campos de adicionar serviço
    setSelectedServicoId(0);
    setServicoDuracao(30);
    setServicoPreco(0);
    setServicosPendentes([]);
    
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedAgendamento(null);
    setServicosAgendamento([]);
  };

  const onSubmit = async (data: FormData) => {
    setLoadingSave(true);
    try {
      const url = selectedAgendamento ? `/api/agendamentos/${selectedAgendamento.id}` : '/api/agendamentos';
      const method = selectedAgendamento ? 'PUT' : 'POST';
      const response = await fetch(url, { method, headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      
      if (response.ok) {
        const savedAgendamento = await response.json();
        
        // Se é novo agendamento e tem serviços pendentes, salvar
        if (!selectedAgendamento && servicosPendentes.length > 0) {
          for (const servico of servicosPendentes) {
            await fetch('/api/agendamento-servicos', {
              method: 'POST',
              headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
              body: JSON.stringify({
                agendamento_id: savedAgendamento.id,
                servico_id: servico.servico_id,
                duracao_minutos: servico.duracao_minutos,
                preco: servico.preco,
              }),
            });
          }
        }
        
        handleCloseDialog();
        fetchAgendamentos();
      }
    } catch (error) {
      console.error('Erro ao salvar agendamento:', error);
    } finally {
      setLoadingSave(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este agendamento?')) return;
    try {
      const response = await fetch(`/api/agendamentos/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
      if (response.ok) { handleCloseDialog(); fetchAgendamentos(); }
    } catch (error) {
      console.error('Erro ao excluir agendamento:', error);
    }
  };

  // Converte data da API para Date local (usa os valores exatos do banco sem conversão de timezone)
  const parseToLocalDate = (dateStr: string | Date): Date => {
    if (dateStr instanceof Date) return dateStr;
    
    // A API retorna ex: "2026-01-26T14:00:00.000Z" mas queremos tratar 14:00 como horário local
    // Extraímos os valores diretamente da string ISO sem conversão de timezone
    const isoString = typeof dateStr === 'string' ? dateStr : String(dateStr);
    const match = isoString.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);
    
    if (match) {
      const [, year, month, day, hour, minute, second] = match;
      return new Date(
        parseInt(year, 10),
        parseInt(month, 10) - 1, // mês é 0-indexed
        parseInt(day, 10),
        parseInt(hour, 10),
        parseInt(minute, 10),
        parseInt(second, 10)
      );
    }
    
    // Fallback para parsing padrão se o formato não bater
    return new Date(dateStr);
  };

  const events: CalendarEvent[] = agendamentos.map((ag) => ({
    id: ag.id,
    title: ag.cliente_nome || 'Cliente',
    start: parseToLocalDate(ag.inicio),
    end: parseToLocalDate(ag.fim),
    resource: ag,
  }));

  const handleSelectEvent = (event: CalendarEvent) => {
    handleOpenDialog(event.resource);
  };

  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    handleOpenDialog(undefined, slotInfo);
  };

  const handleNavigate = (newDate: Date) => {
    setSelectedDate(newDate);
  };

  const handleViewChange = (newView: View) => {
    setView(newView);
  };

  const messages = {
    today: 'Hoje',
    previous: 'Anterior',
    next: 'Próximo',
    month: 'Mês',
    week: 'Semana',
    day: 'Dia',
    agenda: 'Agenda',
    date: 'Data',
    time: 'Hora',
    event: 'Evento',
    noEventsInRange: 'Não há agendamentos neste período.',
    showMore: (total: number) => `+${total} mais`,
  };

  return (
    <Box sx={{ position: 'relative', minHeight: '100%' }}>
      <LoadingOverlay open={loadingData} message="Carregando agendamentos..." />
      <Stack spacing={3}>
        <Stack direction="row" spacing={3} alignItems="center" justifyContent="space-between">
          <Typography variant="h4">Agendamentos</Typography>
          <Button
            startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />}
            variant="contained"
            onClick={() => handleOpenDialog()}
          >
            Novo Agendamento
          </Button>
        </Stack>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
          {/* Mini Calendário à esquerda */}
          <Box sx={{ flexShrink: 0 }}>
            <MiniCalendar
              selectedDate={selectedDate}
              onDateSelect={(date) => {
                setSelectedDate(date);
                setView('day');
              }}
            />
            
            {/* Legenda de status */}
            <Paper sx={{ p: 2, mt: 2 }}>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                Status
              </Typography>
              <Stack spacing={1}>
                {statusOptions.map((status) => (
                  <Stack key={status.value} direction="row" alignItems="center" spacing={1}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: status.color }} />
                    <Typography variant="body2">{status.label}</Typography>
                  </Stack>
                ))}
              </Stack>
            </Paper>

            {/* Legenda de profissionais */}
            {profissionais.length > 0 && (
              <Paper sx={{ p: 2, mt: 2, maxHeight: 300, overflow: 'auto' }}>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                  Profissionais
                </Typography>
                <Stack spacing={1}>
                  {profissionais.map((prof) => (
                    <Stack key={prof.id} direction="row" alignItems="center" spacing={1}>
                      <Box 
                        sx={{ 
                          width: 12, 
                          height: 12, 
                          borderRadius: '50%', 
                          bgcolor: getProfissionalColor(prof.id),
                          flexShrink: 0,
                        }} 
                      />
                      <Typography variant="body2" noWrap sx={{ maxWidth: 180 }}>
                        {prof.nome}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </Paper>
            )}
          </Box>

          {/* Calendário principal */}
          <Card sx={{ flex: 1, p: 2, overflow: 'hidden' }}>
            <Box
              sx={{
                height: 'calc(100vh - 280px)',
                minHeight: 500,
                '& .rbc-calendar': {
                  fontFamily: 'inherit',
                },
                '& .rbc-header': {
                  padding: '8px 4px',
                  fontWeight: 500,
                  fontSize: '0.85rem',
                },
                '& .rbc-allday-cell': {
                  display: 'none',
                },
                '& .rbc-today': {
                  backgroundColor: 'rgba(99, 102, 241, 0.08)',
                },
                '& .rbc-off-range-bg': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                },
                '& .rbc-time-content': {
                  borderTop: '1px solid',
                  borderColor: 'divider',
                },
                '& .rbc-day-slot .rbc-time-slot': {
                  borderTop: '1px solid',
                  borderColor: 'divider',
                  opacity: 0.5,
                },
                '& .rbc-current-time-indicator': {
                  backgroundColor: '#d32f2f',
                  height: '2px',
                },
                '& .rbc-time-view': {
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: '8px',
                },
                '& .rbc-month-view': {
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: '8px',
                },
                '& .rbc-time-gutter': {
                  backgroundColor: 'background.paper',
                },
                // Estilos do evento
                '& .rbc-event': {
                  backgroundColor: 'transparent',
                  border: 'none',
                  padding: 0,
                  width: '107% !important',
                },
                '& .rbc-event-label': {
                  display: 'none',
                },
                '& .rbc-event-content': {
                  height: '100%',
                },
              }}
            >
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                date={selectedDate}
                view={view}
                onNavigate={handleNavigate}
                onView={handleViewChange}
                onSelectEvent={handleSelectEvent}
                onSelectSlot={handleSelectSlot}
                selectable
                messages={messages}
                culture="pt-BR"
                components={{
                  toolbar: CustomToolbar,
                  event: EventComponent,
                }}
                formats={{
                  timeGutterFormat: (date: Date) => format(date, 'HH:mm'),
                  eventTimeRangeFormat: ({ start, end }: { start: Date; end: Date }) =>
                    `${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`,
                  dayHeaderFormat: (date: Date) => format(date, "EEEE, d 'de' MMMM", { locale: ptBR }),
                  dayRangeHeaderFormat: ({ start, end }: { start: Date; end: Date }) =>
                    `${format(start, "d 'de' MMM", { locale: ptBR })} - ${format(end, "d 'de' MMM", { locale: ptBR })}`,
                  monthHeaderFormat: (date: Date) => format(date, "MMMM 'de' yyyy", { locale: ptBR }),
                  weekdayFormat: (date: Date) => format(date, 'EEE', { locale: ptBR }),
                  dayFormat: (date: Date) => format(date, 'EEE d', { locale: ptBR }),
                }}
                min={new Date(1970, 0, 1, 0, 0, 0)}
                max={new Date(1970, 0, 1, 23, 59, 59)}
                step={30}
                timeslots={2}
              />
            </Box>
          </Card>
        </Stack>

        {/* Dialog de edição/criação */}
        <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Card>
                <CardHeader
                  title={selectedAgendamento ? 'Editar Agendamento' : 'Novo Agendamento'}
                  action={
                    selectedAgendamento && (
                      <Tooltip title="Excluir">
                        <IconButton onClick={() => handleDelete(selectedAgendamento.id)} color="error">
                          <TrashIcon />
                        </IconButton>
                      </Tooltip>
                    )
                  }
                />
                <Divider />
                <CardContent>
                  <Grid container spacing={3}>
                    {/* Campo Empresa - Apenas visível para admin_global */}
                    {isAdminGlobal && (
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Controller name="empresa_id" control={control} render={({ field }) => (
                          <FormControl fullWidth error={Boolean(errors.empresa_id)}>
                            <InputLabel>Empresa</InputLabel>
                            <Select {...field} label="Empresa">
                              {empresas.map((e) => (<MenuItem key={e.id} value={e.id}>{e.nome}</MenuItem>))}
                            </Select>
                            {errors.empresa_id && <FormHelperText>{errors.empresa_id.message}</FormHelperText>}
                          </FormControl>
                        )} />
                      </Grid>
                    )}
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Controller name="cliente_id" control={control} render={({ field }) => (
                        <FormControl fullWidth error={Boolean(errors.cliente_id)}>
                          <InputLabel>Cliente</InputLabel>
                          <Select {...field} label="Cliente">
                            {clientes.map((c) => (<MenuItem key={c.id} value={c.id}>{c.nome || c.telefone}</MenuItem>))}
                          </Select>
                          {errors.cliente_id && <FormHelperText>{errors.cliente_id.message}</FormHelperText>}
                        </FormControl>
                      )} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Controller name="usuario_id" control={control} render={({ field }) => (
                        <FormControl fullWidth error={Boolean(errors.usuario_id)}>
                          <InputLabel>Profissional</InputLabel>
                          <Select {...field} label="Profissional">
                            {profissionais.map((p) => (<MenuItem key={p.id} value={p.id}>{p.nome}</MenuItem>))}
                          </Select>
                          {errors.usuario_id && <FormHelperText>{errors.usuario_id.message}</FormHelperText>}
                        </FormControl>
                      )} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Controller name="status" control={control} render={({ field }) => (
                        <FormControl fullWidth>
                          <InputLabel>Status</InputLabel>
                          <Select {...field} label="Status">
                            {statusOptions.map((s) => (<MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>))}
                          </Select>
                        </FormControl>
                      )} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Controller name="inicio" control={control} render={({ field }) => (
                        <FormControl fullWidth error={Boolean(errors.inicio)}>
                          <InputLabel shrink>Início</InputLabel>
                          <OutlinedInput {...field} type="datetime-local" label="Início" notched />
                          {errors.inicio && <FormHelperText>{errors.inicio.message}</FormHelperText>}
                        </FormControl>
                      )} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Controller name="fim" control={control} render={({ field }) => (
                        <FormControl fullWidth error={Boolean(errors.fim)}>
                          <InputLabel shrink>Fim</InputLabel>
                          <OutlinedInput {...field} type="datetime-local" label="Fim" notched />
                          {errors.fim && <FormHelperText>{errors.fim.message}</FormHelperText>}
                        </FormControl>
                      )} />
                    </Grid>
                    <Grid size={12}>
                      <Controller name="observacao" control={control} render={({ field }) => (
                        <FormControl fullWidth>
                          <InputLabel>Observação</InputLabel>
                          <OutlinedInput {...field} value={field.value || ''} label="Observação" multiline rows={3} />
                        </FormControl>
                      )} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Controller name="duracao_total_minutos" control={control} render={({ field }) => (
                        <FormControl fullWidth>
                          <InputLabel>Duração Total</InputLabel>
                          <OutlinedInput {...field} type="number" value={field.value ?? ''} label="Duração Total" readOnly sx={{ bgcolor: 'action.disabledBackground' }} endAdornment={<span style={{ marginRight: 8 }}>min</span>} />
                          <FormHelperText>Calculado automaticamente com base nos serviços</FormHelperText>
                        </FormControl>
                      )} />
                    </Grid>
                    {watchStatus === 'cancelado' && (
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Controller name="cancelado_por" control={control} render={({ field }) => (
                          <FormControl fullWidth>
                            <InputLabel>Cancelado Por</InputLabel>
                            <Select {...field} value={field.value || ''} label="Cancelado Por" onChange={(e) => field.onChange(e.target.value || null)}>
                              <MenuItem value="">-- Selecione --</MenuItem>
                              {canceladoPorOptions.map((opt) => (
                                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                              ))}
                            </Select>
                            <FormHelperText>Quem solicitou o cancelamento</FormHelperText>
                          </FormControl>
                        )} />
                      </Grid>
                    )}
                    
                    {/* Seção de Serviços - exibe tanto para novo quanto para edição */}
                    <Grid size={12}>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                        Serviços do Agendamento
                      </Typography>
                      
                      {/* Lista de serviços - agendamento existente */}
                      {selectedAgendamento && (
                        <>
                          {loadingServicos ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                              <CircularProgress size={24} />
                            </Box>
                          ) : servicosAgendamento.length > 0 ? (
                            <List dense sx={{ mb: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                              {servicosAgendamento.map((sa) => (
                                <ListItem key={sa.id} divider>
                                  <ListItemText
                                    primary={sa.servico_nome}
                                    secondary={`Duração: ${sa.duracao_minutos}min | Preço: R$ ${Number(sa.preco || 0).toFixed(2)}`}
                                  />
                                  <ListItemSecondaryAction>
                                    <Tooltip title="Remover serviço">
                                      <IconButton
                                        edge="end"
                                        size="small"
                                        color="error"
                                        onClick={() => handleRemoveServico(sa.servico_id)}
                                      >
                                        <XIcon />
                                      </IconButton>
                                    </Tooltip>
                                  </ListItemSecondaryAction>
                                </ListItem>
                              ))}
                            </List>
                          ) : (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              Nenhum serviço vinculado a este agendamento.
                            </Typography>
                          )}
                        </>
                      )}
                      
                      {/* Lista de serviços pendentes - novo agendamento */}
                      {!selectedAgendamento && (
                        <>
                          {servicosPendentes.length > 0 ? (
                            <List dense sx={{ mb: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                              {servicosPendentes.map((sp, index) => (
                                <ListItem key={`pending-${sp.servico_id}-${index}`} divider>
                                  <ListItemText
                                    primary={sp.servico_nome}
                                    secondary={`Duração: ${sp.duracao_minutos}min | Preço: R$ ${Number(sp.preco || 0).toFixed(2)}`}
                                  />
                                  <ListItemSecondaryAction>
                                    <Tooltip title="Remover serviço">
                                      <IconButton
                                        edge="end"
                                        size="small"
                                        color="error"
                                        onClick={() => handleRemoveServicoPendente(sp.servico_id)}
                                      >
                                        <XIcon />
                                      </IconButton>
                                    </Tooltip>
                                  </ListItemSecondaryAction>
                                </ListItem>
                              ))}
                            </List>
                          ) : (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              Adicione os serviços deste agendamento.
                            </Typography>
                          )}
                        </>
                      )}
                      
                      {/* Formulário para adicionar novo serviço */}
                      <Typography variant="body2" fontWeight={500} sx={{ mb: 1 }}>
                        Adicionar Serviço
                      </Typography>
                      {servicos.length === 0 ? (
                        <Typography variant="body2" color="error" sx={{ mb: 2 }}>
                          Nenhum serviço cadastrado. Cadastre serviços na tela de Serviços.
                        </Typography>
                      ) : (
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 4 }}>
                          <FormControl fullWidth size="small">
                            <InputLabel>Serviço</InputLabel>
                            <Select
                              value={selectedServicoId}
                              onChange={(e) => {
                                const id = Number(e.target.value);
                                setSelectedServicoId(id);
                                // Auto-preencher duração e preço do serviço selecionado
                                const servico = servicos.find(s => s.id === id);
                                if (servico) {
                                  setServicoDuracao((servico as unknown as { duracao_minutos?: number }).duracao_minutos || 30);
                                  setServicoPreco((servico as unknown as { preco?: number }).preco || 0);
                                }
                              }}
                              label="Serviço"
                            >
                              <MenuItem value={0}>Selecione...</MenuItem>
                              {servicos
                                .filter((s) => {
                                  // Filtrar serviços já adicionados
                                  if (selectedAgendamento) {
                                    return !servicosAgendamento.some((sa) => sa.servico_id === s.id);
                                  }
                                  return !servicosPendentes.some((sp) => sp.servico_id === s.id);
                                })
                                .map((s) => (
                                  <MenuItem key={s.id} value={s.id}>{s.nome}</MenuItem>
                                ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
                          <FormControl fullWidth size="small">
                            <InputLabel>Duração (min)</InputLabel>
                            <OutlinedInput
                              type="number"
                              value={servicoDuracao}
                              onChange={(e) => setServicoDuracao(Number(e.target.value))}
                              label="Duração (min)"
                            />
                          </FormControl>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
                          <FormControl fullWidth size="small">
                            <InputLabel>Preço (R$)</InputLabel>
                            <OutlinedInput
                              type="number"
                              value={servicoPreco}
                              onChange={(e) => setServicoPreco(Number(e.target.value))}
                              label="Preço (R$)"
                              inputProps={{ step: '0.01' }}
                            />
                          </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 2 }} sx={{ display: 'flex', alignItems: 'center' }}>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<PlusIcon />}
                            onClick={handleAddServico}
                            disabled={!selectedServicoId}
                            fullWidth
                          >
                            Adicionar
                          </Button>
                        </Grid>
                      </Grid>
                      )}
                    </Grid>
                  </Grid>
                </CardContent>
                <Divider />
                <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                  <Button onClick={handleCloseDialog} disabled={loadingSave}>Cancelar</Button>
                  <Button type="submit" variant="contained" disabled={loadingSave}>
                    {loadingSave ? 'Salvando...' : 'Salvar'}
                  </Button>
                </CardActions>
              </Card>
            </form>
          </DialogContent>
        </Dialog>
      </Stack>
    </Box>
  );
}
