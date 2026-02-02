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

import type { ProdutoAdicional, Produto } from '@/types/database';
import { LoadingOverlay } from '@/components/core/loading-overlay';
import { useEmpresa } from '@/hooks/use-empresa';
import { getAuthHeaders } from '@/lib/auth/client';

const schema = z.object({
  produto_id: z.coerce.number().min(1, 'Produto é obrigatório'),
  nome: z.string().min(1, 'Nome é obrigatório'),
  preco: z.coerce.number().min(0),
});

type FormData = z.infer<typeof schema>;

export default function ProdutoAdicionaisPage(): React.JSX.Element {
  const { empresaId } = useEmpresa();
  const [adicionais, setAdicionais] = React.useState<(ProdutoAdicional & { produto_nome?: string })[]>([]);
  const [produtos, setProdutos] = React.useState<Produto[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [loadingData, setLoadingData] = React.useState(true);
  const [loadingSave, setLoadingSave] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedAdicional, setSelectedAdicional] = React.useState<ProdutoAdicional | null>(null);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { produto_id: 0, nome: '', preco: 0 },
  });

  const fetchAdicionais = React.useCallback(async () => {
    setLoadingData(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: rowsPerPage.toString() });
      const response = await fetch(`/api/produto-adicionais?${params}`, { headers: getAuthHeaders() });
      const data = await response.json();
      setAdicionais(data.data || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Erro ao buscar adicionais:', error);
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
      const response = await fetch(`/api/produtos?${params}`, { headers: getAuthHeaders() });
      const data = await response.json();
      setProdutos(data.data || []);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    }
  }, [empresaId]);

  React.useEffect(() => { fetchAdicionais(); fetchProdutos(); }, [fetchAdicionais, fetchProdutos]);

  const handleOpenDialog = (adicional?: ProdutoAdicional) => {
    setSelectedAdicional(adicional || null);
    reset({
      produto_id: adicional?.produto_id || 0,
      nome: adicional?.nome || '',
      preco: adicional?.preco || 0,
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => { setDialogOpen(false); setSelectedAdicional(null); };

  const onSubmit = async (data: FormData) => {
    setLoadingSave(true);
    try {
      const url = selectedAdicional ? `/api/produto-adicionais/${selectedAdicional.id}` : '/api/produto-adicionais';
      const method = selectedAdicional ? 'PUT' : 'POST';
      const response = await fetch(url, { method, headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      if (response.ok) { handleCloseDialog(); fetchAdicionais(); }
    } catch (error) {
      console.error('Erro ao salvar:', error);
    } finally {
      setLoadingSave(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir?')) return;
    try {
      const response = await fetch(`/api/produto-adicionais/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
      if (response.ok) { fetchAdicionais(); }
    } catch (error) {
      console.error('Erro ao excluir:', error);
    }
  };

  return (
    <Box sx={{ position: 'relative', minHeight: 400 }}>
      <LoadingOverlay open={loadingData} message="Carregando adicionais..." />
      <Stack spacing={3}>
        <Stack direction="row" spacing={3} alignItems="center" justifyContent="space-between">
          <Typography variant="h4">Adicionais de Produtos</Typography>
          <Button startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />} variant="contained" onClick={() => handleOpenDialog()}>Novo Adicional</Button>
        </Stack>
        <Card>
        <Box sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: '600px' }}>
            <TableHead>
              <TableRow>
                <TableCell>Produto</TableCell>
                <TableCell>Adicional</TableCell>
                <TableCell>Preço</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {adicionais.map((row) => (
                <TableRow hover key={row.id}>
                  <TableCell>{row.produto_nome || '-'}</TableCell>
                  <TableCell><Typography variant="subtitle2">{row.nome}</Typography></TableCell>
                  <TableCell>R$ {Number(row.preco).toFixed(2)}</TableCell>
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
              <CardHeader title={selectedAdicional ? 'Editar Adicional' : 'Novo Adicional'} />
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
                        <InputLabel>Nome do Adicional</InputLabel>
                        <OutlinedInput {...field} label="Nome do Adicional" placeholder="Ex: Bacon, Queijo Extra" />
                        {errors.nome && <FormHelperText>{errors.nome.message}</FormHelperText>}
                      </FormControl>
                    )} />
                  </Grid>
                  <Grid size={12}>
                    <Controller name="preco" control={control} render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel>Preço</InputLabel>
                        <OutlinedInput {...field} type="number" label="Preço" startAdornment={<InputAdornment position="start">R$</InputAdornment>} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} />
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
