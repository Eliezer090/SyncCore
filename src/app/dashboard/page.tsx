'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
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
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import { Users as UsersIcon } from '@phosphor-icons/react/dist/ssr/Users';
import { ShoppingCart as ShoppingCartIcon } from '@phosphor-icons/react/dist/ssr/ShoppingCart';
import { Calendar as CalendarIcon } from '@phosphor-icons/react/dist/ssr/Calendar';
import { CurrencyDollar as CurrencyDollarIcon } from '@phosphor-icons/react/dist/ssr/CurrencyDollar';
import { Package as PackageIcon } from '@phosphor-icons/react/dist/ssr/Package';
import { ChatCircle as ChatCircleIcon } from '@phosphor-icons/react/dist/ssr/ChatCircle';
import { Scissors as ScissorsIcon } from '@phosphor-icons/react/dist/ssr/Scissors';
import { Buildings as BuildingsIcon } from '@phosphor-icons/react/dist/ssr/Buildings';
import { X as XIcon } from '@phosphor-icons/react/dist/ssr/X';
import { Robot as RobotIcon } from '@phosphor-icons/react/dist/ssr/Robot';
import { User as UserIcon } from '@phosphor-icons/react/dist/ssr/User';

import { useUser } from '@/hooks/use-user';
import { useEmpresa } from '@/hooks/use-empresa';
import { getAuthHeaders } from '@/lib/auth/client';
import { paths } from '@/paths';

dayjs.locale('pt-br');

interface DashboardStats {
  totalClientes: number;
  totalPedidos: number;
  totalAgendamentos: number;
  totalProdutos: number;
  totalServicos: number;
  totalEmpresas: number;
  totalConversas: number;
  faturamentoTotal: number;
  pedidosHoje: number;
  agendamentosHoje: number;
  pedidosPendentes: number;
  agendamentosPendentes: number;
}

interface RecentPedido {
  id: number;
  cliente_nome: string;
  total: number;
  status: string;
  criado_em: string;
}

interface RecentAgendamento {
  id: number;
  cliente_nome: string;
  profissional_nome: string;
  inicio: string;
  status: string;
}

interface SessionSummary {
  session_id: string;
  total_messages: number;
  preview: string;
}

interface HistoricoConversa {
  id: number;
  session_id: string;
  message: {
    role?: string;
    content?: string;
    [key: string]: unknown;
  };
}

const statusColors: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
  pendente: 'warning',
  confirmado: 'info',
  em_preparo: 'secondary',
  pronto: 'primary',
  entregue: 'success',
  cancelado: 'error',
  aguardando: 'warning',
  concluido: 'success',
};

export default function DashboardPage(): React.JSX.Element {
  const router = useRouter();
  const { user } = useUser();
  const { refreshKey } = useEmpresa();
  const [stats, setStats] = React.useState<DashboardStats | null>(null);
  const [recentPedidos, setRecentPedidos] = React.useState<RecentPedido[]>([]);
  const [recentAgendamentos, setRecentAgendamentos] = React.useState<RecentAgendamento[]>([]);
  const [recentSessions, setRecentSessions] = React.useState<SessionSummary[]>([]);
  const [loading, setLoading] = React.useState(true);
  
  // Estado do chat dialog
  const [chatOpen, setChatOpen] = React.useState(false);
  const [chatMessages, setChatMessages] = React.useState<HistoricoConversa[]>([]);
  const [selectedSession, setSelectedSession] = React.useState<string | null>(null);
  const [loadingChat, setLoadingChat] = React.useState(false);

  // Redirecionar profissional para seu dashboard personalizado
  React.useEffect(() => {
    if (user?.papel === 'profissional') {
      router.replace(paths.dashboard.profissional);
    }
  }, [user?.papel, router]);

  if (user?.papel === 'profissional') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  React.useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const headers = getAuthHeaders();
        const [
          clientesRes,
          pedidosRes,
          agendamentosRes,
          produtosRes,
          servicosRes,
          empresasRes,
          sessionsRes,
        ] = await Promise.all([
          fetch('/api/clientes?limit=1', { headers }),
          fetch('/api/pedidos?limit=10', { headers }),
          fetch('/api/agendamentos?limit=10', { headers }),
          fetch('/api/produtos?limit=1', { headers }),
          fetch('/api/servicos?limit=1', { headers }),
          fetch('/api/empresas?limit=1', { headers }),
          fetch('/api/historico-conversas/sessions?limit=5', { headers }),
        ]);

        const [clientes, pedidos, agendamentos, produtos, servicos, empresas, sessions] = await Promise.all([
          clientesRes.json(),
          pedidosRes.json(),
          agendamentosRes.json(),
          produtosRes.json(),
          servicosRes.json(),
          empresasRes.json(),
          sessionsRes.json(),
        ]);

        const hoje = dayjs().format('YYYY-MM-DD');
        const pedidosData = pedidos.data || [];
        const agendamentosData = agendamentos.data || [];

        const pedidosHoje = pedidosData.filter((p: RecentPedido) => 
          dayjs(p.criado_em).format('YYYY-MM-DD') === hoje
        ).length;

        const agendamentosHoje = agendamentosData.filter((a: RecentAgendamento) => 
          dayjs(a.inicio).format('YYYY-MM-DD') === hoje
        ).length;

        const pedidosPendentes = pedidosData.filter((p: RecentPedido) => 
          ['pendente', 'em_preparo', 'aguardando'].includes(p.status)
        ).length;

        const agendamentosPendentes = agendamentosData.filter((a: RecentAgendamento) => 
          ['pendente', 'confirmado', 'aguardando'].includes(a.status)
        ).length;

        const faturamentoTotal = pedidosData
          .filter((p: RecentPedido) => p.status !== 'cancelado')
          .reduce((acc: number, p: RecentPedido) => acc + Number(p.total || 0), 0);

        setStats({
          totalClientes: clientes.total || 0,
          totalPedidos: pedidos.total || 0,
          totalAgendamentos: agendamentos.total || 0,
          totalProdutos: produtos.total || 0,
          totalServicos: servicos.total || 0,
          totalEmpresas: empresas.total || 0,
          totalConversas: sessions.total || 0,
          faturamentoTotal,
          pedidosHoje,
          agendamentosHoje,
          pedidosPendentes,
          agendamentosPendentes,
        });

        setRecentPedidos(pedidosData.slice(0, 5));
        setRecentAgendamentos(agendamentosData.slice(0, 5));
        setRecentSessions(sessions.data || []);
      } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [refreshKey]); // refreshKey para recarregar quando empresa muda

  const handleOpenChat = async (sessionId: string) => {
    setSelectedSession(sessionId);
    setChatOpen(true);
    setLoadingChat(true);
    
    try {
      const response = await fetch(`/api/historico-conversas?session_id=${sessionId}&limit=100`, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      // Ordenar por ID crescente para mostrar as mensagens na ordem correta
      const sortedMessages = (data.data || []).sort((a: HistoricoConversa, b: HistoricoConversa) => a.id - b.id);
      setChatMessages(sortedMessages);
    } catch (error) {
      console.error('Erro ao carregar chat:', error);
    } finally {
      setLoadingChat(false);
    }
  };

  const handleCloseChat = () => {
    setChatOpen(false);
    setChatMessages([]);
    setSelectedSession(null);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 4 }}>
        <LinearProgress />
        <Typography align="center" sx={{ mt: 2 }}>Carregando dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Dashboard</Typography>
      
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard title="Total Clientes" value={stats?.totalClientes || 0} icon={<UsersIcon fontSize="var(--icon-fontSize-lg)" />} color="#0ea5e9" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard title="Total Pedidos" value={stats?.totalPedidos || 0} subtitle={`${stats?.pedidosHoje || 0} hoje`} icon={<ShoppingCartIcon fontSize="var(--icon-fontSize-lg)" />} color="#8b5cf6" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard title="Agendamentos" value={stats?.totalAgendamentos || 0} subtitle={`${stats?.agendamentosHoje || 0} hoje`} icon={<CalendarIcon fontSize="var(--icon-fontSize-lg)" />} color="#f97316" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard title="Faturamento" value={formatCurrency(stats?.faturamentoTotal || 0)} isText icon={<CurrencyDollarIcon fontSize="var(--icon-fontSize-lg)" />} color="#10b981" />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard title="Produtos" value={stats?.totalProdutos || 0} icon={<PackageIcon fontSize="var(--icon-fontSize-lg)" />} color="#ec4899" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard title="Serviços" value={stats?.totalServicos || 0} icon={<ScissorsIcon fontSize="var(--icon-fontSize-lg)" />} color="#06b6d4" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard title="Empresas" value={stats?.totalEmpresas || 0} icon={<BuildingsIcon fontSize="var(--icon-fontSize-lg)" />} color="#6366f1" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard title="Conversas" value={stats?.totalConversas || 0} icon={<ChatCircleIcon fontSize="var(--icon-fontSize-lg)" />} color="#f59e0b" />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: '#fef3c7', color: '#f59e0b' }}><ShoppingCartIcon /></Avatar>
                <Box>
                  <Typography variant="h6">{stats?.pedidosPendentes || 0}</Typography>
                  <Typography color="text.secondary" variant="body2">Pedidos pendentes</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: '#dbeafe', color: '#3b82f6' }}><CalendarIcon /></Avatar>
                <Box>
                  <Typography variant="h6">{stats?.agendamentosPendentes || 0}</Typography>
                  <Typography color="text.secondary" variant="body2">Agendamentos pendentes</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Últimos Pedidos</Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Cliente</TableCell>
                    <TableCell>Total</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentPedidos.length === 0 ? (
                    <TableRow><TableCell colSpan={4} align="center">Nenhum pedido encontrado</TableCell></TableRow>
                  ) : (
                    recentPedidos.map((pedido) => (
                      <TableRow key={pedido.id} hover>
                        <TableCell>#{pedido.id}</TableCell>
                        <TableCell>{pedido.cliente_nome || '-'}</TableCell>
                        <TableCell>{formatCurrency(Number(pedido.total))}</TableCell>
                        <TableCell><Chip label={pedido.status} size="small" color={statusColors[pedido.status] || 'default'} /></TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Próximos Agendamentos</Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Data/Hora</TableCell>
                    <TableCell>Cliente</TableCell>
                    <TableCell>Profissional</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentAgendamentos.length === 0 ? (
                    <TableRow><TableCell colSpan={4} align="center">Nenhum agendamento encontrado</TableCell></TableRow>
                  ) : (
                    recentAgendamentos.map((ag) => (
                      <TableRow key={ag.id} hover>
                        <TableCell>{dayjs(ag.inicio).format('DD/MM HH:mm')}</TableCell>
                        <TableCell>{ag.cliente_nome || '-'}</TableCell>
                        <TableCell>{ag.profissional_nome || '-'}</TableCell>
                        <TableCell><Chip label={ag.status} size="small" color={statusColors[ag.status] || 'default'} /></TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Seção de Conversas Recentes */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Conversas Recentes</Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Session ID</TableCell>
                <TableCell>Mensagens</TableCell>
                <TableCell>Última Mensagem</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentSessions.length === 0 ? (
                <TableRow><TableCell colSpan={3} align="center">Nenhuma conversa encontrada</TableCell></TableRow>
              ) : (
                recentSessions.map((session) => (
                  <TableRow 
                    key={session.session_id} 
                    hover 
                    sx={{ cursor: 'pointer' }}
                    onClick={() => handleOpenChat(session.session_id)}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium" color="primary">
                        {session.session_id.substring(0, 20)}...
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={`${session.total_messages} msgs`} size="small" color="info" />
                    </TableCell>
                    <TableCell sx={{ maxWidth: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {session.preview || '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Chat Dialog */}
      <Dialog 
        open={chatOpen} 
        onClose={handleCloseChat} 
        maxWidth="md" 
        fullWidth
        PaperProps={{ sx: { height: '80vh', maxHeight: 700 } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <ChatCircleIcon size={24} />
            <Typography variant="h6">Conversa</Typography>
            {selectedSession && (
              <Typography variant="caption" color="text.secondary">
                ({selectedSession.substring(0, 15)}...)
              </Typography>
            )}
          </Stack>
          <IconButton onClick={handleCloseChat} size="small"><XIcon /></IconButton>
        </DialogTitle>
        <DialogContent 
          dividers 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            p: 2,
            bgcolor: 'grey.50',
            overflowY: 'auto'
          }}
        >
          {loadingChat ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
              <LinearProgress sx={{ width: '50%' }} />
            </Box>
          ) : chatMessages.length === 0 ? (
            <Typography align="center" color="text.secondary">Nenhuma mensagem encontrada</Typography>
          ) : (
            <Stack spacing={2} sx={{ flex: 1 }}>
              {chatMessages.map((msg) => {
                const isUser = msg.message?.role === 'user';
                const content = msg.message?.content || JSON.stringify(msg.message);
                
                return (
                  <Stack
                    key={msg.id}
                    direction="row"
                    justifyContent={isUser ? 'flex-end' : 'flex-start'}
                    alignItems="flex-start"
                    spacing={1}
                  >
                    {!isUser && (
                      <Avatar sx={{ bgcolor: '#635bff', width: 32, height: 32 }}>
                        <RobotIcon size={18} />
                      </Avatar>
                    )}
                    <Paper
                      elevation={1}
                      sx={{
                        p: 2,
                        maxWidth: '70%',
                        bgcolor: isUser ? '#635bff' : 'white',
                        color: isUser ? 'white' : 'text.primary',
                        borderRadius: 2,
                        borderTopRightRadius: isUser ? 0 : 2,
                        borderTopLeftRadius: isUser ? 2 : 0,
                      }}
                    >
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {content}
                      </Typography>
                    </Paper>
                    {isUser && (
                      <Avatar sx={{ bgcolor: '#0ea5e9', width: 32, height: 32 }}>
                        <UserIcon size={18} />
                      </Avatar>
                    )}
                  </Stack>
                );
              })}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseChat}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
  isText?: boolean;
}

function StatCard({ title, value, subtitle, icon, color, isText }: StatCardProps) {
  return (
    <Card>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography color="text.secondary" variant="overline">{title}</Typography>
            <Typography variant="h4">{isText ? value : (value as number).toLocaleString('pt-BR')}</Typography>
            {subtitle && <Typography color="text.secondary" variant="caption">{subtitle}</Typography>}
          </Box>
          <Avatar sx={{ bgcolor: `${color}20`, color: color, height: 56, width: 56 }}>{icon}</Avatar>
        </Stack>
      </CardContent>
    </Card>
  );
}
