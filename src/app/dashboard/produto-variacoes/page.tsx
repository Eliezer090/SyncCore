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
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import OutlinedInput from '@mui/material/OutlinedInput';
import { PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { PencilSimpleIcon } from '@phosphor-icons/react/dist/ssr/PencilSimple';
import { TrashIcon } from '@phosphor-icons/react/dist/ssr/Trash';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import type { ProdutoVariacao, Produto } from '@/types/database';
import { LoadingOverlay } from '@/components/core/loading-overlay';
import { useEmpresa } from '@/hooks/use-empresa';

const schema = z.object({
  produto_id: z.coerce.number().min(1, 'Produto é obrigatório'),
  nome: z.string().min(1, 'Nome é obrigatório'),
  preco_adicional: z.coerce.number().min(0),
});

type FormData = z.infer<typeof schema>;

export default function ProdutoVariacoesPage(): React.JSX.Element {
  const { empresaId } = useEmpresa();
  const [variacoes, setVariacoes] = React.useState<(ProdutoVariacao & { produto_nome?: string })[]>([]);
  const [produtos, setProdutos] = React.useState<Produto[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [loadingData, setLoadingData] = React.useState(true);
  const [loadingSave, setLoadingSave] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedVariacao, setSelectedVariacao] = React.useState<ProdutoVariacao | null>(null);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { produto_id: 0, nome: '', preco_adicional: 0 },
  });

  const fetchVariacoes = React.useCallback(async () => {
    setLoadingData(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: rowsPerPage.toString() });
      const response = await fetch(`/api/produto-variacoes?${params}`);
      const data = await response.json();
      setVariacoes(data.data || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Erro ao buscar variações:', error);
    } finally {
      setLoadingData(false);
    }
  }, [page, rowsPerPage]);

  const fetchProdutos = React.useCallback(async () => {
    try {
      const params = new URLSearchParams({ limit: '1000' });
      if (empresaId) {
        params.set('empresa_id', empresaId.toString());
      }
      const response = await fetch(`/api/produtos?${params}`);
      const data = await response.json();
      setProdutos(data.data || []);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    }
  }, [empresaId]);

  React.useEffect(() => { fetchVariacoes(); fetchProdutos(); }, [fetchVariacoes, fetchProdutos]);

  const handleOpenDialog = (variacao?: ProdutoVariacao) => {
    setSelectedVariacao(variacao || null);
    reset({
      produto_id: variacao?.produto_id || 0,
      nome: variacao?.nome || '',
      preco_adicional: variacao?.preco_adicional || 0,
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => { setDialogOpen(false); setSelectedVariacao(null); };

  const onSubmit = async (data: FormData) => {
    setLoadingSave(true);
    try {
      const url = selectedVariacao ? `/api/produto-variacoes/${selectedVariacao.id}` : '/api/produto-variacoes';
      const method = selectedVariacao ? 'PUT' : 'POST';
      const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      if (response.ok) { handleCloseDialog(); fetchVariacoes(); }
    } catch (error) {
      console.error('Erro ao salvar:', error);
    } finally {
      setLoadingSave(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir?')) return;
    try {
      const response = await fetch(`/api/produto-variacoes/${id}`, { method: 'DELETE' });
      if (response.ok) { fetchVariacoes(); }
    } catch (error) {
      console.error('Erro ao excluir:', error);
    }
  };

  return (
    <Box sx={{ position: 'relative', minHeight: 400 }}>
      <LoadingOverlay open={loadingData} message="Carregando variações..." />
      <Stack spacing={3}>
        <Stack direction="row" spacing={3} alignItems="center" justifyContent="space-between">
          <Typography variant="h4">Variações de Produtos</Typography>
          <Button startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />} variant="contained" onClick={() => handleOpenDialog()}>Nova Variação</Button>
        </Stack>
        <Card>
        <Box sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: '600px' }}>
            <TableHead>
              <TableRow>
                <TableCell>Produto</TableCell>
                <TableCell>Variação</TableCell>
                <TableCell>Preço Adicional</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {variacoes.map((row) => (
                <TableRow hover key={row.id}>
                  <TableCell>{row.produto_nome || '-'}</TableCell>
                  <TableCell><Typography variant="subtitle2">{row.nome}</Typography></TableCell>
                  <TableCell>R$ {Number(row.preco_adicional).toFixed(2)}</TableCell>
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
              <CardHeader title={selectedVariacao ? 'Editar Variação' : 'Nova Variação'} />
              <Divider />
              <CardContent>
                <Grid container spacing={3}>
                  <Grid size={12}>
                    <Controller name="produto_id" control={control} render={({ field }) => (
                      <Autocomplete
                        options={produtos}
                        getOptionLabel={(option) => option.nome}
                        value={produtos.find(p => p.id === field.value) || null}
                        onChange={(_, newValue) => field.onChange(newValue?.id || 0)}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        renderInput={(params) => (
                          <TextField 
                            {...params} 
                            label="Produto" 
                            error={Boolean(errors.produto_id)} 
                            helperText={errors.produto_id?.message}
                          />
                        )}
                        noOptionsText="Nenhum produto encontrado"
                      />
                    )} />
                  </Grid>
                  <Grid size={12}>
                    <Controller name="nome" control={control} render={({ field }) => (
                      <FormControl fullWidth error={Boolean(errors.nome)}>
                        <InputLabel>Nome da Variação</InputLabel>
                        <OutlinedInput {...field} label="Nome da Variação" placeholder="Ex: Grande, Médio, 500ml" />
                        {errors.nome && <FormHelperText>{errors.nome.message}</FormHelperText>}
                      </FormControl>
                    )} />
                  </Grid>
                  <Grid size={12}>
                    <Controller name="preco_adicional" control={control} render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel>Preço Adicional</InputLabel>
                        <OutlinedInput {...field} type="number" label="Preço Adicional" startAdornment={<InputAdornment position="start">R$</InputAdornment>} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} />
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
