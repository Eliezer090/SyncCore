'use client';

import * as React from 'react';
import Alert from '@mui/material/Alert';
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
import { MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import type { Servico, Empresa } from '@/types/database';
import { LoadingOverlay } from '@/components/core/loading-overlay';
import { ImageGalleryUpload, type GalleryImage } from '@/components/core/image-gallery-upload';
import { useEmpresa } from '@/hooks/use-empresa';
import { getAuthHeaders } from '@/lib/auth/client';

const schema = z.object({
  empresa_id: z.coerce.number().min(1, 'Empresa é obrigatória'),
  nome: z.string().min(1, 'Nome é obrigatório'),
  descricao: z.string().nullable().optional(),
  ativo: z.boolean(),
});

type FormData = z.infer<typeof schema>;

export default function ServicosPage(): React.JSX.Element {
  const { empresaId, isAdminGlobal, refreshKey } = useEmpresa();
  const [servicos, setServicos] = React.useState<(Servico & { empresa_nome?: string })[]>([]);
  const [empresas, setEmpresas] = React.useState<Empresa[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [search, setSearch] = React.useState('');
  const [loadingData, setLoadingData] = React.useState(true);
  const [loadingSave, setLoadingSave] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedServico, setSelectedServico] = React.useState<Servico | null>(null);
  const [servicoImagens, setServicoImagens] = React.useState<GalleryImage[]>([]);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { empresa_id: empresaId || 0, nome: '', descricao: '', ativo: true },
  });

  // Atualiza empresa_id quando o hook carrega (para não-admin)
  React.useEffect(() => {
    if (!isAdminGlobal && empresaId) {
      setValue('empresa_id', empresaId);
    }
  }, [empresaId, isAdminGlobal, setValue]);

  const fetchServicos = React.useCallback(async () => {
    setLoadingData(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: rowsPerPage.toString(), ...(search && { search }) });
      const response = await fetch(`/api/servicos?${params}`, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      setServicos(data.data || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Erro ao buscar serviços:', error);
    } finally {
      setLoadingData(false);
    }
  }, [page, rowsPerPage, search, empresaId, refreshKey]); // empresaId e refreshKey como dependências para refetch quando admin muda de empresa

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
    fetchServicos();
    fetchEmpresas();
  }, [fetchServicos]);

  const fetchServicoImagens = async (servicoId: number) => {
    try {
      const response = await fetch(`/api/servico-imagens?servico_id=${servicoId}`, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      setServicoImagens(data.data || []);
    } catch (error) {
      console.error('Erro ao buscar imagens:', error);
      setServicoImagens([]);
    }
  };

  const handleAddImagem = async (url: string, isCapa?: boolean) => {
    if (!selectedServico) return;
    try {
      const response = await fetch('/api/servico-imagens', {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          servico_id: selectedServico.id,
          url,
          ordem: servicoImagens.length,
          is_capa: isCapa || servicoImagens.length === 0,
        }),
      });
      if (response.ok) {
        await fetchServicoImagens(selectedServico.id);
      }
    } catch (error) {
      console.error('Erro ao adicionar imagem:', error);
    }
  };

  const handleRemoveImagem = async (id: number) => {
    try {
      const response = await fetch(`/api/servico-imagens/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
      if (response.ok && selectedServico) {
        await fetchServicoImagens(selectedServico.id);
      }
    } catch (error) {
      console.error('Erro ao remover imagem:', error);
    }
  };

  const handleSetCapa = async (id: number) => {
    try {
      const response = await fetch(`/api/servico-imagens/${id}`, {
        method: 'PUT',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_capa: true }),
      });
      if (response.ok && selectedServico) {
        await fetchServicoImagens(selectedServico.id);
      }
    } catch (error) {
      console.error('Erro ao definir capa:', error);
    }
  };

  const handleOpenDialog = (servico?: Servico) => {
    setSelectedServico(servico || null);
    setErrorMessage(null);
    reset({
      empresa_id: servico?.empresa_id || empresaId || 0,
      nome: servico?.nome || '',
      descricao: servico?.descricao || '',
      ativo: servico?.ativo ?? true,
    });
    if (servico) {
      fetchServicoImagens(servico.id);
    } else {
      setServicoImagens([]);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedServico(null);
    setServicoImagens([]);
    setErrorMessage(null);
    reset({ empresa_id: empresaId || 0, nome: '', descricao: '', ativo: true });
  };

  const onSubmit = async (data: FormData) => {
    setLoadingSave(true);
    setErrorMessage(null);
    try {
      const url = selectedServico ? `/api/servicos/${selectedServico.id}` : '/api/servicos';
      const method = selectedServico ? 'PUT' : 'POST';
      const response = await fetch(url, { method, headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      if (response.ok) {
        handleCloseDialog();
        fetchServicos();
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.error || 'Erro ao salvar serviço');
      }
    } catch (error) {
      console.error('Erro ao salvar serviço:', error);
      setErrorMessage('Erro de conexão. Tente novamente.');
    } finally {
      setLoadingSave(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este serviço?')) return;
    try {
      const response = await fetch(`/api/servicos/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
      if (response.ok) { fetchServicos(); }
    } catch (error) {
      console.error('Erro ao excluir serviço:', error);
    }
  };

  return (
    <Box sx={{ position: 'relative', minHeight: 400 }}>
      <LoadingOverlay open={loadingData} message="Carregando serviços..." />
      <Stack spacing={3}>
        <Stack direction="row" spacing={3} alignItems="center" justifyContent="space-between">
          <Typography variant="h4">Serviços</Typography>
          <Button startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />} variant="contained" onClick={() => handleOpenDialog()}>Novo Serviço</Button>
        </Stack>
        <Card sx={{ p: 2 }}>
        <OutlinedInput value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} fullWidth placeholder="Buscar serviços..." startAdornment={<InputAdornment position="start"><MagnifyingGlassIcon fontSize="var(--icon-fontSize-md)" /></InputAdornment>} sx={{ maxWidth: '500px' }} />
      </Card>
      <Card>
        <Box sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: '700px' }}>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Empresa</TableCell>
                <TableCell>Descrição</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {servicos.map((row) => (
                <TableRow hover key={row.id}>
                  <TableCell><Typography variant="subtitle2">{row.nome}</Typography></TableCell>
                  <TableCell>{row.empresa_nome || '-'}</TableCell>
                  <TableCell>{row.descricao || '-'}</TableCell>
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
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErrorMessage(null)}>
              {errorMessage}
            </Alert>
          )}
          <form onSubmit={handleSubmit(onSubmit)}>
            <Card>
              <CardHeader title={selectedServico ? 'Editar Serviço' : 'Novo Serviço'} />
              <Divider />
              <CardContent>
                <Grid container spacing={3}>
                  {selectedServico && (
                    <Grid size={12}>
                      <ImageGalleryUpload
                        images={servicoImagens}
                        onAdd={handleAddImagem}
                        onRemove={handleRemoveImagem}
                        onSetCapa={handleSetCapa}
                        folder="servicos/imagens"
                        label="Galeria de Imagens"
                        maxImages={10}
                      />
                    </Grid>
                  )}
                  {!selectedServico && (
                    <Grid size={12}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        Salve o serviço primeiro para adicionar imagens
                      </Typography>
                    </Grid>
                  )}
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
                    <Controller name="nome" control={control} render={({ field }) => (
                      <FormControl fullWidth error={Boolean(errors.nome)}>
                        <InputLabel>Nome</InputLabel>
                        <OutlinedInput {...field} label="Nome" />
                        {errors.nome && <FormHelperText>{errors.nome.message}</FormHelperText>}
                      </FormControl>
                    )} />
                  </Grid>
                  <Grid size={12}>
                    <Controller name="descricao" control={control} render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel>Descrição</InputLabel>
                        <OutlinedInput {...field} value={field.value || ''} label="Descrição" multiline rows={3} />
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
