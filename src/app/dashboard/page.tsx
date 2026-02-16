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
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Users as UsersIcon } from '@phosphor-icons/react/dist/ssr/Users';
import { ShoppingCart as ShoppingCartIcon } from '@phosphor-icons/react/dist/ssr/ShoppingCart';
import { Calendar as CalendarIcon } from '@phosphor-icons/react/dist/ssr/Calendar';
import { CurrencyDollar as CurrencyDollarIcon } from '@phosphor-icons/react/dist/ssr/CurrencyDollar';
import { Package as PackageIcon } from '@phosphor-icons/react/dist/ssr/Package';
import { WhatsappLogo as WhatsappLogoIcon } from '@phosphor-icons/react/dist/ssr/WhatsappLogo';
import { Scissors as ScissorsIcon } from '@phosphor-icons/react/dist/ssr/Scissors';
import { Buildings as BuildingsIcon } from '@phosphor-icons/react/dist/ssr/Buildings';

import { useUser } from '@/hooks/use-user';
import { useEmpresa } from '@/hooks/use-empresa';
import { getAuthHeaders } from '@/lib/auth/client';
import { paths } from '@/paths';

dayjs.locale('pt-br');
dayjs.extend(relativeTime);

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

interface WhatsAppConversa {
  remoteJid: string;
  pushName: string;
  profilePicUrl: string | null;
  unreadMessages: number;
  lastMessage: {
    messageType: string;
    messageTimestamp: number;
    pushName: string;
    fromMe: boolean;
    text: string;
  } | null;
  updatedAt: string | null;
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
  const [recentConversas, setRecentConversas] = React.useState<WhatsAppConversa[]>([]);
  const [loading, setLoading] = React.useState(true);

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
          conversasRes,
        ] = await Promise.all([
          fetch('/api/clientes?limit=1', { headers }),
          fetch('/api/pedidos?limit=10', { headers }),
          fetch('/api/agendamentos?limit=10', { headers }),
          fetch('/api/produtos?limit=1', { headers }),
          fetch('/api/servicos?limit=1', { headers }),
          fetch('/api/empresas?limit=1', { headers }),
          fetch('/api/chat/conversas', { headers }),
        ]);

        const [clientes, pedidos, agendamentos, produtos, servicos, empresas, conversas] = await Promise.all([
          clientesRes.json(),
          pedidosRes.json(),
          agendamentosRes.json(),
          produtosRes.json(),
          servicosRes.json(),
          empresasRes.json(),
          conversasRes.json(),
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
          totalConversas: (conversas.chats || []).length,
          faturamentoTotal,
          pedidosHoje,
          agendamentosHoje,
          pedidosPendentes,
          agendamentosPendentes,
        });

        setRecentPedidos(pedidosData.slice(0, 5));
        setRecentAgendamentos(agendamentosData.slice(0, 5));
        setRecentConversas((conversas.chats || []).slice(0, 5));
      } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [refreshKey]); // refreshKey para recarregar quando empresa muda

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
          <StatCard title="Conversas WhatsApp" value={stats?.totalConversas || 0} icon={<WhatsappLogoIcon fontSize="var(--icon-fontSize-lg)" />} color="#25D366" />
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

      {/* Seção de Conversas WhatsApp Recentes */}
      <Card>
        <CardContent>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <WhatsappLogoIcon size={24} color="#25D366" />
              <Typography variant="h6">Conversas WhatsApp Recentes</Typography>
            </Stack>
            <Chip 
              label="Ver todas" 
              size="small" 
              color="success" 
              variant="outlined"
              onClick={() => router.push(paths.dashboard.chat)}
              sx={{ cursor: 'pointer' }}
            />
          </Stack>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Contato</TableCell>
                <TableCell>Última Mensagem</TableCell>
                <TableCell>Quando</TableCell>
                <TableCell align="center">Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentConversas.length === 0 ? (
                <TableRow><TableCell colSpan={4} align="center">Nenhuma conversa encontrada</TableCell></TableRow>
              ) : (
                recentConversas.map((conversa) => {
                  const telefone = conversa.remoteJid?.replace('@s.whatsapp.net', '') || '';
                  const timestamp = conversa.lastMessage?.messageTimestamp 
                    ? dayjs.unix(conversa.lastMessage.messageTimestamp) 
                    : null;

                  return (
                    <TableRow 
                      key={conversa.remoteJid} 
                      hover 
                      sx={{ cursor: 'pointer' }}
                      onClick={() => router.push(`${paths.dashboard.chat}?telefone=${telefone}`)}
                    >
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Avatar sx={{ bgcolor: '#25D366', width: 32, height: 32 }}>
                            <WhatsappLogoIcon size={18} color="#fff" />
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {conversa.pushName || telefone}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {telefone}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <Typography variant="body2" color="text.secondary">
                          {conversa.lastMessage?.fromMe ? 'Você: ' : ''}
                          {conversa.lastMessage?.text || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          {timestamp ? timestamp.fromNow() : '-'}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        {conversa.unreadMessages > 0 ? (
                          <Chip 
                            label={`${conversa.unreadMessages} nova${conversa.unreadMessages > 1 ? 's' : ''}`} 
                            size="small" 
                            color="success" 
                          />
                        ) : (
                          <Chip label="Lida" size="small" variant="outlined" />
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
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
