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
import dayjs from 'dayjs';

import type { Produto, Empresa, CategoriaProduto } from '@/types/database';
import { LoadingOverlay } from '@/components/core/loading-overlay';
import { ImageGalleryUpload, type GalleryImage } from '@/components/core/image-gallery-upload';
import { useEmpresa } from '@/hooks/use-empresa';
import { getAuthHeaders } from '@/lib/auth/client';

const schema = z.object({
  empresa_id: z.coerce.number().min(1, 'Empresa é obrigatória'),
  categoria_id: z.coerce.number().nullable().optional(),
  nome: z.string().min(1, 'Nome é obrigatório'),
  descricao: z.string().nullable().optional(),
  preco: z.coerce.number().min(0, 'Preço deve ser positivo'),
  controla_estoque: z.boolean(),
  ativo: z.boolean(),
});

type FormData = z.infer<typeof schema>;

export default function ProdutosPage(): React.JSX.Element {
  const { empresaId, isAdminGlobal, refreshKey } = useEmpresa();
  const [produtos, setProdutos] = React.useState<(Produto & { empresa_nome?: string; categoria_nome?: string })[]>([]);
  const [empresas, setEmpresas] = React.useState<Empresa[]>([]);
  const [categorias, setCategorias] = React.useState<CategoriaProduto[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [search, setSearch] = React.useState('');
  const [loadingData, setLoadingData] = React.useState(true);
  const [loadingSave, setLoadingSave] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedProduto, setSelectedProduto] = React.useState<Produto | null>(null);
  const [produtoImagens, setProdutoImagens] = React.useState<GalleryImage[]>([]);
  const [imagensPendentes, setImagensPendentes] = React.useState<{ url: string; ordem: number; is_capa: boolean }[]>([]);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const { control, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { empresa_id: empresaId || 0, categoria_id: null, nome: '', descricao: '', preco: 0, controla_estoque: true, ativo: true },
  });

  const empresaIdWatch = watch('empresa_id');

  // Atualiza empresa_id quando o hook carrega (para não-admin)
  React.useEffect(() => {
    if (!isAdminGlobal && empresaId) {
      setValue('empresa_id', empresaId);
      fetchCategorias(empresaId);
    }
  }, [empresaId, isAdminGlobal, setValue]);

  const fetchProdutos = React.useCallback(async () => {
    setLoadingData(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: rowsPerPage.toString(), ...(search && { search }) });
      const response = await fetch(`/api/produtos?${params}`, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      setProdutos(data.data || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    } finally {
      setLoadingData(false);
    }
  // empresaId e refreshKey como dependências para refetch quando admin muda de empresa
  }, [page, rowsPerPage, search, empresaId, refreshKey]);

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

  const fetchCategorias = async (empresaId?: number) => {
    try {
      const params = empresaId ? `?empresa_id=${empresaId}&limit=1000` : '?limit=1000';
      const response = await fetch(`/api/categorias-produto${params}`, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      setCategorias(data.data || []);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
    }
  };

  React.useEffect(() => {
    fetchProdutos();
    fetchEmpresas();
    fetchCategorias();
  }, [fetchProdutos]);

  React.useEffect(() => {
    if (empresaIdWatch) {
      fetchCategorias(empresaIdWatch);
    }
  }, [empresaIdWatch]);

  const fetchProdutoImagens = async (produtoId: number) => {
    try {
      const response = await fetch(`/api/produto-imagens?produto_id=${produtoId}`);
      const data = await response.json();
      setProdutoImagens(data.data || []);
    } catch (error) {
      console.error('Erro ao buscar imagens:', error);
      setProdutoImagens([]);
    }
  };

  const handleAddImagem = async (url: string, isCapa?: boolean) => {
    if (selectedProduto) {
      // Produto existente - salva direto no banco
      try {
        const response = await fetch('/api/produto-imagens', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            produto_id: selectedProduto.id,
            url,
            ordem: produtoImagens.length,
            is_capa: isCapa || produtoImagens.length === 0,
          }),
        });
        if (response.ok) {
          await fetchProdutoImagens(selectedProduto.id);
        }
      } catch (error) {
        console.error('Erro ao adicionar imagem:', error);
      }
    } else {
      // Novo produto - adiciona à lista pendente
      const allImages = [...imagensPendentes];
      const newImage = {
        url,
        ordem: allImages.length,
        is_capa: isCapa || allImages.length === 0,
      };
      // Se é capa, remove capa das outras
      if (newImage.is_capa) {
        allImages.forEach(img => img.is_capa = false);
      }
      setImagensPendentes([...allImages, newImage]);
    }
  };

  const handleRemoveImagemPendente = (url: string) => {
    const remaining = imagensPendentes.filter(img => img.url !== url);
    // Se removeu a capa e ainda tem imagens, define a primeira como capa
    if (remaining.length > 0 && !remaining.some(img => img.is_capa)) {
      remaining[0].is_capa = true;
    }
    setImagensPendentes(remaining);
  };

  const handleSetCapaPendente = (url: string) => {
    setImagensPendentes(prev => prev.map(img => ({
      ...img,
      is_capa: img.url === url,
    })));
  };

  const handleRemoveImagem = async (id: number) => {
    try {
      const response = await fetch(`/api/produto-imagens/${id}`, { method: 'DELETE' });
      if (response.ok && selectedProduto) {
        await fetchProdutoImagens(selectedProduto.id);
      }
    } catch (error) {
      console.error('Erro ao remover imagem:', error);
    }
  };

  const handleSetCapa = async (id: number) => {
    try {
      const response = await fetch(`/api/produto-imagens/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_capa: true }),
      });
      if (response.ok && selectedProduto) {
        await fetchProdutoImagens(selectedProduto.id);
      }
    } catch (error) {
      console.error('Erro ao definir capa:', error);
    }
  };

  const handleOpenDialog = (produto?: Produto) => {
    setSelectedProduto(produto || null);
    setErrorMessage(null);
    setImagensPendentes([]);
    reset({
      empresa_id: produto?.empresa_id || empresaId || 0,
      categoria_id: produto?.categoria_id || null,
      nome: produto?.nome || '',
      descricao: produto?.descricao || '',
      preco: produto?.preco || 0,
      controla_estoque: produto?.controla_estoque ?? true,
      ativo: produto?.ativo ?? true,
    });
    if (produto) {
      fetchProdutoImagens(produto.id);
    } else {
      setProdutoImagens([]);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedProduto(null);
    setProdutoImagens([]);
    setImagensPendentes([]);
    setErrorMessage(null);
    reset({ empresa_id: empresaId || 0, categoria_id: null, nome: '', descricao: '', preco: 0, controla_estoque: true, ativo: true });
  };

  const onSubmit = async (data: FormData) => {
    setLoadingSave(true);
    setErrorMessage(null);
    try {
      const url = selectedProduto ? `/api/produtos/${selectedProduto.id}` : '/api/produtos';
      const method = selectedProduto ? 'PUT' : 'POST';
      const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      if (response.ok) {
        const savedProduto = await response.json();
        
        // Se é novo produto e tem imagens pendentes, salvar
        if (!selectedProduto && imagensPendentes.length > 0) {
          for (const img of imagensPendentes) {
            await fetch('/api/produto-imagens', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                produto_id: savedProduto.id,
                url: img.url,
                ordem: img.ordem,
                is_capa: img.is_capa,
              }),
            });
          }
        }
        
        handleCloseDialog();
        fetchProdutos();
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.error || 'Erro ao salvar produto');
      }
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      setErrorMessage('Erro de conexão. Tente novamente.');
    } finally {
      setLoadingSave(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;
    try {
      const response = await fetch(`/api/produtos/${id}`, { method: 'DELETE' });
      if (response.ok) { fetchProdutos(); }
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
    }
  };

  return (
    <Box sx={{ position: 'relative', minHeight: 400 }}>
      <LoadingOverlay open={loadingData} message="Carregando produtos..." />
      <Stack spacing={3}>
        <Stack direction="row" spacing={3} alignItems="center" justifyContent="space-between">
          <Typography variant="h4">Produtos</Typography>
          <Button startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />} variant="contained" onClick={() => handleOpenDialog()}>Novo Produto</Button>
        </Stack>
        <Card sx={{ p: 2 }}>
        <OutlinedInput value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} fullWidth placeholder="Buscar produtos..." startAdornment={<InputAdornment position="start"><MagnifyingGlassIcon fontSize="var(--icon-fontSize-md)" /></InputAdornment>} sx={{ maxWidth: '500px' }} />
      </Card>
      <Card>
        <Box sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: '900px' }}>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Empresa</TableCell>
                <TableCell>Categoria</TableCell>
                <TableCell>Preço</TableCell>
                <TableCell>Estoque</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Criado em</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {produtos.map((row) => (
                <TableRow hover key={row.id}>
                  <TableCell><Typography variant="subtitle2">{row.nome}</Typography>{row.descricao && <Typography color="text.secondary" variant="body2">{row.descricao.substring(0, 50)}...</Typography>}</TableCell>
                  <TableCell>{row.empresa_nome || '-'}</TableCell>
                  <TableCell>{row.categoria_nome || '-'}</TableCell>
                  <TableCell>R$ {Number(row.preco).toFixed(2)}</TableCell>
                  <TableCell><Chip label={row.controla_estoque ? 'Controlado' : 'Não controlado'} size="small" color={row.controla_estoque ? 'primary' : 'default'} /></TableCell>
                  <TableCell><Chip label={row.ativo ? 'Ativo' : 'Inativo'} size="small" color={row.ativo ? 'success' : 'error'} /></TableCell>
                  <TableCell>{dayjs(row.criado_em).format('DD/MM/YYYY')}</TableCell>
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
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErrorMessage(null)}>
              {errorMessage}
            </Alert>
          )}
          <form onSubmit={handleSubmit(onSubmit)}>
            <Card>
              <CardHeader title={selectedProduto ? 'Editar Produto' : 'Novo Produto'} />
              <Divider />
              <CardContent>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12 }}>
                    {selectedProduto ? (
                      <ImageGalleryUpload
                        images={produtoImagens}
                        onAdd={handleAddImagem}
                        onRemove={handleRemoveImagem}
                        onSetCapa={handleSetCapa}
                        folder="produtos/imagens"
                        label="Galeria de Imagens"
                        maxImages={10}
                      />
                    ) : (
                      <ImageGalleryUpload
                        images={imagensPendentes.map((img, idx) => ({ 
                          id: idx, 
                          url: img.url, 
                          ordem: img.ordem, 
                          is_capa: img.is_capa 
                        }))}
                        onAdd={handleAddImagem}
                        onRemove={(id) => {
                          const img = imagensPendentes[id];
                          if (img) handleRemoveImagemPendente(img.url);
                        }}
                        onSetCapa={(id) => {
                          const img = imagensPendentes[id];
                          if (img) handleSetCapaPendente(img.url);
                        }}
                        folder="produtos/imagens"
                        label="Galeria de Imagens"
                        maxImages={10}
                      />
                    )}
                  </Grid>
                  {/* Campo Empresa - Apenas visível para admin_global */}
                  {isAdminGlobal && (
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Controller name="empresa_id" control={control} render={({ field }) => (
                        <FormControl fullWidth error={Boolean(errors.empresa_id)}>
                          <InputLabel>Empresa</InputLabel>
                          <Select {...field} label="Empresa">{empresas.map((e) => (<MenuItem key={e.id} value={e.id}>{e.nome}</MenuItem>))}</Select>
                          {errors.empresa_id && <FormHelperText>{errors.empresa_id.message}</FormHelperText>}
                        </FormControl>
                      )} />
                    </Grid>
                  )}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Controller name="categoria_id" control={control} render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel>Categoria</InputLabel>
                        <Select {...field} value={field.value || ''} label="Categoria">
                          <MenuItem value="">Nenhuma</MenuItem>
                          {categorias.map((c) => (<MenuItem key={c.id} value={c.id}>{c.nome}</MenuItem>))}
                        </Select>
                      </FormControl>
                    )} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Controller name="nome" control={control} render={({ field }) => (
                      <FormControl fullWidth error={Boolean(errors.nome)}>
                        <InputLabel>Nome</InputLabel>
                        <OutlinedInput {...field} label="Nome" />
                        {errors.nome && <FormHelperText>{errors.nome.message}</FormHelperText>}
                      </FormControl>
                    )} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Controller name="preco" control={control} render={({ field }) => (
                      <FormControl fullWidth error={Boolean(errors.preco)}>
                        <InputLabel>Preço</InputLabel>
                        <OutlinedInput {...field} type="number" label="Preço" startAdornment={<InputAdornment position="start">R$</InputAdornment>} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} />
                        {errors.preco && <FormHelperText>{errors.preco.message}</FormHelperText>}
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
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Controller name="controla_estoque" control={control} render={({ field }) => (
                        <FormControlLabel control={<Switch checked={field.value} onChange={field.onChange} />} label="Controla Estoque" />
                      )} />
                      <Controller name="ativo" control={control} render={({ field }) => (
                        <FormControlLabel control={<Switch checked={field.value} onChange={field.onChange} />} label="Ativo" />
                      )} />
                    </Box>
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
