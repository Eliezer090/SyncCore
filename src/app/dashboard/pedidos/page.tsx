'use client';

import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
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
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select from '@mui/material/Select';
import { PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { PencilSimpleIcon } from '@phosphor-icons/react/dist/ssr/PencilSimple';
import { TrashIcon } from '@phosphor-icons/react/dist/ssr/Trash';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import dayjs from 'dayjs';

import type { Pedido, Empresa, Cliente } from '@/types/database';
import { LoadingOverlay } from '@/components/core/loading-overlay';
import { useEmpresa } from '@/hooks/use-empresa';
import { getAuthHeaders } from '@/lib/auth/client';

const schema = z.object({
  empresa_id: z.coerce.number().min(1, 'Empresa é obrigatória'),
  cliente_id: z.coerce.number().min(1, 'Cliente é obrigatório'),
  tipo: z.enum(['produto', 'servico']),
  status: z.string().min(1, 'Status é obrigatório'),
  total: z.coerce.number().min(0, 'Total deve ser positivo'),
  observacao: z.string().nullable().optional(),
  taxa_entrega: z.coerce.number().min(0).optional(),
});

type FormData = z.infer<typeof schema>;

const statusOptions = [
  { value: 'pendente', label: 'Pendente', color: 'warning' as const },
  { value: 'confirmado', label: 'Confirmado', color: 'info' as const },
  { value: 'em_preparo', label: 'Em Preparo', color: 'primary' as const },
  { value: 'pronto', label: 'Pronto', color: 'secondary' as const },
  { value: 'entregue', label: 'Entregue', color: 'success' as const },
  { value: 'cancelado', label: 'Cancelado', color: 'error' as const },
];

export default function PedidosPage(): React.JSX.Element {
  const { empresaId, isAdminGlobal, refreshKey } = useEmpresa();
  const [pedidos, setPedidos] = React.useState<(Pedido & { empresa_nome?: string; cliente_nome?: string; cliente_telefone?: string })[]>([]);
  const [empresas, setEmpresas] = React.useState<Empresa[]>([]);
  const [clientes, setClientes] = React.useState<Cliente[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [loadingData, setLoadingData] = React.useState(true);
  const [loadingSave, setLoadingSave] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedPedido, setSelectedPedido] = React.useState<Pedido | null>(null);

  const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { empresa_id: empresaId || 0, cliente_id: 0, tipo: 'produto', status: 'pendente', total: 0, observacao: '', taxa_entrega: 0 },
  });

  // Atualiza empresa_id quando o hook carrega (para não-admin)
  React.useEffect(() => {
    if (!isAdminGlobal && empresaId) {
      setValue('empresa_id', empresaId);
    }
  }, [empresaId, isAdminGlobal, setValue]);

  const fetchPedidos = React.useCallback(async () => {
    setLoadingData(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: rowsPerPage.toString() });
      const response = await fetch(`/api/pedidos?${params}`, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      setPedidos(data.data || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
    } finally {
      setLoadingData(false);
    }
  }, [page, rowsPerPage, empresaId, refreshKey]); // empresaId e refreshKey como dependências para refetch quando admin muda de empresa

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

  React.useEffect(() => {
    fetchPedidos();
    fetchEmpresas();
    fetchClientes();
  }, [fetchPedidos]);

  const handleOpenDialog = (pedido?: Pedido) => {
    setSelectedPedido(pedido || null);
    reset({
      empresa_id: pedido?.empresa_id || empresaId || 0,
      cliente_id: pedido?.cliente_id || 0,
      tipo: pedido?.tipo || 'produto',
      status: pedido?.status || 'pendente',
      total: pedido?.total || 0,
      observacao: pedido?.observacao || '',
      taxa_entrega: pedido?.taxa_entrega || 0,
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedPedido(null);
    reset({ empresa_id: empresaId || 0, cliente_id: 0, tipo: 'produto', status: 'pendente', total: 0, observacao: '', taxa_entrega: 0 });
  };

  const onSubmit = async (data: FormData) => {
    setLoadingSave(true);
    try {
      const url = selectedPedido ? `/api/pedidos/${selectedPedido.id}` : '/api/pedidos';
      const method = selectedPedido ? 'PUT' : 'POST';
      const response = await fetch(url, { method, headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      if (response.ok) { handleCloseDialog(); fetchPedidos(); }
    } catch (error) {
      console.error('Erro ao salvar pedido:', error);
    } finally {
      setLoadingSave(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este pedido?')) return;
    try {
      const response = await fetch(`/api/pedidos/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
      if (response.ok) { fetchPedidos(); }
    } catch (error) {
      console.error('Erro ao excluir pedido:', error);
    }
  };

  const getStatusColor = (status: string) => {
    return statusOptions.find(s => s.value === status)?.color || 'default';
  };

  const getStatusLabel = (status: string) => {
    return statusOptions.find(s => s.value === status)?.label || status;
  };

  return (
    <Box sx={{ position: 'relative', minHeight: 400 }}>
      <LoadingOverlay open={loadingData} message="Carregando pedidos..." />
      <Stack spacing={3}>
        <Stack direction="row" spacing={3} alignItems="center" justifyContent="space-between">
          <Typography variant="h4">Pedidos</Typography>
          <Button startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />} variant="contained" onClick={() => handleOpenDialog()}>Novo Pedido</Button>
        </Stack>
        <Card>
        <Box sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: '900px' }}>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell>Empresa</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Data</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pedidos.map((row) => (
                <TableRow hover key={row.id}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell><Typography variant="subtitle2">{row.cliente_nome || '-'}</Typography><Typography variant="body2" color="text.secondary">{row.cliente_telefone}</Typography></TableCell>
                  <TableCell>{row.empresa_nome || '-'}</TableCell>
                  <TableCell><Chip label={row.tipo === 'produto' ? 'Produto' : 'Serviço'} size="small" color={row.tipo === 'produto' ? 'primary' : 'secondary'} /></TableCell>
                  <TableCell><Chip label={getStatusLabel(row.status)} size="small" color={getStatusColor(row.status)} /></TableCell>
                  <TableCell>R$ {Number(row.total).toFixed(2)}</TableCell>
                  <TableCell>{dayjs(row.criado_em).format('DD/MM/YYYY HH:mm')}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Editar"><IconButton onClick={() => handleOpenDialog(row)}><PencilSimpleIcon /></IconButton></Tooltip>
                    <Tooltip title="Excluir"><IconButton onClick={() => handleDelete(row.id)} color="error"><TrashIcon /></IconButton></Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
        <Divider />
        <TablePagination component="div" count={total} onPageChange={(_, p) => setPage(p)} onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }} page={page} rowsPerPage={rowsPerPage} rowsPerPageOptions={[5, 10, 25]} labelRowsPerPage="Linhas por página" />
      </Card>
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Card>
              <CardHeader title={selectedPedido ? 'Editar Pedido' : 'Novo Pedido'} />
              <Divider />
              <CardContent>
                <Grid container spacing={3}>
                  {/* Campo Empresa - Apenas visível para admin_global */}
                  {isAdminGlobal && (
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Controller name="empresa_id" control={control} render={({ field }) => (
                        <FormControl fullWidth error={Boolean(errors.empresa_id)}>
                          <InputLabel>Empresa</InputLabel>
                          <Select {...field} label="Empresa">{empresas.map((e) => (<MenuItem key={e.id} value={e.id}>{e.nome}</MenuItem>))}</Select>
                          {errors.empresa_id && <FormHelperText>{errors.empresa_id.message}</FormHelperText>}
                        </FormControl>
                      )} />
                    </Grid>
                  )}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Controller name="cliente_id" control={control} render={({ field }) => (
                      <FormControl fullWidth error={Boolean(errors.cliente_id)}>
                        <InputLabel>Cliente</InputLabel>
                        <Select {...field} label="Cliente">{clientes.map((c) => (<MenuItem key={c.id} value={c.id}>{c.nome || c.telefone}</MenuItem>))}</Select>
                        {errors.cliente_id && <FormHelperText>{errors.cliente_id.message}</FormHelperText>}
                      </FormControl>
                    )} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Controller name="tipo" control={control} render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel>Tipo</InputLabel>
                        <Select {...field} label="Tipo">
                          <MenuItem value="produto">Produto</MenuItem>
                          <MenuItem value="servico">Serviço</MenuItem>
                        </Select>
                      </FormControl>
                    )} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Controller name="status" control={control} render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel>Status</InputLabel>
                        <Select {...field} label="Status">{statusOptions.map((s) => (<MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>))}</Select>
                      </FormControl>
                    )} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Controller name="total" control={control} render={({ field }) => (
                      <FormControl fullWidth error={Boolean(errors.total)}>
                        <InputLabel>Total</InputLabel>
                        <OutlinedInput {...field} type="number" label="Total" startAdornment={<InputAdornment position="start">R$</InputAdornment>} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} />
                        {errors.total && <FormHelperText>{errors.total.message}</FormHelperText>}
                      </FormControl>
                    )} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Controller name="taxa_entrega" control={control} render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel>Taxa de Entrega</InputLabel>
                        <OutlinedInput {...field} type="number" label="Taxa de Entrega" startAdornment={<InputAdornment position="start">R$</InputAdornment>} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} />
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
                </Grid>
              </CardContent>
              <Divider />
              <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                <Button onClick={handleCloseDialog} disabled={loadingSave}>Cancelar</Button>
                <Button type="submit" variant="contained" disabled={loadingSave}>{loadingSave ? 'Salvando...' : 'Salvar'}</Button>
              </CardActions>
            </Card>
          </form>
        </DialogContent>
      </Dialog>
      </Stack>
    </Box>
  );
}
