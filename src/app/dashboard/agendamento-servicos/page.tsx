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
import dayjs from 'dayjs';

import type { AgendamentoServico, Agendamento, Servico } from '@/types/database';
import { LoadingOverlay } from '@/components/core/loading-overlay';
import { useEmpresa } from '@/hooks/use-empresa';

const schema = z.object({
  agendamento_id: z.coerce.number().min(1, 'Agendamento é obrigatório'),
  servico_id: z.coerce.number().min(1, 'Serviço é obrigatório'),
  duracao_minutos: z.coerce.number().min(1, 'Duração é obrigatória'),
  preco: z.coerce.number().min(0, 'Preço é obrigatório'),
});

type FormData = z.infer<typeof schema>;

export default function AgendamentoServicosPage(): React.JSX.Element {
  const { empresaId } = useEmpresa();
  const [vinculacoes, setVinculacoes] = React.useState<(AgendamentoServico & { agendamento_cliente?: string; servico_nome?: string })[]>([]);
  const [agendamentos, setAgendamentos] = React.useState<(Agendamento & { cliente_nome?: string })[]>([]);
  const [servicos, setServicos] = React.useState<Servico[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [loadingData, setLoadingData] = React.useState(true);
  const [loadingSave, setLoadingSave] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { agendamento_id: 0, servico_id: 0, duracao_minutos: 30, preco: 0 },
  });

  const fetchVinculacoes = React.useCallback(async () => {
    setLoadingData(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: rowsPerPage.toString() });
      const response = await fetch(`/api/agendamento-servicos?${params}`);
      const data = await response.json();
      setVinculacoes(data.data || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Erro ao buscar vinculações:', error);
    } finally {
      setLoadingData(false);
    }
  }, [page, rowsPerPage]);

  const fetchAgendamentos = React.useCallback(async () => {
    try {
      const params = new URLSearchParams({ limit: '1000' });
      if (empresaId) {
        params.set('empresa_id', empresaId.toString());
      }
      const response = await fetch(`/api/agendamentos?${params}`);
      const data = await response.json();
      setAgendamentos(data.data || []);
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
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

  React.useEffect(() => {
    fetchVinculacoes();
    fetchAgendamentos();
    fetchServicos();
  }, [fetchVinculacoes, fetchAgendamentos, fetchServicos]);

  const handleOpenDialog = () => {
    reset({ agendamento_id: 0, servico_id: 0, duracao_minutos: 30, preco: 0 });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const onSubmit = async (data: FormData) => {
    setLoadingSave(true);
    try {
      const response = await fetch('/api/agendamento-servicos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (response.ok) { handleCloseDialog(); fetchVinculacoes(); }
    } catch (error) {
      console.error('Erro ao salvar vinculação:', error);
    } finally {
      setLoadingSave(false);
    }
  };

  const handleDelete = async (agendamentoId: number, servicoId: number) => {
    if (!confirm('Tem certeza que deseja remover este serviço do agendamento?')) return;
    try {
      const response = await fetch(`/api/agendamento-servicos?agendamento_id=${agendamentoId}&servico_id=${servicoId}`, { method: 'DELETE' });
      if (response.ok) fetchVinculacoes();
    } catch (error) {
      console.error('Erro ao excluir vinculação:', error);
    }
  };

  const formatCurrency = (value: number | string | undefined) => {
    if (value === undefined || value === null) return '-';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value));
  };

  const formatDateTime = (date: string | Date | undefined) => {
    if (!date) return '-';
    return dayjs(date).format('DD/MM/YYYY HH:mm');
  };

  return (
    <Box sx={{ position: 'relative', minHeight: '100%' }}>
      <LoadingOverlay open={loadingData} message="Carregando serviços de agendamento..." />
      <Stack spacing={3}>
        <Stack direction="row" spacing={3} alignItems="center" justifyContent="space-between">
          <Typography variant="h4">Serviços dos Agendamentos</Typography>
          <Button startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />} variant="contained" onClick={handleOpenDialog}>
            Vincular Serviço
          </Button>
        </Stack>
        <Card>
          <Box sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: 700 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Agendamento</TableCell>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Serviço</TableCell>
                  <TableCell align="center">Duração</TableCell>
                  <TableCell align="right">Preço</TableCell>
                  <TableCell align="center">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {vinculacoes.map((v, index) => (
                  <TableRow hover key={`${v.agendamento_id}-${v.servico_id}-${index}`}>
                    <TableCell>#{v.agendamento_id}</TableCell>
                    <TableCell>{v.agendamento_cliente || '-'}</TableCell>
                    <TableCell>{v.servico_nome || '-'}</TableCell>
                    <TableCell align="center">{v.duracao_minutos} min</TableCell>
                    <TableCell align="right">{formatCurrency(v.preco)}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Remover">
                        <IconButton onClick={() => handleDelete(v.agendamento_id, v.servico_id)} color="error">
                          <TrashIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {vinculacoes.length === 0 && !loadingData && (
                  <TableRow><TableCell colSpan={6} align="center">Nenhum serviço vinculado</TableCell></TableRow>
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
                <CardHeader title="Vincular Serviço ao Agendamento" />
                <Divider />
                <CardContent>
                  <Grid container spacing={3}>
                    <Grid size={12}>
                      <Controller name="agendamento_id" control={control} render={({ field }) => (
                        <FormControl fullWidth error={Boolean(errors.agendamento_id)}>
                          <InputLabel>Agendamento</InputLabel>
                          <Select {...field} label="Agendamento" value={field.value || ''} onChange={(e) => field.onChange(Number(e.target.value))}>
                            {agendamentos.map((a) => (
                              <MenuItem key={a.id} value={a.id}>
                                #{a.id} - {a.cliente_nome || 'Cliente'} ({formatDateTime(a.inicio)})
                              </MenuItem>
                            ))}
                          </Select>
                          {errors.agendamento_id && <FormHelperText>{errors.agendamento_id.message}</FormHelperText>}
                        </FormControl>
                      )} />
                    </Grid>
                    <Grid size={12}>
                      <Controller name="servico_id" control={control} render={({ field }) => (
                        <FormControl fullWidth error={Boolean(errors.servico_id)}>
                          <InputLabel>Serviço</InputLabel>
                          <Select {...field} label="Serviço" value={field.value || ''} onChange={(e) => field.onChange(Number(e.target.value))}>
                            {servicos.map((s) => (
                              <MenuItem key={s.id} value={s.id}>{s.nome}</MenuItem>
                            ))}
                          </Select>
                          {errors.servico_id && <FormHelperText>{errors.servico_id.message}</FormHelperText>}
                        </FormControl>
                      )} />
                    </Grid>
                    <Grid size={6}>
                      <Controller name="duracao_minutos" control={control} render={({ field }) => (
                        <FormControl fullWidth error={Boolean(errors.duracao_minutos)}>
                          <InputLabel>Duração (min)</InputLabel>
                          <OutlinedInput {...field} label="Duração (min)" type="number" onChange={(e) => field.onChange(Number(e.target.value))} />
                          {errors.duracao_minutos && <FormHelperText>{errors.duracao_minutos.message}</FormHelperText>}
                        </FormControl>
                      )} />
                    </Grid>
                    <Grid size={6}>
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
                    {loadingSave ? 'Salvando...' : 'Vincular'}
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
