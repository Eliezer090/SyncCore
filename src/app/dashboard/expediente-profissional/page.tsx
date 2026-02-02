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
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import OutlinedInput from '@mui/material/OutlinedInput';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import { PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { PencilSimpleIcon } from '@phosphor-icons/react/dist/ssr/PencilSimple';
import { TrashIcon } from '@phosphor-icons/react/dist/ssr/Trash';
import { CheckIcon } from '@phosphor-icons/react/dist/ssr/Check';
import { XIcon } from '@phosphor-icons/react/dist/ssr/X';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import type { ExpedienteProfissional, Usuario } from '@/types/database';
import { LoadingOverlay } from '@/components/core/loading-overlay';
import { useEmpresa } from '@/hooks/use-empresa';

const schema = z.object({
  usuario_id: z.coerce.number().min(1, 'Profissional é obrigatório'),
  seg_sex_manha_inicio: z.string().nullable().optional(),
  seg_sex_manha_fim: z.string().nullable().optional(),
  seg_sex_tarde_inicio: z.string().nullable().optional(),
  seg_sex_tarde_fim: z.string().nullable().optional(),
  trabalha_sabado: z.boolean(),
  sabado_manha_inicio: z.string().nullable().optional(),
  sabado_manha_fim: z.string().nullable().optional(),
  sabado_tarde_inicio: z.string().nullable().optional(),
  sabado_tarde_fim: z.string().nullable().optional(),
  trabalha_domingo: z.boolean(),
  domingo_manha_inicio: z.string().nullable().optional(),
  domingo_manha_fim: z.string().nullable().optional(),
  domingo_tarde_inicio: z.string().nullable().optional(),
  domingo_tarde_fim: z.string().nullable().optional(),
});

type FormData = z.infer<typeof schema>;

export default function ExpedienteProfissionalPage(): React.JSX.Element {
  const { empresaId } = useEmpresa();
  const [expedientes, setExpedientes] = React.useState<(ExpedienteProfissional & { profissional_nome?: string })[]>([]);
  const [profissionais, setProfissionais] = React.useState<Usuario[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [loadingData, setLoadingData] = React.useState(true);
  const [loadingSave, setLoadingSave] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedExpediente, setSelectedExpediente] = React.useState<ExpedienteProfissional | null>(null);

  const { control, handleSubmit, reset, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      usuario_id: 0,
      seg_sex_manha_inicio: '',
      seg_sex_manha_fim: '',
      seg_sex_tarde_inicio: '',
      seg_sex_tarde_fim: '',
      trabalha_sabado: false,
      sabado_manha_inicio: '',
      sabado_manha_fim: '',
      sabado_tarde_inicio: '',
      sabado_tarde_fim: '',
      trabalha_domingo: false,
      domingo_manha_inicio: '',
      domingo_manha_fim: '',
      domingo_tarde_inicio: '',
      domingo_tarde_fim: '',
    },
  });

  const trabalhaSabado = watch('trabalha_sabado');
  const trabalhaDomingo = watch('trabalha_domingo');

  const fetchExpedientes = React.useCallback(async () => {
    setLoadingData(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: rowsPerPage.toString() });
      const response = await fetch(`/api/expediente-profissional?${params}`);
      const data = await response.json();
      setExpedientes(data.data || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Erro ao buscar expedientes:', error);
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

  React.useEffect(() => { fetchExpedientes(); fetchProfissionais(); }, [fetchExpedientes, fetchProfissionais]);

  const formatTime = (time: string | null) => {
    if (!time) return '';
    // Se já está no formato HH:mm, retorna direto
    if (time.length === 5) return time;
    // Se está no formato HH:mm:ss, remove os segundos
    return time.substring(0, 5);
  };

  const handleOpenDialog = (expediente?: ExpedienteProfissional) => {
    setSelectedExpediente(expediente || null);
    reset({
      usuario_id: expediente?.usuario_id || 0,
      seg_sex_manha_inicio: formatTime(expediente?.seg_sex_manha_inicio || null),
      seg_sex_manha_fim: formatTime(expediente?.seg_sex_manha_fim || null),
      seg_sex_tarde_inicio: formatTime(expediente?.seg_sex_tarde_inicio || null),
      seg_sex_tarde_fim: formatTime(expediente?.seg_sex_tarde_fim || null),
      trabalha_sabado: expediente?.trabalha_sabado || false,
      sabado_manha_inicio: formatTime(expediente?.sabado_manha_inicio || null),
      sabado_manha_fim: formatTime(expediente?.sabado_manha_fim || null),
      sabado_tarde_inicio: formatTime(expediente?.sabado_tarde_inicio || null),
      sabado_tarde_fim: formatTime(expediente?.sabado_tarde_fim || null),
      trabalha_domingo: expediente?.trabalha_domingo || false,
      domingo_manha_inicio: formatTime(expediente?.domingo_manha_inicio || null),
      domingo_manha_fim: formatTime(expediente?.domingo_manha_fim || null),
      domingo_tarde_inicio: formatTime(expediente?.domingo_tarde_inicio || null),
      domingo_tarde_fim: formatTime(expediente?.domingo_tarde_fim || null),
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => { setDialogOpen(false); setSelectedExpediente(null); };

  const onSubmit = async (data: FormData) => {
    setLoadingSave(true);
    try {
      const url = selectedExpediente ? `/api/expediente-profissional/${selectedExpediente.id}` : '/api/expediente-profissional';
      const method = selectedExpediente ? 'PUT' : 'POST';
      const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      if (response.ok) { handleCloseDialog(); fetchExpedientes(); }
    } catch (error) {
      console.error('Erro ao salvar:', error);
    } finally {
      setLoadingSave(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir?')) return;
    try {
      const response = await fetch(`/api/expediente-profissional/${id}`, { method: 'DELETE' });
      if (response.ok) { fetchExpedientes(); }
    } catch (error) {
      console.error('Erro ao excluir:', error);
    }
  };

  // Profissionais que já têm expediente cadastrado
  const profissionaisComExpediente = expedientes.map(e => e.usuario_id);

  return (
    <Box sx={{ position: 'relative', minHeight: 400 }}>
      <LoadingOverlay open={loadingData} message="Carregando expedientes..." />
      <Stack spacing={3}>
        <Stack direction="row" spacing={3} alignItems="center" justifyContent="space-between">
          <Typography variant="h4">Expediente dos Profissionais</Typography>
          <Button startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />} variant="contained" onClick={() => handleOpenDialog()}>
            Novo Expediente
          </Button>
        </Stack>

        <Alert severity="info">
          Configure os horários de trabalho de cada profissional. Defina o expediente de segunda a sexta, e opcionalmente sábados e domingos.
        </Alert>

        <Card>
          <Box sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: '900px' }}>
              <TableHead>
                <TableRow>
                  <TableCell>Profissional</TableCell>
                  <TableCell>Seg-Sex Manhã</TableCell>
                  <TableCell>Seg-Sex Tarde</TableCell>
                  <TableCell>Sábado</TableCell>
                  <TableCell>Domingo</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {expedientes.map((row) => (
                  <TableRow hover key={row.id}>
                    <TableCell>
                      <Typography variant="subtitle2">{row.profissional_nome || '-'}</Typography>
                    </TableCell>
                    <TableCell>
                      {row.seg_sex_manha_inicio && row.seg_sex_manha_fim ? (
                        <Chip size="small" label={`${formatTime(row.seg_sex_manha_inicio)} - ${formatTime(row.seg_sex_manha_fim)}`} color="primary" variant="outlined" />
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      {row.seg_sex_tarde_inicio && row.seg_sex_tarde_fim ? (
                        <Chip size="small" label={`${formatTime(row.seg_sex_tarde_inicio)} - ${formatTime(row.seg_sex_tarde_fim)}`} color="primary" variant="outlined" />
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      {row.trabalha_sabado ? (
                        <Stack direction="row" spacing={1} alignItems="center">
                          <CheckIcon color="green" />
                          {row.sabado_inicio && row.sabado_fim && (
                            <Chip size="small" label={`${formatTime(row.sabado_inicio)} - ${formatTime(row.sabado_fim)}`} color="success" variant="outlined" />
                          )}
                        </Stack>
                      ) : (
                        <XIcon color="gray" />
                      )}
                    </TableCell>
                    <TableCell>
                      {row.trabalha_domingo ? (
                        <Stack direction="row" spacing={1} alignItems="center">
                          <CheckIcon color="green" />
                          {row.domingo_inicio && row.domingo_fim && (
                            <Chip size="small" label={`${formatTime(row.domingo_inicio)} - ${formatTime(row.domingo_fim)}`} color="success" variant="outlined" />
                          )}
                        </Stack>
                      ) : (
                        <XIcon color="gray" />
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
          <TablePagination
            component="div"
            count={total}
            onPageChange={(_, p) => setPage(p)}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            page={page}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
            labelRowsPerPage="Linhas por página"
          />
        </Card>

        <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Card>
                <CardHeader title={selectedExpediente ? 'Editar Expediente' : 'Novo Expediente'} />
                <Divider />
                <CardContent>
                  <Grid container spacing={3}>
                    <Grid size={12}>
                    <Controller name="usuario_id" control={control} render={({ field }) => (
                      <Autocomplete
                        options={selectedExpediente 
                          ? profissionais 
                          : profissionais.filter(p => !profissionaisComExpediente.includes(p.id))
                        }
                        getOptionLabel={(option) => option.nome}
                        value={profissionais.find(p => p.id === field.value) || null}
                        onChange={(_, newValue) => field.onChange(newValue?.id || 0)}
                        disabled={!!selectedExpediente}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        renderInput={(params) => (
                          <TextField 
                            {...params} 
                            label="Profissional" 
                            error={Boolean(errors.usuario_id)} 
                            helperText={errors.usuario_id?.message}
                          />
                        )}
                        noOptionsText="Nenhum profissional disponível"
                      />
                    )} />
                    </Grid>

                    {/* Segunda a Sexta - Manhã */}
                    <Grid size={12}>
                      <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>Segunda a Sexta - Manhã</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Controller name="seg_sex_manha_inicio" control={control} render={({ field }) => (
                        <FormControl fullWidth>
                          <InputLabel shrink>Início Manhã</InputLabel>
                          <OutlinedInput {...field} value={field.value || ''} type="time" label="Início Manhã" notched />
                        </FormControl>
                      )} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Controller name="seg_sex_manha_fim" control={control} render={({ field }) => (
                        <FormControl fullWidth>
                          <InputLabel shrink>Fim Manhã</InputLabel>
                          <OutlinedInput {...field} value={field.value || ''} type="time" label="Fim Manhã" notched />
                        </FormControl>
                      )} />
                    </Grid>

                    {/* Segunda a Sexta - Tarde */}
                    <Grid size={12}>
                      <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>Segunda a Sexta - Tarde</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Controller name="seg_sex_tarde_inicio" control={control} render={({ field }) => (
                        <FormControl fullWidth>
                          <InputLabel shrink>Início Tarde</InputLabel>
                          <OutlinedInput {...field} value={field.value || ''} type="time" label="Início Tarde" notched />
                        </FormControl>
                      )} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Controller name="seg_sex_tarde_fim" control={control} render={({ field }) => (
                        <FormControl fullWidth>
                          <InputLabel shrink>Fim Tarde</InputLabel>
                          <OutlinedInput {...field} value={field.value || ''} type="time" label="Fim Tarde" notched />
                        </FormControl>
                      )} />
                    </Grid>

                    {/* Sábado */}
                    <Grid size={12}>
                      <Divider sx={{ my: 1 }} />
                      <Controller name="trabalha_sabado" control={control} render={({ field }) => (
                        <FormControlLabel
                          control={<Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />}
                          label={<Typography variant="subtitle2" color="primary">Trabalha no Sábado</Typography>}
                        />
                      )} />
                    </Grid>
                    {trabalhaSabado && (
                      <>
                        <Grid size={12}>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Manhã</Typography>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <Controller name="sabado_manha_inicio" control={control} render={({ field }) => (
                            <FormControl fullWidth>
                              <InputLabel shrink>Início Manhã</InputLabel>
                              <OutlinedInput {...field} value={field.value || ''} type="time" label="Início Manhã" notched />
                            </FormControl>
                          )} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <Controller name="sabado_manha_fim" control={control} render={({ field }) => (
                            <FormControl fullWidth>
                              <InputLabel shrink>Fim Manhã</InputLabel>
                              <OutlinedInput {...field} value={field.value || ''} type="time" label="Fim Manhã" notched />
                            </FormControl>
                          )} />
                        </Grid>
                        <Grid size={12}>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Tarde</Typography>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <Controller name="sabado_tarde_inicio" control={control} render={({ field }) => (
                            <FormControl fullWidth>
                              <InputLabel shrink>Início Tarde</InputLabel>
                              <OutlinedInput {...field} value={field.value || ''} type="time" label="Início Tarde" notched />
                            </FormControl>
                          )} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <Controller name="sabado_tarde_fim" control={control} render={({ field }) => (
                            <FormControl fullWidth>
                              <InputLabel shrink>Fim Tarde</InputLabel>
                              <OutlinedInput {...field} value={field.value || ''} type="time" label="Fim Tarde" notched />
                            </FormControl>
                          )} />
                        </Grid>
                      </>
                    )}

                    {/* Domingo */}
                    <Grid size={12}>
                      <Divider sx={{ my: 1 }} />
                      <Controller name="trabalha_domingo" control={control} render={({ field }) => (
                        <FormControlLabel
                          control={<Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />}
                          label={<Typography variant="subtitle2" color="primary">Trabalha no Domingo</Typography>}
                        />
                      )} />
                    </Grid>
                    {trabalhaDomingo && (
                      <>
                        <Grid size={12}>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Manhã</Typography>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <Controller name="domingo_manha_inicio" control={control} render={({ field }) => (
                            <FormControl fullWidth>
                              <InputLabel shrink>Início Manhã</InputLabel>
                              <OutlinedInput {...field} value={field.value || ''} type="time" label="Início Manhã" notched />
                            </FormControl>
                          )} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <Controller name="domingo_manha_fim" control={control} render={({ field }) => (
                            <FormControl fullWidth>
                              <InputLabel shrink>Fim Manhã</InputLabel>
                              <OutlinedInput {...field} value={field.value || ''} type="time" label="Fim Manhã" notched />
                            </FormControl>
                          )} />
                        </Grid>
                        <Grid size={12}>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Tarde</Typography>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <Controller name="domingo_tarde_inicio" control={control} render={({ field }) => (
                            <FormControl fullWidth>
                              <InputLabel shrink>Início Tarde</InputLabel>
                              <OutlinedInput {...field} value={field.value || ''} type="time" label="Início Tarde" notched />
                            </FormControl>
                          )} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <Controller name="domingo_tarde_fim" control={control} render={({ field }) => (
                            <FormControl fullWidth>
                              <InputLabel shrink>Fim Tarde</InputLabel>
                              <OutlinedInput {...field} value={field.value || ''} type="time" label="Fim Tarde" notched />
                            </FormControl>
                          )} />
                        </Grid>
                      </>
                    )}
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
