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
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select from '@mui/material/Select';
import { PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { TrashIcon } from '@phosphor-icons/react/dist/ssr/Trash';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import dayjs from 'dayjs';

import type { EstoqueMovimentacao, Produto } from '@/types/database';
import { LoadingOverlay } from '@/components/core/loading-overlay';
import { useEmpresa } from '@/hooks/use-empresa';
import { getAuthHeaders } from '@/lib/auth/client';

const schema = z.object({
  produto_id: z.coerce.number().min(1, 'Produto é obrigatório'),
  tipo: z.enum(['entrada', 'saida']),
  quantidade: z.coerce.number().min(1, 'Quantidade deve ser maior que zero'),
  motivo: z.string().nullable().optional(),
});

type FormData = z.infer<typeof schema>;

export default function EstoquePage(): React.JSX.Element {
  const { empresaId, refreshKey } = useEmpresa();
  const [movimentacoes, setMovimentacoes] = React.useState<(EstoqueMovimentacao & { produto_nome?: string; empresa_nome?: string })[]>([]);
  const [produtos, setProdutos] = React.useState<Produto[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [loadingData, setLoadingData] = React.useState(true);
  const [loadingSave, setLoadingSave] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { produto_id: 0, tipo: 'entrada', quantidade: 1, motivo: '' },
  });

  const fetchMovimentacoes = React.useCallback(async () => {
    setLoadingData(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: rowsPerPage.toString() });
      const response = await fetch(`/api/estoque?${params}`, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      setMovimentacoes(data.data || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Erro ao buscar movimentações:', error);
    } finally {
      setLoadingData(false);
    }
  }, [page, rowsPerPage, empresaId, refreshKey]); // empresaId e refreshKey como dependências para refetch quando admin muda de empresa

  const fetchProdutos = React.useCallback(async () => {
    try {
      const params = new URLSearchParams({ limit: '1000' });
      const response = await fetch(`/api/produtos?${params}`, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      setProdutos(data.data || []);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    }
  }, [empresaId, refreshKey]); // empresaId e refreshKey como dependências para refetch quando admin muda de empresa

  React.useEffect(() => {
    fetchMovimentacoes();
    fetchProdutos();
  }, [fetchMovimentacoes, fetchProdutos]);

  const handleOpenDialog = () => {
    reset({ produto_id: 0, tipo: 'entrada', quantidade: 1, motivo: '' });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    reset({ produto_id: 0, tipo: 'entrada', quantidade: 1, motivo: '' });
  };

  const onSubmit = async (data: FormData) => {
    setLoadingSave(true);
    try {
      const response = await fetch('/api/estoque', { method: 'POST', headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      if (response.ok) { handleCloseDialog(); fetchMovimentacoes(); }
    } catch (error) {
      console.error('Erro ao salvar movimentação:', error);
    } finally {
      setLoadingSave(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta movimentação?')) return;
    try {
      const response = await fetch(`/api/estoque/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
      if (response.ok) { fetchMovimentacoes(); }
    } catch (error) {
      console.error('Erro ao excluir movimentação:', error);
    }
  };

  return (
    <Box sx={{ position: 'relative', minHeight: 400 }}>
      <LoadingOverlay open={loadingData} message="Carregando movimentações..." />
      <Stack spacing={3}>
        <Stack direction="row" spacing={3} alignItems="center" justifyContent="space-between">
          <Typography variant="h4">Movimentações de Estoque</Typography>
          <Button startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />} variant="contained" onClick={() => handleOpenDialog()}>Nova Movimentação</Button>
        </Stack>
        <Card>
        <Box sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: '800px' }}>
            <TableHead>
              <TableRow>
                <TableCell>Produto</TableCell>
                <TableCell>Empresa</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Quantidade</TableCell>
                <TableCell>Motivo</TableCell>
                <TableCell>Data</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {movimentacoes.map((row) => (
                <TableRow hover key={row.id}>
                  <TableCell><Typography variant="subtitle2">{row.produto_nome || '-'}</Typography></TableCell>
                  <TableCell>{row.empresa_nome || '-'}</TableCell>
                  <TableCell><Chip label={row.tipo === 'entrada' ? 'Entrada' : 'Saída'} size="small" color={row.tipo === 'entrada' ? 'success' : 'error'} /></TableCell>
                  <TableCell>{row.quantidade}</TableCell>
                  <TableCell>{row.motivo || '-'}</TableCell>
                  <TableCell>{dayjs(row.criado_em).format('DD/MM/YYYY HH:mm')}</TableCell>
                  <TableCell align="right">
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
              <CardHeader title="Nova Movimentação de Estoque" />
              <Divider />
              <CardContent>
                <Grid container spacing={3}>
                  <Grid size={12}>
                    <Controller name="produto_id" control={control} render={({ field }) => (
                      <FormControl fullWidth error={Boolean(errors.produto_id)}>
                        <InputLabel>Produto</InputLabel>
                        <Select {...field} label="Produto">{produtos.map((p) => (<MenuItem key={p.id} value={p.id}>{p.nome}</MenuItem>))}</Select>
                        {errors.produto_id && <FormHelperText>{errors.produto_id.message}</FormHelperText>}
                      </FormControl>
                    )} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Controller name="tipo" control={control} render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel>Tipo</InputLabel>
                        <Select {...field} label="Tipo">
                          <MenuItem value="entrada">Entrada</MenuItem>
                          <MenuItem value="saida">Saída</MenuItem>
                        </Select>
                      </FormControl>
                    )} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Controller name="quantidade" control={control} render={({ field }) => (
                      <FormControl fullWidth error={Boolean(errors.quantidade)}>
                        <InputLabel>Quantidade</InputLabel>
                        <OutlinedInput {...field} type="number" label="Quantidade" onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} />
                        {errors.quantidade && <FormHelperText>{errors.quantidade.message}</FormHelperText>}
                      </FormControl>
                    )} />
                  </Grid>
                  <Grid size={12}>
                    <Controller name="motivo" control={control} render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel>Motivo</InputLabel>
                        <OutlinedInput {...field} value={field.value || ''} label="Motivo" multiline rows={2} />
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
