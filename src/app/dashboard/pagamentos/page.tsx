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
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
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

import type { Pagamento, Pedido } from '@/types/database';
import { LoadingOverlay } from '@/components/core/loading-overlay';
import { ImageUpload } from '@/components/core/image-upload';
import { useEmpresa } from '@/hooks/use-empresa';

const schema = z.object({
  pedido_id: z.coerce.number().min(1, 'Pedido é obrigatório'),
  metodo: z.string().min(1, 'Método é obrigatório'),
  valor: z.coerce.number().min(0, 'Valor deve ser positivo'),
  status: z.string().min(1, 'Status é obrigatório'),
  url_comprovante: z.string().nullable().optional(),
});

type FormData = z.infer<typeof schema>;

const metodoOptions = [
  { value: 'dinheiro', label: 'Dinheiro' },
  { value: 'pix', label: 'PIX' },
  { value: 'credito', label: 'Cartão de Crédito' },
  { value: 'debito', label: 'Cartão de Débito' },
  { value: 'boleto', label: 'Boleto' },
];

const statusOptions = [
  { value: 'pendente', label: 'Pendente', color: 'warning' as const },
  { value: 'pago', label: 'Pago', color: 'success' as const },
  { value: 'cancelado', label: 'Cancelado', color: 'error' as const },
  { value: 'estornado', label: 'Estornado', color: 'default' as const },
];

export default function PagamentosPage(): React.JSX.Element {
  const { empresaId } = useEmpresa();
  const [pagamentos, setPagamentos] = React.useState<(Pagamento & { pedido_numero?: number; cliente_nome?: string })[]>([]);
  const [pedidos, setPedidos] = React.useState<Pedido[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [loadingData, setLoadingData] = React.useState(true);
  const [loadingSave, setLoadingSave] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedPagamento, setSelectedPagamento] = React.useState<Pagamento | null>(null);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { pedido_id: 0, metodo: '', valor: 0, status: 'pendente', url_comprovante: null },
  });

  const fetchPagamentos = React.useCallback(async () => {
    setLoadingData(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: rowsPerPage.toString() });
      const response = await fetch(`/api/pagamentos?${params}`);
      const data = await response.json();
      setPagamentos(data.data || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Erro ao buscar pagamentos:', error);
    } finally {
      setLoadingData(false);
    }
  }, [page, rowsPerPage]);

  const fetchPedidos = React.useCallback(async () => {
    try {
      const params = new URLSearchParams({ limit: '1000' });
      if (empresaId) {
        params.set('empresa_id', empresaId.toString());
      }
      const response = await fetch(`/api/pedidos?${params}`);
      const data = await response.json();
      setPedidos(data.data || []);
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
    }
  }, [empresaId]);

  React.useEffect(() => {
    fetchPagamentos();
    fetchPedidos();
  }, [fetchPagamentos, fetchPedidos]);

  const handleOpenDialog = (pagamento?: Pagamento) => {
    setSelectedPagamento(pagamento || null);
    reset({
      pedido_id: pagamento?.pedido_id || 0,
      metodo: pagamento?.metodo || '',
      valor: pagamento?.valor || 0,
      status: pagamento?.status || 'pendente',
      url_comprovante: pagamento?.url_comprovante || null,
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedPagamento(null);
    reset({ pedido_id: 0, metodo: '', valor: 0, status: 'pendente', url_comprovante: null });
  };

  const onSubmit = async (data: FormData) => {
    setLoadingSave(true);
    try {
      const url = selectedPagamento ? `/api/pagamentos/${selectedPagamento.id}` : '/api/pagamentos';
      const method = selectedPagamento ? 'PUT' : 'POST';
      const payload = { ...data, pago_em: data.status === 'pago' ? new Date().toISOString() : null };
      const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (response.ok) { handleCloseDialog(); fetchPagamentos(); }
    } catch (error) {
      console.error('Erro ao salvar pagamento:', error);
    } finally {
      setLoadingSave(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este pagamento?')) return;
    try {
      const response = await fetch(`/api/pagamentos/${id}`, { method: 'DELETE' });
      if (response.ok) { fetchPagamentos(); }
    } catch (error) {
      console.error('Erro ao excluir pagamento:', error);
    }
  };

  const getStatusColor = (status: string) => statusOptions.find(s => s.value === status)?.color || 'default';
  const getStatusLabel = (status: string) => statusOptions.find(s => s.value === status)?.label || status;
  const getMetodoLabel = (metodo: string) => metodoOptions.find(m => m.value === metodo)?.label || metodo;

  return (
    <Box sx={{ position: 'relative', minHeight: 400 }}>
      <LoadingOverlay open={loadingData} message="Carregando pagamentos..." />
      <Stack spacing={3}>
        <Stack direction="row" spacing={3} alignItems="center" justifyContent="space-between">
          <Typography variant="h4">Pagamentos</Typography>
          <Button startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />} variant="contained" onClick={() => handleOpenDialog()}>Novo Pagamento</Button>
        </Stack>
        <Card>
        <Box sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: '800px' }}>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Pedido</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell>Método</TableCell>
                <TableCell>Valor</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Pago em</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pagamentos.map((row) => (
                <TableRow hover key={row.id}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>#{row.pedido_numero}</TableCell>
                  <TableCell>{row.cliente_nome || '-'}</TableCell>
                  <TableCell>{getMetodoLabel(row.metodo)}</TableCell>
                  <TableCell>R$ {Number(row.valor).toFixed(2)}</TableCell>
                  <TableCell><Chip label={getStatusLabel(row.status)} size="small" color={getStatusColor(row.status)} /></TableCell>
                  <TableCell>{row.pago_em ? dayjs(row.pago_em).format('DD/MM/YYYY HH:mm') : '-'}</TableCell>
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
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Card>
              <CardHeader title={selectedPagamento ? 'Editar Pagamento' : 'Novo Pagamento'} />
              <Divider />
              <CardContent>
                <Grid container spacing={3}>
                  <Grid size={12}>
                    <Controller
                      name="url_comprovante"
                      control={control}
                      render={({ field }) => (
                        <ImageUpload
                          value={field.value}
                          onChange={field.onChange}
                          folder="pagamentos/comprovantes"
                          label="Comprovante de Pagamento"
                          variant="card"
                          width={200}
                          height={150}
                        />
                      )}
                    />
                  </Grid>
                  <Grid size={12}>
                    <Controller name="pedido_id" control={control} render={({ field }) => (
                      <Autocomplete
                        options={pedidos}
                        getOptionLabel={(option) => `#${option.id} - R$ ${Number(option.total).toFixed(2)}`}
                        value={pedidos.find(p => p.id === field.value) || null}
                        onChange={(_, newValue) => field.onChange(newValue?.id || 0)}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        renderInput={(params) => (
                          <TextField 
                            {...params} 
                            label="Pedido" 
                            error={Boolean(errors.pedido_id)} 
                            helperText={errors.pedido_id?.message}
                          />
                        )}
                        noOptionsText="Nenhum pedido encontrado"
                      />
                    )} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Controller name="metodo" control={control} render={({ field }) => (
                      <FormControl fullWidth error={Boolean(errors.metodo)}>
                        <InputLabel>Método</InputLabel>
                        <Select {...field} label="Método">{metodoOptions.map((m) => (<MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>))}</Select>
                        {errors.metodo && <FormHelperText>{errors.metodo.message}</FormHelperText>}
                      </FormControl>
                    )} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Controller name="valor" control={control} render={({ field }) => (
                      <FormControl fullWidth error={Boolean(errors.valor)}>
                        <InputLabel>Valor</InputLabel>
                        <OutlinedInput {...field} type="number" label="Valor" startAdornment={<InputAdornment position="start">R$</InputAdornment>} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} />
                        {errors.valor && <FormHelperText>{errors.valor.message}</FormHelperText>}
                      </FormControl>
                    )} />
                  </Grid>
                  <Grid size={12}>
                    <Controller name="status" control={control} render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel>Status</InputLabel>
                        <Select {...field} label="Status">{statusOptions.map((s) => (<MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>))}</Select>
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
