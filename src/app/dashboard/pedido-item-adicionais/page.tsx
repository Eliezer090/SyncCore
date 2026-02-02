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
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select from '@mui/material/Select';
import { PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { TrashIcon } from '@phosphor-icons/react/dist/ssr/Trash';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import type { PedidoItemAdicional, PedidoItem, ProdutoAdicional } from '@/types/database';
import { LoadingOverlay } from '@/components/core/loading-overlay';
import { getAuthHeaders } from '@/lib/auth/client';

const schema = z.object({
  pedido_item_id: z.coerce.number().min(1, 'Item do pedido é obrigatório'),
  adicional_id: z.coerce.number().min(1, 'Adicional é obrigatório'),
  preco: z.coerce.number().min(0, 'Preço é obrigatório'),
});

type FormData = z.infer<typeof schema>;

export default function PedidoItemAdicionaisPage(): React.JSX.Element {
  const [vinculacoes, setVinculacoes] = React.useState<(PedidoItemAdicional & { item_produto_nome?: string; adicional_nome?: string })[]>([]);
  const [pedidoItens, setPedidoItens] = React.useState<(PedidoItem & { produto_nome?: string })[]>([]);
  const [adicionais, setAdicionais] = React.useState<ProdutoAdicional[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [loadingData, setLoadingData] = React.useState(true);
  const [loadingSave, setLoadingSave] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { pedido_item_id: 0, adicional_id: 0 },
  });

  const fetchVinculacoes = React.useCallback(async () => {
    setLoadingData(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: rowsPerPage.toString() });
      const response = await fetch(`/api/pedido-item-adicionais?${params}`, { headers: getAuthHeaders() });
      const data = await response.json();
      setVinculacoes(data.data || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Erro ao buscar vinculações:', error);
    } finally {
      setLoadingData(false);
    }
  }, [page, rowsPerPage]);

  const fetchPedidoItens = async () => {
    try {
      const response = await fetch('/api/pedido-itens?limit=1000', { headers: getAuthHeaders() });
      const data = await response.json();
      setPedidoItens(data.data || []);
    } catch (error) {
      console.error('Erro ao buscar itens de pedido:', error);
    }
  };

  const fetchAdicionais = async () => {
    try {
      const response = await fetch('/api/produto-adicionais?limit=1000', { headers: getAuthHeaders() });
      const data = await response.json();
      setAdicionais(data.data || []);
    } catch (error) {
      console.error('Erro ao buscar adicionais:', error);
    }
  };

  React.useEffect(() => {
    fetchVinculacoes();
    fetchPedidoItens();
    fetchAdicionais();
  }, [fetchVinculacoes]);

  const handleOpenDialog = () => {
    reset({ pedido_item_id: 0, adicional_id: 0, preco: 0 });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const onSubmit = async (data: FormData) => {
    setLoadingSave(true);
    try {
      const response = await fetch('/api/pedido-item-adicionais', {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (response.ok) { handleCloseDialog(); fetchVinculacoes(); }
    } catch (error) {
      console.error('Erro ao salvar vinculação:', error);
    } finally {
      setLoadingSave(false);
    }
  };

  const handleDelete = async (pedidoItemId: number, adicionalId: number) => {
    if (!confirm('Tem certeza que deseja remover este adicional do item?')) return;
    try {
      const response = await fetch(`/api/pedido-item-adicionais?pedido_item_id=${pedidoItemId}&adicional_id=${adicionalId}`, { method: 'DELETE', headers: getAuthHeaders() });
      if (response.ok) fetchVinculacoes();
    } catch (error) {
      console.error('Erro ao excluir vinculação:', error);
    }
  };

  const formatCurrency = (value: number | string | undefined) => {
    if (!value) return '-';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value));
  };

  return (
    <Box sx={{ position: 'relative', minHeight: '100%' }}>
      <LoadingOverlay open={loadingData} message="Carregando adicionais de itens..." />
      <Stack spacing={3}>
        <Stack direction="row" spacing={3} alignItems="center" justifyContent="space-between">
          <Typography variant="h4">Adicionais dos Itens de Pedido</Typography>
          <Button startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />} variant="contained" onClick={handleOpenDialog}>
            Adicionar
          </Button>
        </Stack>
        <Card>
          <Box sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: 600 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Item do Pedido</TableCell>
                  <TableCell>Produto</TableCell>
                  <TableCell>Adicional</TableCell>
                  <TableCell align="right">Preço Adicional</TableCell>
                  <TableCell align="center">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {vinculacoes.map((v, index) => (
                  <TableRow hover key={`${v.pedido_item_id}-${v.adicional_id}-${index}`}>
                    <TableCell>#{v.pedido_item_id}</TableCell>
                    <TableCell>{v.item_produto_nome || '-'}</TableCell>
                    <TableCell>{v.adicional_nome || '-'}</TableCell>
                    <TableCell align="right">{formatCurrency(v.preco)}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Remover">
                        <IconButton onClick={() => handleDelete(v.pedido_item_id, v.adicional_id)} color="error">
                          <TrashIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {vinculacoes.length === 0 && !loadingData && (
                  <TableRow><TableCell colSpan={5} align="center">Nenhum adicional vinculado</TableCell></TableRow>
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
                <CardHeader title="Adicionar Adicional ao Item" />
                <Divider />
                <CardContent>
                  <Grid container spacing={3}>
                    <Grid size={12}>
                      <Controller name="pedido_item_id" control={control} render={({ field }) => (
                        <FormControl fullWidth error={Boolean(errors.pedido_item_id)}>
                          <InputLabel>Item do Pedido</InputLabel>
                          <Select {...field} label="Item do Pedido" value={field.value || ''} onChange={(e) => field.onChange(Number(e.target.value))}>
                            {pedidoItens.map((item) => (
                              <MenuItem key={item.id} value={item.id}>
                                #{item.id} - {item.produto_nome || 'Produto'} (Qtd: {item.quantidade})
                              </MenuItem>
                            ))}
                          </Select>
                          {errors.pedido_item_id && <FormHelperText>{errors.pedido_item_id.message}</FormHelperText>}
                        </FormControl>
                      )} />
                    </Grid>
                    <Grid size={12}>
                      <Controller name="adicional_id" control={control} render={({ field }) => (
                        <FormControl fullWidth error={Boolean(errors.adicional_id)}>
                          <InputLabel>Adicional</InputLabel>
                          <Select {...field} label="Adicional" value={field.value || ''} onChange={(e) => field.onChange(Number(e.target.value))}>
                            {adicionais.map((a) => (
                              <MenuItem key={a.id} value={a.id}>
                                {a.nome} - {formatCurrency(a.preco)}
                              </MenuItem>
                            ))}
                          </Select>
                          {errors.adicional_id && <FormHelperText>{errors.adicional_id.message}</FormHelperText>}
                        </FormControl>
                      )} />
                    </Grid>
                    <Grid size={12}>
                      <Controller name="preco" control={control} render={({ field }) => (
                        <FormControl fullWidth error={Boolean(errors.preco)}>
                          <InputLabel>Preço (R$)</InputLabel>
                          <OutlinedInput {...field} label="Preço (R$)" type="number" inputProps={{ step: '0.01' }} onChange={(e) => field.onChange(Number(e.target.value))} />
                          {errors.preco && <FormHelperText>{errors.preco.message}</FormHelperText>}
                        </FormControl>
                      )} />
                    </Grid>
                  </Grid>
                </CardContent>
                <Divider />
                <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                  <Button onClick={handleCloseDialog} disabled={loadingSave}>Cancelar</Button>
                  <Button type="submit" variant="contained" disabled={loadingSave}>
                    {loadingSave ? 'Salvando...' : 'Adicionar'}
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
