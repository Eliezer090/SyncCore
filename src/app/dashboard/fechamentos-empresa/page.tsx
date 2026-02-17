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
import Alert from '@mui/material/Alert';
import { PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { PencilSimpleIcon } from '@phosphor-icons/react/dist/ssr/PencilSimple';
import { TrashIcon } from '@phosphor-icons/react/dist/ssr/Trash';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import dayjs from 'dayjs';

import type { FechamentoEmpresa } from '@/types/database';
import { LoadingOverlay } from '@/components/core/loading-overlay';
import { useEmpresa } from '@/hooks/use-empresa';
import { useUser } from '@/hooks/use-user';
import { getAuthHeaders } from '@/lib/auth/client';

const schema = z.object({
  empresa_id: z.coerce.number().min(1, 'Empresa é obrigatória'),
  data_inicio: z.string().min(1, 'Data início é obrigatória'),
  data_fim: z.string().min(1, 'Data fim é obrigatória'),
  tipo: z.enum(['fechado', 'horario_especial']),
  abre: z.string().nullable().optional(),
  fecha: z.string().nullable().optional(),
  motivo: z.string().nullable().optional(),
}).refine((data) => {
  if (data.tipo === 'horario_especial') {
    return data.abre && data.fecha;
  }
  return true;
}, {
  message: 'Para horário especial, informe os horários de abertura e fechamento',
  path: ['abre'],
});

type FormData = z.infer<typeof schema>;

export default function FechamentosEmpresaPage(): React.JSX.Element {
  const { empresaId } = useEmpresa();
  const { user } = useUser();
  const [fechamentos, setFechamentos] = React.useState<(FechamentoEmpresa & { empresa_nome?: string })[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [loadingData, setLoadingData] = React.useState(true);
  const [loadingSave, setLoadingSave] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedFechamento, setSelectedFechamento] = React.useState<FechamentoEmpresa | null>(null);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      empresa_id: empresaId || 0,
      data_inicio: '',
      data_fim: '',
      tipo: 'fechado',
      abre: null,
      fecha: null,
      motivo: '',
    },
  });

  const tipo = useWatch({ control, name: 'tipo' });

  const fetchFechamentos = React.useCallback(async () => {
    setLoadingData(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: rowsPerPage.toString() });
      const response = await fetch(`/api/fechamentos-empresa?${params}`, { headers: getAuthHeaders() });
      const data = await response.json();
      setFechamentos(data.data || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Erro ao buscar fechamentos:', error);
    } finally {
      setLoadingData(false);
    }
  }, [page, rowsPerPage]);

  React.useEffect(() => { fetchFechamentos(); }, [fetchFechamentos]);

  const formatDateForInput = (date: string | Date | undefined) => {
    if (!date) return '';
    return dayjs(date).format('YYYY-MM-DD');
  };

  const handleOpenDialog = (fechamento?: FechamentoEmpresa) => {
    setSelectedFechamento(fechamento || null);
    reset({
      empresa_id: fechamento?.empresa_id || empresaId || 0,
      data_inicio: formatDateForInput(fechamento?.data_inicio),
      data_fim: formatDateForInput(fechamento?.data_fim),
      tipo: fechamento?.tipo || 'fechado',
      abre: fechamento?.abre || null,
      fecha: fechamento?.fecha || null,
      motivo: fechamento?.motivo || '',
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => { setDialogOpen(false); setSelectedFechamento(null); };

  const onSubmit = async (data: FormData) => {
    setLoadingSave(true);
    try {
      const payload = {
        ...data,
        abre: data.tipo === 'horario_especial' ? data.abre : null,
        fecha: data.tipo === 'horario_especial' ? data.fecha : null,
      };
      const url = selectedFechamento ? `/api/fechamentos-empresa/${selectedFechamento.id}` : '/api/fechamentos-empresa';
      const method = selectedFechamento ? 'PUT' : 'POST';
      const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json', ...getAuthHeaders() }, body: JSON.stringify(payload) });
      if (response.ok) { handleCloseDialog(); fetchFechamentos(); }
    } catch (error) {
      console.error('Erro ao salvar:', error);
    } finally {
      setLoadingSave(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este fechamento?')) return;
    try {
      const response = await fetch(`/api/fechamentos-empresa/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
      if (response.ok) { fetchFechamentos(); }
    } catch (error) {
      console.error('Erro ao excluir:', error);
    }
  };

  // Verificar se há fechamento ativo hoje
  const hoje = dayjs().format('YYYY-MM-DD');
  const fechamentoHoje = fechamentos.find(f => {
    const inicio = dayjs(f.data_inicio).format('YYYY-MM-DD');
    const fim = dayjs(f.data_fim).format('YYYY-MM-DD');
    return hoje >= inicio && hoje <= fim;
  });

  return (
    <Box sx={{ position: 'relative', minHeight: 400 }}>
      <LoadingOverlay open={loadingData} message="Carregando fechamentos..." />
      <Stack spacing={3}>
        <Stack direction="row" spacing={3} alignItems="center" justifyContent="space-between">
          <Stack spacing={1}>
            <Typography variant="h4">Fechamentos e Feriados</Typography>
            <Typography color="text.secondary" variant="body2">
              Configure dias ou períodos em que a empresa estará fechada ou com horário especial
            </Typography>
          </Stack>
          <Button startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />} variant="contained" onClick={() => handleOpenDialog()}>
            Novo Fechamento
          </Button>
        </Stack>

        {fechamentoHoje && (
          <Alert severity={fechamentoHoje.tipo === 'fechado' ? 'error' : 'warning'} variant="filled">
            {fechamentoHoje.tipo === 'fechado'
              ? `⚠️ Empresa fechada hoje${fechamentoHoje.motivo ? ` — ${fechamentoHoje.motivo}` : ''}`
              : `⏰ Horário especial hoje: ${fechamentoHoje.abre} às ${fechamentoHoje.fecha}${fechamentoHoje.motivo ? ` — ${fechamentoHoje.motivo}` : ''}`
            }
          </Alert>
        )}

        <Card>
          <Box sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: '800px' }}>
              <TableHead>
                <TableRow>
                  {user?.papel === 'admin' && <TableCell>Empresa</TableCell>}
                  <TableCell>Data Início</TableCell>
                  <TableCell>Data Fim</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Horário Especial</TableCell>
                  <TableCell>Motivo</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {fechamentos.map((row) => {
                  const isAtivo = hoje >= dayjs(row.data_inicio).format('YYYY-MM-DD') && hoje <= dayjs(row.data_fim).format('YYYY-MM-DD');
                  const isFuturo = hoje < dayjs(row.data_inicio).format('YYYY-MM-DD');
                  return (
                    <TableRow hover key={row.id} sx={isAtivo ? { bgcolor: 'error.lighter' } : undefined}>
                      {user?.papel === 'admin' && (
                        <TableCell><Typography variant="subtitle2">{row.empresa_nome || '-'}</Typography></TableCell>
                      )}
                      <TableCell>{dayjs(row.data_inicio).format('DD/MM/YYYY')}</TableCell>
                      <TableCell>{dayjs(row.data_fim).format('DD/MM/YYYY')}</TableCell>
                      <TableCell>
                        {row.tipo === 'fechado' ? (
                          <Chip label="Fechado" color="error" size="small" />
                        ) : (
                          <Chip label="Horário Especial" color="warning" size="small" />
                        )}
                      </TableCell>
                      <TableCell>
                        {row.tipo === 'horario_especial' ? `${row.abre} - ${row.fecha}` : '-'}
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          {row.motivo || '-'}
                          {isAtivo && <Chip label="Hoje" color="error" size="small" variant="outlined" />}
                          {isFuturo && <Chip label="Futuro" color="info" size="small" variant="outlined" />}
                        </Stack>
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Editar"><IconButton onClick={() => handleOpenDialog(row)}><PencilSimpleIcon /></IconButton></Tooltip>
                        <Tooltip title="Excluir"><IconButton onClick={() => handleDelete(row.id)} color="error"><TrashIcon /></IconButton></Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {fechamentos.length === 0 && !loadingData && (
                  <TableRow>
                    <TableCell colSpan={user?.papel === 'admin' ? 7 : 6} align="center">
                      <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                        Nenhum fechamento cadastrado. Adicione feriados ou dias de recesso.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
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

        <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Card>
                <CardHeader
                  title={selectedFechamento ? 'Editar Fechamento' : 'Novo Fechamento'}
                  subheader="Configure um dia ou período de fechamento/horário especial"
                />
                <Divider />
                <CardContent>
                  <Grid container spacing={3}>
                    {/* empresa_id hidden - usa o do contexto */}
                    <Controller name="empresa_id" control={control} render={() => <input type="hidden" />} />

                    <Grid size={{ xs: 12, md: 6 }}>
                      <Controller name="data_inicio" control={control} render={({ field }) => (
                        <FormControl fullWidth error={Boolean(errors.data_inicio)}>
                          <InputLabel shrink>Data Início</InputLabel>
                          <OutlinedInput {...field} type="date" label="Data Início" notched />
                          {errors.data_inicio && <FormHelperText>{errors.data_inicio.message}</FormHelperText>}
                        </FormControl>
                      )} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Controller name="data_fim" control={control} render={({ field }) => (
                        <FormControl fullWidth error={Boolean(errors.data_fim)}>
                          <InputLabel shrink>Data Fim</InputLabel>
                          <OutlinedInput {...field} type="date" label="Data Fim" notched />
                          <FormHelperText>Para um único dia, use a mesma data nos dois campos</FormHelperText>
                          {errors.data_fim && <FormHelperText error>{errors.data_fim.message}</FormHelperText>}
                        </FormControl>
                      )} />
                    </Grid>

                    <Grid size={12}>
                      <Controller name="tipo" control={control} render={({ field }) => (
                        <FormControl fullWidth>
                          <InputLabel>Tipo</InputLabel>
                          <Select {...field} label="Tipo">
                            <MenuItem value="fechado">Fechado (não atende)</MenuItem>
                            <MenuItem value="horario_especial">Horário Especial (atende parcialmente)</MenuItem>
                          </Select>
                          <FormHelperText>
                            {field.value === 'fechado'
                              ? 'A empresa não atenderá neste período'
                              : 'A empresa atenderá com horário diferente do habitual'
                            }
                          </FormHelperText>
                        </FormControl>
                      )} />
                    </Grid>

                    {tipo === 'horario_especial' && (
                      <>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <Controller name="abre" control={control} render={({ field }) => (
                            <FormControl fullWidth error={Boolean(errors.abre)}>
                              <InputLabel shrink>Abre às</InputLabel>
                              <OutlinedInput {...field} value={field.value || ''} type="time" label="Abre às" notched />
                              {errors.abre && <FormHelperText>{errors.abre.message}</FormHelperText>}
                            </FormControl>
                          )} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <Controller name="fecha" control={control} render={({ field }) => (
                            <FormControl fullWidth error={Boolean(errors.fecha)}>
                              <InputLabel shrink>Fecha às</InputLabel>
                              <OutlinedInput {...field} value={field.value || ''} type="time" label="Fecha às" notched />
                              {errors.fecha && <FormHelperText>{errors.fecha.message}</FormHelperText>}
                            </FormControl>
                          )} />
                        </Grid>
                      </>
                    )}

                    <Grid size={12}>
                      <Controller name="motivo" control={control} render={({ field }) => (
                        <FormControl fullWidth>
                          <InputLabel>Motivo</InputLabel>
                          <OutlinedInput
                            {...field}
                            value={field.value || ''}
                            label="Motivo"
                            multiline
                            rows={2}
                            placeholder="Ex: Carnaval, Natal, Ano Novo, Recesso, Reforma..."
                          />
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
