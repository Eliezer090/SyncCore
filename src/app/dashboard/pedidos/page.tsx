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
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select from '@mui/material/Select';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Collapse from '@mui/material/Collapse';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import { PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { PencilSimpleIcon } from '@phosphor-icons/react/dist/ssr/PencilSimple';
import { TrashIcon } from '@phosphor-icons/react/dist/ssr/Trash';
import { CaretDownIcon } from '@phosphor-icons/react/dist/ssr/CaretDown';
import { CaretUpIcon } from '@phosphor-icons/react/dist/ssr/CaretUp';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import dayjs from 'dayjs';

import type { Pedido, Empresa, Cliente, Produto, Servico, ProdutoAdicional } from '@/types/database';
import { LoadingOverlay } from '@/components/core/loading-overlay';
import { useEmpresa } from '@/hooks/use-empresa';
import { getAuthHeaders } from '@/lib/auth/client';

// Schema para o formulário principal do pedido
const schema = z.object({
  empresa_id: z.coerce.number().min(1, 'Empresa é obrigatória'),
  cliente_id: z.coerce.number().min(1, 'Cliente é obrigatório'),
  tipo: z.enum(['produto', 'servico']),
  status: z.string().min(1, 'Status é obrigatório'),
  observacao: z.string().nullable().optional(),
  taxa_entrega: z.coerce.number().min(0).optional(),
});

type FormData = z.infer<typeof schema>;

// Interface para itens pendentes (antes de salvar)
interface ItemPendente {
  tempId: string;
  produto_id: number | null;
  servico_id: number | null;
  quantidade: number;
  preco_unitario: number;
  observacoes: string;
  adicionais: AdicionalPendente[];
  // Dados para exibição
  nome: string;
}

interface AdicionalPendente {
  adicional_id: number;
  preco: number;
  nome: string;
}

// Interface para item salvo
interface ItemSalvo {
  id: number;
  pedido_id: number;
  produto_id: number | null;
  servico_id: number | null;
  quantidade: number;
  preco_unitario: number;
  observacoes: string | null;
  produto_nome?: string;
  servico_nome?: string;
  adicionais?: { id: number; adicional_id: number; preco: number; adicional_nome?: string }[];
}

const statusOptions = [
  { value: 'pendente', label: 'Pendente', color: 'warning' as const },
  { value: 'confirmado', label: 'Confirmado', color: 'info' as const },
  { value: 'em_preparo', label: 'Em Preparo', color: 'primary' as const },
  { value: 'pronto', label: 'Pronto', color: 'secondary' as const },
  { value: 'entregue', label: 'Entregue', color: 'success' as const },
  { value: 'cancelado', label: 'Cancelado', color: 'error' as const },
];

export default function PedidosPage(): React.JSX.Element {
  const { empresaId, isAdminGlobal, refreshKey } = useEmpresa();
  const [pedidos, setPedidos] = React.useState<(Pedido & { empresa_nome?: string; cliente_nome?: string; cliente_telefone?: string })[]>([]);
  const [empresas, setEmpresas] = React.useState<Empresa[]>([]);
  const [clientes, setClientes] = React.useState<Cliente[]>([]);
  const [produtos, setProdutos] = React.useState<Produto[]>([]);
  const [servicos, setServicos] = React.useState<Servico[]>([]);
  const [adicionais, setAdicionais] = React.useState<ProdutoAdicional[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [loadingData, setLoadingData] = React.useState(true);
  const [loadingSave, setLoadingSave] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedPedido, setSelectedPedido] = React.useState<Pedido | null>(null);

  // Estados para itens do pedido
  const [itensPendentes, setItensPendentes] = React.useState<ItemPendente[]>([]);
  const [itensSalvos, setItensSalvos] = React.useState<ItemSalvo[]>([]);
  const [expandedItems, setExpandedItems] = React.useState<Set<string | number>>(new Set());

  // Estados para adicionar novo item
  const [novoItemDialogOpen, setNovoItemDialogOpen] = React.useState(false);
  const [novoItemProduto, setNovoItemProduto] = React.useState<Produto | null>(null);
  const [novoItemServico, setNovoItemServico] = React.useState<Servico | null>(null);
  const [novoItemQuantidade, setNovoItemQuantidade] = React.useState(1);
  const [novoItemPreco, setNovoItemPreco] = React.useState(0);
  const [novoItemObservacoes, setNovoItemObservacoes] = React.useState('');
  const [novoItemAdicionais, setNovoItemAdicionais] = React.useState<number[]>([]);
  
  // Watch tipo para alternar entre produtos e serviços
  const { control, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { empresa_id: empresaId || 0, cliente_id: 0, tipo: 'produto', status: 'pendente', observacao: '', taxa_entrega: 0 },
  });
  
  const tipoSelecionado = watch('tipo');

  // Atualiza empresa_id quando o hook carrega (para não-admin)
  React.useEffect(() => {
    if (!isAdminGlobal && empresaId) {
      setValue('empresa_id', empresaId);
    }
  }, [empresaId, isAdminGlobal, setValue]);

  const fetchPedidos = React.useCallback(async () => {
    setLoadingData(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: rowsPerPage.toString() });
      const response = await fetch(`/api/pedidos?${params}`, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      setPedidos(data.data || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
    } finally {
      setLoadingData(false);
    }
  }, [page, rowsPerPage, empresaId, refreshKey]);

  const fetchEmpresas = React.useCallback(async () => {
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

  const fetchProdutos = async () => {
    try {
      const response = await fetch('/api/produtos?limit=1000', {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      setProdutos(data.data || []);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    }
  };

  const fetchServicos = async () => {
    try {
      const response = await fetch('/api/servicos?limit=1000', {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      setServicos(data.data || []);
    } catch (error) {
      console.error('Erro ao buscar serviços:', error);
    }
  };

  const fetchAdicionais = async () => {
    try {
      const response = await fetch('/api/produto-adicionais?limit=1000', {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      setAdicionais(data.data || []);
    } catch (error) {
      console.error('Erro ao buscar adicionais:', error);
    }
  };

  const fetchItensPedido = async (pedidoId: number) => {
    try {
      const response = await fetch(`/api/pedido-itens?pedido_id=${pedidoId}&limit=100`, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      const itens: ItemSalvo[] = data.data || [];
      
      // Para cada item, buscar os adicionais
      for (const item of itens) {
        const adicionaisResponse = await fetch(`/api/pedido-item-adicionais?pedido_item_id=${item.id}&limit=100`, {
          headers: getAuthHeaders(),
        });
        const adicionaisData = await adicionaisResponse.json();
        item.adicionais = adicionaisData.data || [];
      }
      
      setItensSalvos(itens);
    } catch (error) {
      console.error('Erro ao buscar itens do pedido:', error);
    }
  };

  React.useEffect(() => {
    fetchPedidos();
    fetchEmpresas();
    fetchClientes();
    fetchProdutos();
    fetchServicos();
    fetchAdicionais();
  }, [fetchPedidos, fetchEmpresas]);

  const handleOpenDialog = async (pedido?: Pedido) => {
    setSelectedPedido(pedido || null);
    setItensPendentes([]);
    setItensSalvos([]);
    setExpandedItems(new Set());
    
    if (pedido) {
      reset({
        empresa_id: pedido.empresa_id,
        cliente_id: pedido.cliente_id,
        tipo: pedido.tipo,
        status: pedido.status,
        observacao: pedido.observacao || '',
        taxa_entrega: pedido.taxa_entrega || 0,
      });
      await fetchItensPedido(pedido.id);
    } else {
      reset({
        empresa_id: empresaId || 0,
        cliente_id: 0,
        tipo: 'produto',
        status: 'pendente',
        observacao: '',
        taxa_entrega: 0,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedPedido(null);
    setItensPendentes([]);
    setItensSalvos([]);
    reset({ empresa_id: empresaId || 0, cliente_id: 0, tipo: 'produto', status: 'pendente', observacao: '', taxa_entrega: 0 });
  };

  // Calcular total
  const calcularTotal = (): number => {
    let totalItens = 0;
    
    // Itens pendentes
    for (const item of itensPendentes) {
      totalItens += item.preco_unitario * item.quantidade;
      for (const adicional of item.adicionais) {
        totalItens += adicional.preco * item.quantidade;
      }
    }
    
    // Itens salvos
    for (const item of itensSalvos) {
      totalItens += item.preco_unitario * item.quantidade;
      for (const adicional of item.adicionais || []) {
        totalItens += adicional.preco * item.quantidade;
      }
    }
    
    return totalItens;
  };

  // Adicionar novo item
  const handleOpenNovoItemDialog = () => {
    setNovoItemProduto(null);
    setNovoItemServico(null);
    setNovoItemQuantidade(1);
    setNovoItemPreco(0);
    setNovoItemObservacoes('');
    setNovoItemAdicionais([]);
    setNovoItemDialogOpen(true);
  };

  const handleAdicionarItem = () => {
    if (tipoSelecionado === 'produto' && !novoItemProduto) return;
    if (tipoSelecionado === 'servico' && !novoItemServico) return;

    const adicionaisSelecionados = adicionais
      .filter(a => novoItemAdicionais.includes(a.id))
      .map(a => ({
        adicional_id: a.id,
        preco: a.preco,
        nome: a.nome,
      }));

    const novoItem: ItemPendente = {
      tempId: `temp_${Date.now()}`,
      produto_id: tipoSelecionado === 'produto' ? novoItemProduto!.id : null,
      servico_id: tipoSelecionado === 'servico' ? novoItemServico!.id : null,
      quantidade: novoItemQuantidade,
      preco_unitario: novoItemPreco,
      observacoes: novoItemObservacoes,
      adicionais: adicionaisSelecionados,
      nome: tipoSelecionado === 'produto' ? novoItemProduto!.nome : novoItemServico!.nome,
    };

    setItensPendentes([...itensPendentes, novoItem]);
    setNovoItemDialogOpen(false);
  };

  const handleRemoverItemPendente = (tempId: string) => {
    setItensPendentes(itensPendentes.filter(item => item.tempId !== tempId));
  };

  const handleRemoverItemSalvo = async (itemId: number) => {
    if (!confirm('Tem certeza que deseja remover este item?')) return;
    try {
      await fetch(`/api/pedido-itens/${itemId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      setItensSalvos(itensSalvos.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Erro ao remover item:', error);
    }
  };

  const toggleItemExpanded = (id: string | number) => {
    const newSet = new Set(expandedItems);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedItems(newSet);
  };

  const onSubmit = async (data: FormData) => {
    setLoadingSave(true);
    try {
      // Calcular total
      const totalCalculado = calcularTotal() + (data.taxa_entrega || 0);

      // Salvar ou atualizar pedido
      const url = selectedPedido ? `/api/pedidos/${selectedPedido.id}` : '/api/pedidos';
      const method = selectedPedido ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, total: totalCalculado }),
      });

      if (!response.ok) {
        throw new Error('Erro ao salvar pedido');
      }

      const pedido = await response.json();
      const pedidoId = pedido.id;

      // Salvar itens pendentes
      for (const item of itensPendentes) {
        const itemResponse = await fetch('/api/pedido-itens', {
          method: 'POST',
          headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pedido_id: pedidoId,
            produto_id: item.produto_id,
            servico_id: item.servico_id,
            quantidade: item.quantidade,
            preco_unitario: item.preco_unitario,
            observacoes: item.observacoes || null,
          }),
        });

        if (itemResponse.ok) {
          const itemSalvo = await itemResponse.json();
          
          // Salvar adicionais do item
          for (const adicional of item.adicionais) {
            await fetch('/api/pedido-item-adicionais', {
              method: 'POST',
              headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
              body: JSON.stringify({
                pedido_item_id: itemSalvo.id,
                adicional_id: adicional.adicional_id,
                preco: adicional.preco,
              }),
            });
          }
        }
      }

      handleCloseDialog();
      fetchPedidos();
    } catch (error) {
      console.error('Erro ao salvar pedido:', error);
    } finally {
      setLoadingSave(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este pedido? Todos os itens serão removidos.')) return;
    try {
      const response = await fetch(`/api/pedidos/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
      if (response.ok) { fetchPedidos(); }
    } catch (error) {
      console.error('Erro ao excluir pedido:', error);
    }
  };

  const getStatusColor = (status: string) => {
    return statusOptions.find(s => s.value === status)?.color || 'default';
  };

  const getStatusLabel = (status: string) => {
    return statusOptions.find(s => s.value === status)?.label || status;
  };

  // Filtrar adicionais por produto selecionado
  const adicionaisFiltrados = React.useMemo(() => {
    if (tipoSelecionado === 'produto' && novoItemProduto) {
      return adicionais.filter(a => a.produto_id === novoItemProduto.id);
    }
    return [];
  }, [tipoSelecionado, novoItemProduto, adicionais]);

  return (
    <Box sx={{ position: 'relative', minHeight: 400 }}>
      <LoadingOverlay open={loadingData} message="Carregando pedidos..." />
      <Stack spacing={3}>
        <Stack direction="row" spacing={3} alignItems="center" justifyContent="space-between">
          <Typography variant="h4">Pedidos</Typography>
          <Button startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />} variant="contained" onClick={() => handleOpenDialog()}>Novo Pedido</Button>
        </Stack>
        
        <Card>
          <Box sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: '900px' }}>
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Empresa</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Data</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pedidos.map((row) => (
                  <TableRow hover key={row.id}>
                    <TableCell>{row.id}</TableCell>
                    <TableCell>
                      <Typography variant="subtitle2">{row.cliente_nome || '-'}</Typography>
                      <Typography variant="body2" color="text.secondary">{row.cliente_telefone}</Typography>
                    </TableCell>
                    <TableCell>{row.empresa_nome || '-'}</TableCell>
                    <TableCell><Chip label={row.tipo === 'produto' ? 'Produto' : 'Serviço'} size="small" color={row.tipo === 'produto' ? 'primary' : 'secondary'} /></TableCell>
                    <TableCell><Chip label={getStatusLabel(row.status)} size="small" color={getStatusColor(row.status)} /></TableCell>
                    <TableCell>R$ {Number(row.total).toFixed(2)}</TableCell>
                    <TableCell>{dayjs(row.criado_em).format('DD/MM/YYYY HH:mm')}</TableCell>
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

        {/* Dialog do Pedido */}
        <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="lg" fullWidth>
          <DialogContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Card>
                <CardHeader title={selectedPedido ? 'Editar Pedido' : 'Novo Pedido'} />
                <Divider />
                <CardContent>
                  <Grid container spacing={3}>
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
                    
                    <Grid size={{ xs: 12, md: isAdminGlobal ? 6 : 12 }}>
                      <Controller name="cliente_id" control={control} render={({ field }) => (
                        <Autocomplete
                          options={clientes}
                          getOptionLabel={(option) => option.nome || option.telefone || ''}
                          value={clientes.find(c => c.id === field.value) || null}
                          onChange={(_, newValue) => field.onChange(newValue?.id || 0)}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Cliente"
                              error={Boolean(errors.cliente_id)}
                              helperText={errors.cliente_id?.message}
                            />
                          )}
                          isOptionEqualToValue={(option, value) => option.id === value.id}
                        />
                      )} />
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <Controller name="tipo" control={control} render={({ field }) => (
                        <FormControl fullWidth>
                          <InputLabel>Tipo</InputLabel>
                          <Select {...field} label="Tipo" disabled={itensPendentes.length > 0 || itensSalvos.length > 0}>
                            <MenuItem value="produto">Produto</MenuItem>
                            <MenuItem value="servico">Serviço</MenuItem>
                          </Select>
                        </FormControl>
                      )} />
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <Controller name="status" control={control} render={({ field }) => (
                        <FormControl fullWidth>
                          <InputLabel>Status</InputLabel>
                          <Select {...field} label="Status">{statusOptions.map((s) => (<MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>))}</Select>
                        </FormControl>
                      )} />
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <Controller name="taxa_entrega" control={control} render={({ field }) => (
                        <FormControl fullWidth>
                          <InputLabel>Taxa de Entrega</InputLabel>
                          <OutlinedInput {...field} type="number" label="Taxa de Entrega" startAdornment={<InputAdornment position="start">R$</InputAdornment>} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} />
                        </FormControl>
                      )} />
                    </Grid>

                    <Grid size={12}>
                      <Controller name="observacao" control={control} render={({ field }) => (
                        <FormControl fullWidth>
                          <InputLabel>Observação</InputLabel>
                          <OutlinedInput {...field} value={field.value || ''} label="Observação" multiline rows={2} />
                        </FormControl>
                      )} />
                    </Grid>

                    {/* Seção de Itens */}
                    <Grid size={12}>
                      <Divider sx={{ my: 2 }} />
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                        <Typography variant="h6">Itens do Pedido</Typography>
                        <Button size="small" startIcon={<PlusIcon />} onClick={handleOpenNovoItemDialog}>
                          Adicionar Item
                        </Button>
                      </Stack>

                      {/* Lista de itens salvos (editando pedido existente) */}
                      {itensSalvos.map((item) => (
                        <Paper key={item.id} variant="outlined" sx={{ mb: 1, p: 2 }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Stack direction="row" spacing={2} alignItems="center">
                              <IconButton size="small" onClick={() => toggleItemExpanded(item.id)}>
                                {expandedItems.has(item.id) ? <CaretUpIcon /> : <CaretDownIcon />}
                              </IconButton>
                              <Box>
                                <Typography variant="subtitle2">{item.produto_nome || item.servico_nome}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {item.quantidade}x R$ {Number(item.preco_unitario).toFixed(2)} = R$ {(item.quantidade * item.preco_unitario).toFixed(2)}
                                </Typography>
                              </Box>
                            </Stack>
                            <IconButton size="small" color="error" onClick={() => handleRemoverItemSalvo(item.id)}>
                              <TrashIcon />
                            </IconButton>
                          </Stack>
                          <Collapse in={expandedItems.has(item.id)}>
                            <Box sx={{ pl: 6, pt: 1 }}>
                              {item.observacoes && (
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                  Obs: {item.observacoes}
                                </Typography>
                              )}
                              {item.adicionais && item.adicionais.length > 0 && (
                                <Box>
                                  <Typography variant="caption" color="text.secondary">Adicionais:</Typography>
                                  {item.adicionais.map((adicional) => (
                                    <Typography key={adicional.id} variant="body2" sx={{ pl: 1 }}>
                                      • {adicional.adicional_nome} (+R$ {Number(adicional.preco).toFixed(2)})
                                    </Typography>
                                  ))}
                                </Box>
                              )}
                            </Box>
                          </Collapse>
                        </Paper>
                      ))}

                      {/* Lista de itens pendentes (novo pedido) */}
                      {itensPendentes.map((item) => (
                        <Paper key={item.tempId} variant="outlined" sx={{ mb: 1, p: 2, bgcolor: 'action.hover' }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Stack direction="row" spacing={2} alignItems="center">
                              <IconButton size="small" onClick={() => toggleItemExpanded(item.tempId)}>
                                {expandedItems.has(item.tempId) ? <CaretUpIcon /> : <CaretDownIcon />}
                              </IconButton>
                              <Box>
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <Typography variant="subtitle2">{item.nome}</Typography>
                                  <Chip label="Novo" size="small" color="info" />
                                </Stack>
                                <Typography variant="body2" color="text.secondary">
                                  {item.quantidade}x R$ {Number(item.preco_unitario).toFixed(2)} = R$ {(item.quantidade * item.preco_unitario).toFixed(2)}
                                </Typography>
                              </Box>
                            </Stack>
                            <IconButton size="small" color="error" onClick={() => handleRemoverItemPendente(item.tempId)}>
                              <TrashIcon />
                            </IconButton>
                          </Stack>
                          <Collapse in={expandedItems.has(item.tempId)}>
                            <Box sx={{ pl: 6, pt: 1 }}>
                              {item.observacoes && (
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                  Obs: {item.observacoes}
                                </Typography>
                              )}
                              {item.adicionais.length > 0 && (
                                <Box>
                                  <Typography variant="caption" color="text.secondary">Adicionais:</Typography>
                                  {item.adicionais.map((adicional) => (
                                    <Typography key={adicional.adicional_id} variant="body2" sx={{ pl: 1 }}>
                                      • {adicional.nome} (+R$ {Number(adicional.preco).toFixed(2)})
                                    </Typography>
                                  ))}
                                </Box>
                              )}
                            </Box>
                          </Collapse>
                        </Paper>
                      ))}

                      {itensPendentes.length === 0 && itensSalvos.length === 0 && (
                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                          Nenhum item adicionado. Clique em &quot;Adicionar Item&quot; para começar.
                        </Typography>
                      )}

                      {/* Resumo do Total */}
                      <Divider sx={{ my: 2 }} />
                      <Stack direction="row" justifyContent="flex-end" spacing={2}>
                        <Typography variant="h6">
                          Total: R$ {(calcularTotal() + (watch('taxa_entrega') || 0)).toFixed(2)}
                        </Typography>
                      </Stack>
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

        {/* Dialog para adicionar novo item */}
        <Dialog open={novoItemDialogOpen} onClose={() => setNovoItemDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogContent>
            <Card>
              <CardHeader title="Adicionar Item" />
              <Divider />
              <CardContent>
                <Stack spacing={3}>
                  {tipoSelecionado === 'produto' ? (
                    <Autocomplete
                      options={produtos}
                      getOptionLabel={(option) => option.nome}
                      value={novoItemProduto}
                      onChange={(_, newValue) => {
                        setNovoItemProduto(newValue);
                        if (newValue) {
                          setNovoItemPreco(newValue.preco);
                        }
                        setNovoItemAdicionais([]);
                      }}
                      renderInput={(params) => <TextField {...params} label="Produto" />}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                    />
                  ) : (
                    <Autocomplete
                      options={servicos}
                      getOptionLabel={(option) => option.nome}
                      value={novoItemServico}
                      onChange={(_, newValue) => {
                        setNovoItemServico(newValue);
                        // Serviços não têm preço direto, o usuário precisa definir
                      }}
                      renderInput={(params) => <TextField {...params} label="Serviço" />}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                    />
                  )}

                  <Stack direction="row" spacing={2}>
                    <TextField
                      label="Quantidade"
                      type="number"
                      value={novoItemQuantidade}
                      onChange={(e) => setNovoItemQuantidade(parseInt(e.target.value) || 1)}
                      inputProps={{ min: 1 }}
                      sx={{ width: '30%' }}
                    />
                    <TextField
                      label="Preço Unitário"
                      type="number"
                      value={novoItemPreco}
                      onChange={(e) => setNovoItemPreco(parseFloat(e.target.value) || 0)}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                      }}
                      sx={{ flex: 1 }}
                    />
                  </Stack>

                  <TextField
                    label="Observações"
                    value={novoItemObservacoes}
                    onChange={(e) => setNovoItemObservacoes(e.target.value)}
                    multiline
                    rows={2}
                  />

                  {/* Adicionais (apenas para produtos) */}
                  {tipoSelecionado === 'produto' && adicionaisFiltrados.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>Adicionais Disponíveis:</Typography>
                      {adicionaisFiltrados.map((adicional) => (
                        <FormControlLabel
                          key={adicional.id}
                          control={
                            <Checkbox
                              checked={novoItemAdicionais.includes(adicional.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setNovoItemAdicionais([...novoItemAdicionais, adicional.id]);
                                } else {
                                  setNovoItemAdicionais(novoItemAdicionais.filter(id => id !== adicional.id));
                                }
                              }}
                            />
                          }
                          label={`${adicional.nome} (+R$ ${Number(adicional.preco).toFixed(2)})`}
                        />
                      ))}
                    </Box>
                  )}

                  {/* Subtotal do item */}
                  <Box sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Subtotal: R$ {(novoItemPreco * novoItemQuantidade + adicionaisFiltrados.filter(a => novoItemAdicionais.includes(a.id)).reduce((sum, a) => sum + a.preco, 0) * novoItemQuantidade).toFixed(2)}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
              <Divider />
              <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                <Button onClick={() => setNovoItemDialogOpen(false)}>Cancelar</Button>
                <Button variant="contained" onClick={handleAdicionarItem} disabled={tipoSelecionado === 'produto' ? !novoItemProduto : !novoItemServico}>
                  Adicionar
                </Button>
              </CardActions>
            </Card>
          </DialogContent>
        </Dialog>
      </Stack>
    </Box>
  );
}
