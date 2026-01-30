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
import { PencilSimpleIcon } from '@phosphor-icons/react/dist/ssr/PencilSimple';
import { TrashIcon } from '@phosphor-icons/react/dist/ssr/Trash';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import type { HorarioEmpresa, Empresa } from '@/types/database';
import { LoadingOverlay } from '@/components/core/loading-overlay';
import { useEmpresa } from '@/hooks/use-empresa';
import { getAuthHeaders } from '@/lib/auth/client';

const diasSemana = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Segunda-feira' },
  { value: 2, label: 'Terça-feira' },
  { value: 3, label: 'Quarta-feira' },
  { value: 4, label: 'Quinta-feira' },
  { value: 5, label: 'Sexta-feira' },
  { value: 6, label: 'Sábado' },
];

const schema = z.object({
  empresa_id: z.coerce.number().min(1, 'Empresa é obrigatória'),
  dia_semana: z.coerce.number().min(0).max(6),
  abre: z.string().min(1, 'Horário de abertura é obrigatório'),
  fecha: z.string().min(1, 'Horário de fechamento é obrigatório'),
});

type FormData = z.infer<typeof schema>;

export default function HorariosEmpresaPage(): React.JSX.Element {
  const { empresaId, isAdminGlobal, refreshKey } = useEmpresa();
  const [horarios, setHorarios] = React.useState<(HorarioEmpresa & { empresa_nome?: string })[]>([]);
  const [empresas, setEmpresas] = React.useState<Empresa[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [loadingData, setLoadingData] = React.useState(true);
  const [loadingSave, setLoadingSave] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedHorario, setSelectedHorario] = React.useState<HorarioEmpresa | null>(null);

  const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { empresa_id: empresaId || 0, dia_semana: 1, abre: '', fecha: '' },
  });

  // Atualiza empresa_id quando o hook carrega (para não-admin)
  React.useEffect(() => {
    if (!isAdminGlobal && empresaId) {
      setValue('empresa_id', empresaId);
    }
  }, [empresaId, isAdminGlobal, setValue]);

  const fetchHorarios = React.useCallback(async () => {
    setLoadingData(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: rowsPerPage.toString() });
      const response = await fetch(`/api/horarios-empresa?${params}`, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      setHorarios(data.data || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Erro ao buscar horários:', error);
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

  React.useEffect(() => {
    fetchHorarios();
    fetchEmpresas();
  }, [fetchHorarios]);

  const handleOpenDialog = (horario?: HorarioEmpresa) => {
    setSelectedHorario(horario || null);
    reset({
      empresa_id: horario?.empresa_id || empresaId || 0,
      dia_semana: horario?.dia_semana ?? 1,
      abre: horario?.abre || '',
      fecha: horario?.fecha || '',
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedHorario(null);
  };

  const onSubmit = async (data: FormData) => {
    setLoadingSave(true);
    try {
      const url = selectedHorario ? `/api/horarios-empresa/${selectedHorario.id}` : '/api/horarios-empresa';
      const method = selectedHorario ? 'PUT' : 'POST';
      const response = await fetch(url, { method, headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      if (response.ok) { handleCloseDialog(); fetchHorarios(); }
    } catch (error) {
      console.error('Erro ao salvar horário:', error);
    } finally {
      setLoadingSave(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este horário?')) return;
    try {
      const response = await fetch(`/api/horarios-empresa/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
      if (response.ok) { fetchHorarios(); }
    } catch (error) {
      console.error('Erro ao excluir horário:', error);
    }
  };

  const getDiaSemanaLabel = (dia: number) => diasSemana.find(d => d.value === dia)?.label || '-';

  return (
    <Box sx={{ position: 'relative', minHeight: 400 }}>
      <LoadingOverlay open={loadingData} message="Carregando horários..." />
      <Stack spacing={3}>
        <Stack direction="row" spacing={3} alignItems="center" justifyContent="space-between">
          <Typography variant="h4">Horários da Empresa</Typography>
          <Button startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />} variant="contained" onClick={() => handleOpenDialog()}>Novo Horário</Button>
        </Stack>
        <Card>
        <Box sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: '600px' }}>
            <TableHead>
              <TableRow>
                <TableCell>Empresa</TableCell>
                <TableCell>Dia da Semana</TableCell>
                <TableCell>Abre</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {horarios.map((row) => (
                <TableRow hover key={row.id}>
                  <TableCell><Typography variant="subtitle2">{row.empresa_nome || '-'}</Typography></TableCell>
                  <TableCell>{getDiaSemanaLabel(row.dia_semana)}</TableCell>
                  <TableCell>{row.abre}</TableCell>
                  <TableCell>{row.fecha}</TableCell>
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
              <CardHeader title={selectedHorario ? 'Editar Horário' : 'Novo Horário'} />
              <Divider />
              <CardContent>
                <Grid container spacing={3}>
                  {/* Campo Empresa - Apenas visível para admin_global */}
                  {isAdminGlobal && (
                    <Grid size={12}>
                      <Controller name="empresa_id" control={control} render={({ field }) => (
                        <FormControl fullWidth error={Boolean(errors.empresa_id)}>
                          <InputLabel>Empresa</InputLabel>
                          <Select {...field} label="Empresa">{empresas.map((e) => (<MenuItem key={e.id} value={e.id}>{e.nome}</MenuItem>))}</Select>
                          {errors.empresa_id && <FormHelperText>{errors.empresa_id.message}</FormHelperText>}
                        </FormControl>
                      )} />
                    </Grid>
                  )}
                  <Grid size={12}>
                    <Controller name="dia_semana" control={control} render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel>Dia da Semana</InputLabel>
                        <Select {...field} label="Dia da Semana">{diasSemana.map((d) => (<MenuItem key={d.value} value={d.value}>{d.label}</MenuItem>))}</Select>
                      </FormControl>
                    )} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Controller name="abre" control={control} render={({ field }) => (
                      <FormControl fullWidth error={Boolean(errors.abre)}>
                        <InputLabel shrink>Abre</InputLabel>
                        <OutlinedInput {...field} type="time" label="Abre" notched />
                        {errors.abre && <FormHelperText>{errors.abre.message}</FormHelperText>}
                      </FormControl>
                    )} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Controller name="fecha" control={control} render={({ field }) => (
                      <FormControl fullWidth error={Boolean(errors.fecha)}>
                        <InputLabel shrink>Fecha</InputLabel>
                        <OutlinedInput {...field} type="time" label="Fecha" notched />
                        {errors.fecha && <FormHelperText>{errors.fecha.message}</FormHelperText>}
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
