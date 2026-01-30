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
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select from '@mui/material/Select';
import Switch from '@mui/material/Switch';
import { PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { PencilSimpleIcon } from '@phosphor-icons/react/dist/ssr/PencilSimple';
import { TrashIcon } from '@phosphor-icons/react/dist/ssr/Trash';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import dayjs from 'dayjs';

import type { BloqueioProfissional, Usuario } from '@/types/database';
import { LoadingOverlay } from '@/components/core/loading-overlay';
import { useEmpresa } from '@/hooks/use-empresa';

const DIAS_SEMANA = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Segunda-feira' },
  { value: 2, label: 'Terça-feira' },
  { value: 3, label: 'Quarta-feira' },
  { value: 4, label: 'Quinta-feira' },
  { value: 5, label: 'Sexta-feira' },
  { value: 6, label: 'Sábado' },
];

const schema = z.object({
  usuario_id: z.coerce.number().min(1, 'Profissional é obrigatório'),
  inicio: z.string().min(1, 'Data/hora início é obrigatória'),
  fim: z.string().min(1, 'Data/hora fim é obrigatória'),
  motivo: z.string().nullable().optional(),
  is_recorrente: z.boolean(),
  dia_semana_recorrente: z.coerce.number().nullable().optional(),
});

type FormData = z.infer<typeof schema>;

export default function BloqueiosProfissionalPage(): React.JSX.Element {
  const { empresaId } = useEmpresa();
  const [bloqueios, setBloqueios] = React.useState<(BloqueioProfissional & { profissional_nome?: string })[]>([]);
  const [profissionais, setProfissionais] = React.useState<Usuario[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [loadingData, setLoadingData] = React.useState(true);
  const [loadingSave, setLoadingSave] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedBloqueio, setSelectedBloqueio] = React.useState<BloqueioProfissional | null>(null);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { usuario_id: 0, inicio: '', fim: '', motivo: '', is_recorrente: false, dia_semana_recorrente: null },
  });

  const isRecorrente = useWatch({ control, name: 'is_recorrente' });

  const fetchBloqueios = React.useCallback(async () => {
    setLoadingData(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: rowsPerPage.toString() });
      const response = await fetch(`/api/bloqueios-profissional?${params}`);
      const data = await response.json();
      setBloqueios(data.data || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Erro ao buscar bloqueios:', error);
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

  React.useEffect(() => { fetchBloqueios(); fetchProfissionais(); }, [fetchBloqueios, fetchProfissionais]);

  const formatDateForInput = (date: Date | string | undefined) => {
    if (!date) return '';
    return dayjs(date).format('YYYY-MM-DDTHH:mm');
  };

  const handleOpenDialog = (bloqueio?: BloqueioProfissional) => {
    setSelectedBloqueio(bloqueio || null);
    reset({
      usuario_id: bloqueio?.usuario_id || 0,
      inicio: formatDateForInput(bloqueio?.inicio),
      fim: formatDateForInput(bloqueio?.fim),
      motivo: bloqueio?.motivo || '',
      is_recorrente: bloqueio?.dia_semana_recorrente !== null && bloqueio?.dia_semana_recorrente !== undefined,
      dia_semana_recorrente: bloqueio?.dia_semana_recorrente ?? null,
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => { setDialogOpen(false); setSelectedBloqueio(null); };

  const onSubmit = async (data: FormData) => {
    setLoadingSave(true);
    try {
      const payload = {
        ...data,
        dia_semana_recorrente: data.is_recorrente ? data.dia_semana_recorrente : null,
      };
      const url = selectedBloqueio ? `/api/bloqueios-profissional/${selectedBloqueio.id}` : '/api/bloqueios-profissional';
      const method = selectedBloqueio ? 'PUT' : 'POST';
      const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (response.ok) { handleCloseDialog(); fetchBloqueios(); }
    } catch (error) {
      console.error('Erro ao salvar:', error);
    } finally {
      setLoadingSave(false);
    }
  };

  const getDiaSemanaLabel = (dia: number | null | undefined) => {
    if (dia === null || dia === undefined) return null;
    return DIAS_SEMANA.find(d => d.value === dia)?.label || '-';
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir?')) return;
    try {
      const response = await fetch(`/api/bloqueios-profissional/${id}`, { method: 'DELETE' });
      if (response.ok) { fetchBloqueios(); }
    } catch (error) {
      console.error('Erro ao excluir:', error);
    }
  };

  return (
    <Box sx={{ position: 'relative', minHeight: 400 }}>
      <LoadingOverlay open={loadingData} message="Carregando bloqueios..." />
      <Stack spacing={3}>
        <Stack direction="row" spacing={3} alignItems="center" justifyContent="space-between">
          <Typography variant="h4">Bloqueios de Profissionais</Typography>
          <Button startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />} variant="contained" onClick={() => handleOpenDialog()}>Novo Bloqueio</Button>
        </Stack>
        <Card>
        <Box sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: '700px' }}>
            <TableHead>
              <TableRow>
                <TableCell>Profissional</TableCell>
                <TableCell>Início</TableCell>
                <TableCell>Fim</TableCell>
                <TableCell>Motivo</TableCell>
                <TableCell>Recorrência</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bloqueios.map((row) => (
                <TableRow hover key={row.id}>
                  <TableCell><Typography variant="subtitle2">{row.profissional_nome || '-'}</Typography></TableCell>
                  <TableCell>{dayjs(row.inicio).format('DD/MM/YYYY HH:mm')}</TableCell>
                  <TableCell>{dayjs(row.fim).format('DD/MM/YYYY HH:mm')}</TableCell>
                  <TableCell>{row.motivo || '-'}</TableCell>
                  <TableCell>
                    {row.dia_semana_recorrente !== null && row.dia_semana_recorrente !== undefined ? (
                      <Chip label={getDiaSemanaLabel(row.dia_semana_recorrente)} color="info" size="small" />
                    ) : (
                      <Chip label="Único" variant="outlined" size="small" />
                    )}
                  </TableCell>
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
              <CardHeader title={selectedBloqueio ? 'Editar Bloqueio' : 'Novo Bloqueio'} />
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
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Controller name="inicio" control={control} render={({ field }) => (
                      <FormControl fullWidth error={Boolean(errors.inicio)}>
                        <InputLabel shrink>Início</InputLabel>
                        <OutlinedInput {...field} type="datetime-local" label="Início" notched />
                        {errors.inicio && <FormHelperText>{errors.inicio.message}</FormHelperText>}
                      </FormControl>
                    )} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Controller name="fim" control={control} render={({ field }) => (
                      <FormControl fullWidth error={Boolean(errors.fim)}>
                        <InputLabel shrink>Fim</InputLabel>
                        <OutlinedInput {...field} type="datetime-local" label="Fim" notched />
                        {errors.fim && <FormHelperText>{errors.fim.message}</FormHelperText>}
                      </FormControl>
                    )} />
                  </Grid>
                  <Grid size={12}>
                    <Controller name="motivo" control={control} render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel>Motivo</InputLabel>
                        <OutlinedInput {...field} value={field.value || ''} label="Motivo" multiline rows={2} placeholder="Ex: Férias, Atestado médico" />
                      </FormControl>
                    )} />
                  </Grid>
                  <Grid size={12}>
                    <Controller name="is_recorrente" control={control} render={({ field }) => (
                      <FormControlLabel
                        control={<Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />}
                        label="Bloqueio recorrente (repete toda semana)"
                      />
                    )} />
                  </Grid>
                  {isRecorrente && (
                    <Grid size={12}>
                      <Controller name="dia_semana_recorrente" control={control} render={({ field }) => (
                        <FormControl fullWidth>
                          <InputLabel>Dia da Semana</InputLabel>
                          <Select 
                            value={field.value !== null && field.value !== undefined ? field.value : ''} 
                            label="Dia da Semana" 
                            onChange={(e) => {
                              const val = e.target.value;
                              field.onChange(typeof val === 'string' && val === '' ? null : Number(val));
                            }}
                          >
                            {DIAS_SEMANA.map((dia) => (
                              <MenuItem key={dia.value} value={dia.value}>{dia.label}</MenuItem>
                            ))}
                          </Select>
                          <FormHelperText>Selecione o dia da semana que este bloqueio se repete</FormHelperText>
                        </FormControl>
                      )} />
                    </Grid>
                  )}
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
