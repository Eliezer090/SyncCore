'use client';

import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
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

import type { PedidoItem, Pedido, Produto } from '@/types/database';
import { LoadingOverlay } from '@/components/core/loading-overlay';
import { useEmpresa } from '@/hooks/use-empresa';
import { getAuthHeaders } from '@/lib/auth/client';

const schema = z.object({
  pedido_id: z.coerce.number().min(1, 'Pedido é obrigatório'),
  produto_id: z.coerce.number().min(1, 'Produto é obrigatório').nullable(),
  servico_id: z.coerce.number().nullable().optional(),
  quantidade: z.coerce.number().min(1, 'Quantidade mínima é 1'),
  preco_unitario: z.coerce.number().min(0, 'Preço deve ser positivo'),
  observacoes: z.string().nullable().optional(),
});

type FormData = z.infer<typeof schema>;

export default function PedidoItensPage(): React.JSX.Element {
  const { empresaId } = useEmpresa();
  const [itens, setItens] = React.useState<(PedidoItem & { produto_nome?: string })[]>([]);
  const [pedidos, setPedidos] = React.useState<Pedido[]>([]);
  const [produtos, setProdutos] = React.useState<Produto[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [loadingData, setLoadingData] = React.useState(true);
  const [loadingSave, setLoadingSave] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState<PedidoItem | null>(null);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { pedido_id: 0, produto_id: null, servico_id: null, quantidade: 1, preco_unitario: 0, observacoes: '' },
  });

  const fetchItens = React.useCallback(async () => {
    setLoadingData(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: rowsPerPage.toString() });
      const response = await fetch(`/api/pedido-itens?${params}`, { headers: getAuthHeaders() });
      const data = await response.json();
      setItens(data.data || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Erro ao buscar itens:', error);
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
      const response = await fetch(`/api/pedidos?${params}`, { headers: getAuthHeaders() });
      const data = await response.json();
      setPedidos(data.data || []);
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
    }
  }, [empresaId]);

  const fetchProdutos = React.useCallback(async () => {
    try {
      const params = new URLSearchParams({ limit: '1000' });
      if (empresaId) {
        params.set('empresa_id', empresaId.toString());
      }
      const response = await fetch(`/api/produtos?${params}`, { headers: getAuthHeaders() });
      const data = await response.json();
      setProdutos(data.data || []);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    }
  }, [empresaId]);

  React.useEffect(() => {
    fetchItens();
    fetchPedidos();
    fetchProdutos();
  }, [fetchItens, fetchPedidos, fetchProdutos]);

  const handleOpenDialog = (item?: PedidoItem) => {
    setSelectedItem(item || null);
    if (item) {
      reset({
        pedido_id: item.pedido_id,
        produto_id: item.produto_id,
        servico_id: item.servico_id,
        quantidade: item.quantidade,
        preco_unitario: Number(item.preco_unitario),
        observacoes: item.observacoes || '',
      });
    } else {
      reset({ pedido_id: 0, produto_id: null, servico_id: null, quantidade: 1, preco_unitario: 0, observacoes: '' });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedItem(null);
  };

  const onSubmit = async (data: FormData) => {
    setLoadingSave(true);
    try {
      const url = selectedItem ? `/api/pedido-itens/${selectedItem.id}` : '/api/pedido-itens';
      const method = selectedItem ? 'PUT' : 'POST';
      const response = await fetch(url, { method, headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      if (response.ok) { handleCloseDialog(); fetchItens(); }
    } catch (error) {
      console.error('Erro ao salvar item:', error);
    } finally {
      setLoadingSave(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este item?')) return;
    try {
      const response = await fetch(`/api/pedido-itens/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
      if (response.ok) fetchItens();
    } catch (error) {
      console.error('Erro ao excluir item:', error);
    }
  };

  const formatCurrency = (value: number | string) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value));
  };

  return (
    <Box sx={{ position: 'relative', minHeight: '100%' }}>
      <LoadingOverlay open={loadingData} message="Carregando itens de pedido..." />
      <Stack spacing={3}>
        <Stack direction="row" spacing={3} alignItems="center" justifyContent="space-between">
          <Typography variant="h4">Itens de Pedido</Typography>
          <Button startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />} variant="contained" onClick={() => handleOpenDialog()}>
            Novo Item
          </Button>
        </Stack>
        <Card>
          <Box sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: 700 }}>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Pedido</TableCell>
                  <TableCell>Produto</TableCell>
                  <TableCell align="center">Qtd</TableCell>
                  <TableCell align="right">Preço Unit.</TableCell>
                  <TableCell align="right">Subtotal</TableCell>
                  <TableCell align="center">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {itens.map((item) => (
                  <TableRow hover key={item.id}>
                    <TableCell>{item.id}</TableCell>
                    <TableCell>#{item.pedido_id}</TableCell>
                    <TableCell>{item.produto_nome || '-'}</TableCell>
                    <TableCell align="center">{item.quantidade}</TableCell>
                    <TableCell align="right">{formatCurrency(item.preco_unitario)}</TableCell>
                    <TableCell align="right">{formatCurrency(Number(item.preco_unitario) * item.quantidade)}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Editar">
                        <IconButton onClick={() => handleOpenDialog(item)}><PencilSimpleIcon /></IconButton>
                      </Tooltip>
                      <Tooltip title="Excluir">
                        <IconButton onClick={() => handleDelete(item.id)} color="error"><TrashIcon /></IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {itens.length === 0 && !loadingData && (
                  <TableRow><TableCell colSpan={7} align="center">Nenhum item encontrado</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </Box>
          <Divider />
          <TablePagination
            component="div"
            count={total}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            labelRowsPerPage="Itens por página"
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </Card>

        <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Card>
                <CardHeader title={selectedItem ? 'Editar Item' : 'Novo Item'} />
                <Divider />
                <CardContent>
                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Controller name="pedido_id" control={control} render={({ field }) => (
                        <FormControl fullWidth error={Boolean(errors.pedido_id)}>
                          <InputLabel>Pedido</InputLabel>
                          <Select {...field} label="Pedido" value={field.value || ''} onChange={(e) => field.onChange(Number(e.target.value))}>
                            {pedidos.map((p) => (<MenuItem key={p.id} value={p.id}>#{p.id} - {formatCurrency(p.total)}</MenuItem>))}
                          </Select>
                          {errors.pedido_id && <FormHelperText>{errors.pedido_id.message}</FormHelperText>}
                        </FormControl>
                      )} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Controller name="produto_id" control={control} render={({ field }) => (
                        <FormControl fullWidth error={Boolean(errors.produto_id)}>
                          <InputLabel>Produto</InputLabel>
                          <Select {...field} label="Produto" value={field.value || ''} onChange={(e) => field.onChange(Number(e.target.value))}>
                            {produtos.map((p) => (<MenuItem key={p.id} value={p.id}>{p.nome}</MenuItem>))}
                          </Select>
                          {errors.produto_id && <FormHelperText>{errors.produto_id.message}</FormHelperText>}
                        </FormControl>
                      )} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Controller name="quantidade" control={control} render={({ field }) => (
                        <FormControl fullWidth error={Boolean(errors.quantidade)}>
                          <InputLabel>Quantidade</InputLabel>
                          <OutlinedInput {...field} type="number" label="Quantidade" onChange={(e) => field.onChange(Number(e.target.value))} />
                          {errors.quantidade && <FormHelperText>{errors.quantidade.message}</FormHelperText>}
                        </FormControl>
                      )} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Controller name="preco_unitario" control={control} render={({ field }) => (
                        <FormControl fullWidth error={Boolean(errors.preco_unitario)}>
                          <InputLabel>Preço Unitário</InputLabel>
                          <OutlinedInput {...field} type="number" label="Preço Unitário" startAdornment={<InputAdornment position="start">R$</InputAdornment>} inputProps={{ step: '0.01' }} onChange={(e) => field.onChange(Number(e.target.value))} />
                          {errors.preco_unitario && <FormHelperText>{errors.preco_unitario.message}</FormHelperText>}
                        </FormControl>
                      )} />
                    </Grid>
                    <Grid size={12}>
                      <Controller name="observacoes" control={control} render={({ field }) => (
                        <FormControl fullWidth>
                          <InputLabel>Observações</InputLabel>
                          <OutlinedInput {...field} value={field.value || ''} label="Observações" multiline rows={2} />
                        </FormControl>
                      )} />
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
