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

import type { Endereco, Empresa, Cliente } from '@/types/database';
import { LoadingOverlay } from '@/components/core/loading-overlay';
import { useEmpresa } from '@/hooks/use-empresa';
import { getAuthHeaders } from '@/lib/auth/client';

const schema = z.object({
  cliente_id: z.number().nullable().optional(),
  empresa_id: z.number().nullable().optional(),
  tipo: z.string().min(1, 'Tipo é obrigatório'),
  cep: z.string().nullable().optional(),
  logradouro: z.string().min(1, 'Logradouro é obrigatório'),
  numero: z.string().nullable().optional(),
  bairro: z.string().nullable().optional(),
  cidade: z.string().nullable().optional(),
  referencia: z.string().nullable().optional(),
});

type FormData = z.infer<typeof schema>;

export default function EnderecosPage(): React.JSX.Element {
  const { empresaId, isAdminGlobal, refreshKey } = useEmpresa();
  const [enderecos, setEnderecos] = React.useState<(Endereco & { cliente_nome?: string; empresa_nome?: string })[]>([]);
  const [empresas, setEmpresas] = React.useState<Empresa[]>([]);
  const [clientes, setClientes] = React.useState<Cliente[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [loadingData, setLoadingData] = React.useState(true);
  const [loadingSave, setLoadingSave] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedEndereco, setSelectedEndereco] = React.useState<Endereco | null>(null);

  const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { cliente_id: null, empresa_id: null, tipo: '', cep: '', logradouro: '', numero: '', bairro: '', cidade: '', referencia: '' },
  });

  // Para não-admin, define empresa_id automaticamente quando abrir o dialog
  React.useEffect(() => {
    if (!isAdminGlobal && empresaId && dialogOpen) {
      setValue('empresa_id', empresaId);
    }
  }, [empresaId, isAdminGlobal, setValue, dialogOpen]);

  const fetchEnderecos = React.useCallback(async () => {
    setLoadingData(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: rowsPerPage.toString() });
      const response = await fetch(`/api/enderecos?${params}`, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      setEnderecos(data.data || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Erro ao buscar endereços:', error);
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

  const fetchClientes = async () => {
    try {
      const response = await fetch('/api/clientes?limit=1000', {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      setClientes(data.data || []);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
    }
  };

  React.useEffect(() => {
    fetchEnderecos();
    fetchEmpresas();
    fetchClientes();
  }, [fetchEnderecos]);

  const handleOpenDialog = (endereco?: Endereco) => {
    setSelectedEndereco(endereco || null);
    reset({
      cliente_id: endereco?.cliente_id || null,
      empresa_id: endereco?.empresa_id || (isAdminGlobal ? null : empresaId),
      tipo: endereco?.tipo || '',
      cep: endereco?.cep || '',
      logradouro: endereco?.logradouro || '',
      numero: endereco?.numero || '',
      bairro: endereco?.bairro || '',
      cidade: endereco?.cidade || '',
      referencia: endereco?.referencia || '',
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedEndereco(null);
  };

  const onSubmit = async (data: FormData) => {
    setLoadingSave(true);
    try {
      const url = selectedEndereco ? `/api/enderecos/${selectedEndereco.id}` : '/api/enderecos';
      const method = selectedEndereco ? 'PUT' : 'POST';
      const response = await fetch(url, { method, headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      if (response.ok) { handleCloseDialog(); fetchEnderecos(); }
    } catch (error) {
      console.error('Erro ao salvar endereço:', error);
    } finally {
      setLoadingSave(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este endereço?')) return;
    try {
      const response = await fetch(`/api/enderecos/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
      if (response.ok) { fetchEnderecos(); }
    } catch (error) {
      console.error('Erro ao excluir endereço:', error);
    }
  };

  return (
    <Box sx={{ position: 'relative', minHeight: 400 }}>
      <LoadingOverlay open={loadingData} message="Carregando endereços..." />
      <Stack spacing={3}>
        <Stack direction="row" spacing={3} alignItems="center" justifyContent="space-between">
          <Typography variant="h4">Endereços</Typography>
          <Button startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />} variant="contained" onClick={() => handleOpenDialog()}>Novo Endereço</Button>
        </Stack>
        <Card>
        <Box sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: '900px' }}>
            <TableHead>
              <TableRow>
                <TableCell>Tipo</TableCell>
                <TableCell>Vinculado a</TableCell>
                <TableCell>Logradouro</TableCell>
                <TableCell>Bairro</TableCell>
                <TableCell>Cidade</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {enderecos.map((row) => (
                <TableRow hover key={row.id}>
                  <TableCell><Typography variant="subtitle2">{row.tipo || '-'}</Typography></TableCell>
                  <TableCell>{row.cliente_nome ? `Cliente: ${row.cliente_nome}` : row.empresa_nome ? `Empresa: ${row.empresa_nome}` : '-'}</TableCell>
                  <TableCell>{row.logradouro}{row.numero ? `, ${row.numero}` : ''}</TableCell>
                  <TableCell>{row.bairro}</TableCell>
                  <TableCell>{row.cidade}</TableCell>
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
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Card>
              <CardHeader title={selectedEndereco ? 'Editar Endereço' : 'Novo Endereço'} />
              <Divider />
              <CardContent>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Controller name="cliente_id" control={control} render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel>Cliente (opcional)</InputLabel>
                        <Select {...field} value={field.value || ''} label="Cliente (opcional)">
                          <MenuItem value="">Nenhum</MenuItem>
                          {clientes.map((c) => (<MenuItem key={c.id} value={c.id}>{c.nome || c.telefone}</MenuItem>))}
                        </Select>
                      </FormControl>
                    )} />
                  </Grid>
                  {/* Campo Empresa - Apenas visível para admin_global */}
                  {isAdminGlobal && (
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Controller name="empresa_id" control={control} render={({ field }) => (
                        <FormControl fullWidth>
                          <InputLabel>Empresa (opcional)</InputLabel>
                          <Select {...field} value={field.value || ''} label="Empresa (opcional)">
                            <MenuItem value="">Nenhuma</MenuItem>
                            {empresas.map((e) => (<MenuItem key={e.id} value={e.id}>{e.nome}</MenuItem>))}
                          </Select>
                        </FormControl>
                      )} />
                    </Grid>
                  )}
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Controller name="tipo" control={control} render={({ field }) => (
                      <FormControl fullWidth error={Boolean(errors.tipo)}>
                        <InputLabel>Tipo</InputLabel>
                        <Select {...field} label="Tipo">
                          <MenuItem value="residencial">Residencial</MenuItem>
                          <MenuItem value="comercial">Comercial</MenuItem>
                          <MenuItem value="entrega">Entrega</MenuItem>
                          <MenuItem value="outro">Outro</MenuItem>
                        </Select>
                        {errors.tipo && <FormHelperText>{errors.tipo.message}</FormHelperText>}
                      </FormControl>
                    )} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Controller name="cep" control={control} render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel>CEP</InputLabel>
                        <OutlinedInput {...field} value={field.value || ''} label="CEP" />
                      </FormControl>
                    )} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Controller name="numero" control={control} render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel>Número</InputLabel>
                        <OutlinedInput {...field} value={field.value || ''} label="Número" />
                      </FormControl>
                    )} />
                  </Grid>
                  <Grid size={12}>
                    <Controller name="logradouro" control={control} render={({ field }) => (
                      <FormControl fullWidth error={Boolean(errors.logradouro)}>
                        <InputLabel>Logradouro</InputLabel>
                        <OutlinedInput {...field} label="Logradouro" />
                        {errors.logradouro && <FormHelperText>{errors.logradouro.message}</FormHelperText>}
                      </FormControl>
                    )} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Controller name="bairro" control={control} render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel>Bairro</InputLabel>
                        <OutlinedInput {...field} value={field.value || ''} label="Bairro" />
                      </FormControl>
                    )} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Controller name="cidade" control={control} render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel>Cidade</InputLabel>
                        <OutlinedInput {...field} value={field.value || ''} label="Cidade" />
                      </FormControl>
                    )} />
                  </Grid>
                  <Grid size={12}>
                    <Controller name="referencia" control={control} render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel>Referência</InputLabel>
                        <OutlinedInput {...field} value={field.value || ''} label="Referência" />
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
