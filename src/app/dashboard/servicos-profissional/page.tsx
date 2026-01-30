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
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select from '@mui/material/Select';
import Switch from '@mui/material/Switch';
import { PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { PencilSimpleIcon } from '@phosphor-icons/react/dist/ssr/PencilSimple';
import { TrashIcon } from '@phosphor-icons/react/dist/ssr/Trash';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import type { ServicoProfissional, Usuario, Servico } from '@/types/database';
import { LoadingOverlay } from '@/components/core/loading-overlay';
import { useEmpresa } from '@/hooks/use-empresa';

const schema = z.object({
  usuario_id: z.coerce.number().min(1, 'Profissional é obrigatório'),
  servico_id: z.coerce.number().min(1, 'Serviço é obrigatório'),
  duracao_minutos: z.coerce.number().min(1, 'Duração é obrigatória'),
  preco: z.coerce.number().nullable().optional(),
  ativo: z.boolean(),
  antecedencia_minima_minutos: z.coerce.number().nullable().optional(),
});

type FormData = z.infer<typeof schema>;

export default function ServicosProfissionalPage(): React.JSX.Element {
  const { empresaId } = useEmpresa();
  const [vinculos, setVinculos] = React.useState<(ServicoProfissional & { profissional_nome?: string; servico_nome?: string })[]>([]);
  const [profissionais, setProfissionais] = React.useState<Usuario[]>([]);
  const [servicos, setServicos] = React.useState<Servico[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [loadingData, setLoadingData] = React.useState(true);
  const [loadingSave, setLoadingSave] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedVinculo, setSelectedVinculo] = React.useState<ServicoProfissional | null>(null);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { usuario_id: 0, servico_id: 0, duracao_minutos: 30, preco: null, ativo: true, antecedencia_minima_minutos: 30 },
  });

  const fetchVinculos = React.useCallback(async () => {
    setLoadingData(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: rowsPerPage.toString() });
      const response = await fetch(`/api/servicos-profissional?${params}`);
      const data = await response.json();
      setVinculos(data.data || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Erro ao buscar vínculos:', error);
    } finally {
      setLoadingData(false);
    }
  }, [page, rowsPerPage]);

  const fetchProfissionais = React.useCallback(async () => {
    try {
      const params = new URLSearchParams({ limit: '1000' });
      if (empresaId) {
        params.set('empresa_id', empresaId.toString());
      }
      const response = await fetch(`/api/profissionais?${params}`);
      const data = await response.json();
      setProfissionais(data.data || []);
    } catch (error) {
      console.error('Erro ao buscar profissionais:', error);
    }
  }, [empresaId]);

  const fetchServicos = React.useCallback(async () => {
    try {
      const params = new URLSearchParams({ limit: '1000' });
      if (empresaId) {
        params.set('empresa_id', empresaId.toString());
      }
      const response = await fetch(`/api/servicos?${params}`);
      const data = await response.json();
      setServicos(data.data || []);
    } catch (error) {
      console.error('Erro ao buscar serviços:', error);
    }
  }, [empresaId]);

  React.useEffect(() => { fetchVinculos(); fetchProfissionais(); fetchServicos(); }, [fetchVinculos, fetchProfissionais, fetchServicos]);

  const handleOpenDialog = (vinculo?: ServicoProfissional) => {
    setSelectedVinculo(vinculo || null);
    reset({
      usuario_id: vinculo?.usuario_id || 0,
      servico_id: vinculo?.servico_id || 0,
      duracao_minutos: vinculo?.duracao_minutos || 30,
      preco: vinculo?.preco || null,
      ativo: vinculo?.ativo ?? true,
      antecedencia_minima_minutos: vinculo?.antecedencia_minima_minutos ?? 30,
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => { setDialogOpen(false); setSelectedVinculo(null); };

  const onSubmit = async (data: FormData) => {
    setLoadingSave(true);
    try {
      const url = selectedVinculo ? `/api/servicos-profissional/${selectedVinculo.id}` : '/api/servicos-profissional';
      const method = selectedVinculo ? 'PUT' : 'POST';
      const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      if (response.ok) { handleCloseDialog(); fetchVinculos(); }
    } catch (error) {
      console.error('Erro ao salvar:', error);
    } finally {
      setLoadingSave(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir?')) return;
    try {
      const response = await fetch(`/api/servicos-profissional/${id}`, { method: 'DELETE' });
      if (response.ok) { fetchVinculos(); }
    } catch (error) {
      console.error('Erro ao excluir:', error);
    }
  };

  return (
    <Box sx={{ position: 'relative', minHeight: 400 }}>
      <LoadingOverlay open={loadingData} message="Carregando serviços dos profissionais..." />
      <Stack spacing={3}>
        <Stack direction="row" spacing={3} alignItems="center" justifyContent="space-between">
          <Typography variant="h4">Serviços por Profissional</Typography>
          <Button startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />} variant="contained" onClick={() => handleOpenDialog()}>Novo Vínculo</Button>
        </Stack>
        <Card>
        <Box sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: '700px' }}>
            <TableHead>
              <TableRow>
                <TableCell>Profissional</TableCell>
                <TableCell>Serviço</TableCell>
                <TableCell>Duração</TableCell>
                <TableCell>Preço</TableCell>
                <TableCell>Antecedência</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {vinculos.map((row) => (
                <TableRow hover key={row.id}>
                  <TableCell><Typography variant="subtitle2">{row.profissional_nome || '-'}</Typography></TableCell>
                  <TableCell>{row.servico_nome || '-'}</TableCell>
                  <TableCell>{row.duracao_minutos} min</TableCell>
                  <TableCell>{row.preco ? `R$ ${Number(row.preco).toFixed(2)}` : 'Preço padrão'}</TableCell>
                  <TableCell>{row.antecedencia_minima_minutos ?? 30} min</TableCell>
                  <TableCell><Chip label={row.ativo ? 'Ativo' : 'Inativo'} size="small" color={row.ativo ? 'success' : 'error'} /></TableCell>
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
              <CardHeader title={selectedVinculo ? 'Editar Vínculo' : 'Novo Vínculo'} />
              <Divider />
              <CardContent>
                <Grid container spacing={3}>
                  <Grid size={12}>
                    <Controller name="usuario_id" control={control} render={({ field }) => (
                      <FormControl fullWidth error={Boolean(errors.usuario_id)}>
                        <InputLabel>Profissional</InputLabel>
                        <Select {...field} label="Profissional">{profissionais.map((p) => (<MenuItem key={p.id} value={p.id}>{p.nome}</MenuItem>))}</Select>
                        {errors.usuario_id && <FormHelperText>{errors.usuario_id.message}</FormHelperText>}
                      </FormControl>
                    )} />
                  </Grid>
                  <Grid size={12}>
                    <Controller name="servico_id" control={control} render={({ field }) => (
                      <FormControl fullWidth error={Boolean(errors.servico_id)}>
                        <InputLabel>Serviço</InputLabel>
                        <Select {...field} label="Serviço">{servicos.map((s) => (<MenuItem key={s.id} value={s.id}>{s.nome}</MenuItem>))}</Select>
                        {errors.servico_id && <FormHelperText>{errors.servico_id.message}</FormHelperText>}
                      </FormControl>
                    )} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Controller name="duracao_minutos" control={control} render={({ field }) => (
                      <FormControl fullWidth error={Boolean(errors.duracao_minutos)}>
                        <InputLabel>Duração</InputLabel>
                        <OutlinedInput {...field} type="number" label="Duração" endAdornment={<InputAdornment position="end">min</InputAdornment>} onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)} />
                        {errors.duracao_minutos && <FormHelperText>{errors.duracao_minutos.message}</FormHelperText>}
                      </FormControl>
                    )} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Controller name="preco" control={control} render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel>Preço Customizado</InputLabel>
                        <OutlinedInput {...field} value={field.value || ''} type="number" label="Preço Customizado" startAdornment={<InputAdornment position="start">R$</InputAdornment>} onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)} />
                      </FormControl>
                    )} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Controller name="antecedencia_minima_minutos" control={control} render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel>Antecedência Mínima</InputLabel>
                        <OutlinedInput {...field} value={field.value ?? 30} type="number" label="Antecedência Mínima" endAdornment={<InputAdornment position="end">min</InputAdornment>} onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value, 10) : null)} />
                        <FormHelperText>Tempo mínimo para agendar este serviço</FormHelperText>
                      </FormControl>
                    )} />
                  </Grid>
                  <Grid size={12}>
                    <Controller name="ativo" control={control} render={({ field }) => (
                      <FormControlLabel control={<Switch checked={field.value} onChange={field.onChange} />} label="Ativo" />
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
