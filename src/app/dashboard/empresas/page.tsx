'use client';

import * as React from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select from '@mui/material/Select';
import { PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import type { Empresa, Endereco } from '@/types/database';
import { LoadingOverlay } from '@/components/core/loading-overlay';
import { EmpresasFilters } from '@/components/dashboard/empresas/empresas-filters';
import { EmpresasTable } from '@/components/dashboard/empresas/empresas-table';
import { EmpresaForm } from '@/components/dashboard/empresas/empresa-form';
import { useEmpresa } from '@/hooks/use-empresa';
import { getAuthHeaders } from '@/lib/auth/client';

const enderecoSchema = z.object({
  tipo: z.string().min(1, 'Tipo é obrigatório'),
  cep: z.string().nullable().optional(),
  logradouro: z.string().min(1, 'Logradouro é obrigatório'),
  numero: z.string().nullable().optional(),
  bairro: z.string().nullable().optional(),
  cidade: z.string().nullable().optional(),
  referencia: z.string().nullable().optional(),
});

type EnderecoFormData = z.infer<typeof enderecoSchema>;

export default function EmpresasPage(): React.JSX.Element {
  const { refreshKey } = useEmpresa();
  const [empresas, setEmpresas] = React.useState<Empresa[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [search, setSearch] = React.useState('');
  const [loadingData, setLoadingData] = React.useState(true);
  const [loadingSave, setLoadingSave] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedEmpresa, setSelectedEmpresa] = React.useState<Empresa | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  
  // Estados para dialog de endereço
  const [enderecoDialogOpen, setEnderecoDialogOpen] = React.useState(false);
  const [enderecoEmpresa, setEnderecoEmpresa] = React.useState<Empresa | null>(null);
  const [enderecoExistente, setEnderecoExistente] = React.useState<Endereco | null>(null);
  const [loadingEndereco, setLoadingEndereco] = React.useState(false);
  const [enderecoError, setEnderecoError] = React.useState<string | null>(null);

  const { control: enderecoControl, handleSubmit: handleEnderecoSubmit, reset: resetEndereco, formState: { errors: enderecoErrors } } = useForm<EnderecoFormData>({
    resolver: zodResolver(enderecoSchema),
    defaultValues: { tipo: 'comercial', cep: '', logradouro: '', numero: '', bairro: '', cidade: '', referencia: '' },
  });

  const fetchEmpresas = React.useCallback(async () => {
    setLoadingData(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: rowsPerPage.toString(),
        ...(search && { search }),
      });
      const response = await fetch(`/api/empresas?${params}`, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      setEmpresas(data.data || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Erro ao buscar empresas:', error);
    } finally {
      setLoadingData(false);
    }
  }, [page, rowsPerPage, search, refreshKey]);

  React.useEffect(() => {
    fetchEmpresas();
  }, [fetchEmpresas]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(0);
  };

  const handleOpenDialog = (empresa?: Empresa) => {
    setSelectedEmpresa(empresa || null);
    setErrorMessage(null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedEmpresa(null);
    setErrorMessage(null);
  };

  const handleSubmit = async (data: Record<string, unknown>) => {
    setLoadingSave(true);
    setErrorMessage(null);
    try {
      const url = selectedEmpresa ? `/api/empresas/${selectedEmpresa.id}` : '/api/empresas';
      const method = selectedEmpresa ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        handleCloseDialog();
        fetchEmpresas();
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.error || 'Erro ao salvar empresa');
      }
    } catch (error) {
      console.error('Erro ao salvar empresa:', error);
      setErrorMessage('Erro de conexão. Tente novamente.');
    } finally {
      setLoadingSave(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta empresa?')) return;

    try {
      const response = await fetch(`/api/empresas/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
      if (response.ok) {
        fetchEmpresas();
      }
    } catch (error) {
      console.error('Erro ao excluir empresa:', error);
    }
  };

  // Funções para gerenciar endereço
  const handleOpenEnderecoDialog = async (empresa: Empresa) => {
    setEnderecoEmpresa(empresa);
    setEnderecoError(null);
    setLoadingEndereco(true);
    setEnderecoDialogOpen(true);
    
    try {
      // Buscar endereço existente da empresa
      const response = await fetch(`/api/enderecos?empresa_id=${empresa.id}&limit=1`, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      const endereco = data.data?.[0] || null;
      setEnderecoExistente(endereco);
      
      if (endereco) {
        resetEndereco({
          tipo: endereco.tipo || 'comercial',
          cep: endereco.cep || '',
          logradouro: endereco.logradouro || '',
          numero: endereco.numero || '',
          bairro: endereco.bairro || '',
          cidade: endereco.cidade || '',
          referencia: endereco.referencia || '',
        });
      } else {
        resetEndereco({ tipo: 'comercial', cep: '', logradouro: '', numero: '', bairro: '', cidade: '', referencia: '' });
      }
    } catch (error) {
      console.error('Erro ao buscar endereço:', error);
      setEnderecoError('Erro ao carregar endereço');
    } finally {
      setLoadingEndereco(false);
    }
  };

  const handleCloseEnderecoDialog = () => {
    setEnderecoDialogOpen(false);
    setEnderecoEmpresa(null);
    setEnderecoExistente(null);
    setEnderecoError(null);
  };

  const onEnderecoSubmit = async (data: EnderecoFormData) => {
    if (!enderecoEmpresa) return;
    
    setLoadingEndereco(true);
    setEnderecoError(null);
    
    try {
      const payload = { ...data, empresa_id: enderecoEmpresa.id, cliente_id: null };
      const url = enderecoExistente ? `/api/enderecos/${enderecoExistente.id}` : '/api/enderecos';
      const method = enderecoExistente ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (response.ok) {
        handleCloseEnderecoDialog();
      } else {
        const errorData = await response.json();
        setEnderecoError(errorData.error || 'Erro ao salvar endereço');
      }
    } catch (error) {
      console.error('Erro ao salvar endereço:', error);
      setEnderecoError('Erro de conexão. Tente novamente.');
    } finally {
      setLoadingEndereco(false);
    }
  };

  return (
    <Box sx={{ position: 'relative', minHeight: 400 }}>
      <LoadingOverlay open={loadingData} message="Carregando empresas..." />
      <Stack spacing={3}>
        <Stack direction="row" spacing={3} alignItems="center" justifyContent="space-between">
          <Typography variant="h4">Empresas</Typography>
          <Button
            startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />}
            variant="contained"
            onClick={() => handleOpenDialog()}
          >
            Nova Empresa
          </Button>
        </Stack>
        <EmpresasFilters onSearch={handleSearch} />
        <EmpresasTable
          count={total}
          rows={empresas}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={setPage}
          onRowsPerPageChange={(rpp) => {
            setRowsPerPage(rpp);
            setPage(0);
          }}
          onEdit={handleOpenDialog}
          onDelete={handleDelete}
          onEndereco={handleOpenEnderecoDialog}
        />
        <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogContent>
            {errorMessage && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErrorMessage(null)}>
                {errorMessage}
              </Alert>
            )}
            <EmpresaForm
              empresa={selectedEmpresa}
              onSubmit={handleSubmit}
              onCancel={handleCloseDialog}
              loading={loadingSave}
            />
          </DialogContent>
        </Dialog>
        
        {/* Dialog de Endereço */}
        <Dialog open={enderecoDialogOpen} onClose={handleCloseEnderecoDialog} maxWidth="sm" fullWidth>
          <DialogContent>
            {enderecoError && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setEnderecoError(null)}>
                {enderecoError}
              </Alert>
            )}
            <form onSubmit={handleEnderecoSubmit(onEnderecoSubmit)}>
              <Card>
                <CardHeader title={`Endereço: ${enderecoEmpresa?.nome || ''}`} />
                <Divider />
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Controller
                        name="tipo"
                        control={enderecoControl}
                        render={({ field }) => (
                          <FormControl fullWidth error={Boolean(enderecoErrors.tipo)}>
                            <InputLabel>Tipo</InputLabel>
                            <Select {...field} label="Tipo">
                              <MenuItem value="comercial">Comercial</MenuItem>
                              <MenuItem value="residencial">Residencial</MenuItem>
                              <MenuItem value="matriz">Matriz</MenuItem>
                              <MenuItem value="filial">Filial</MenuItem>
                            </Select>
                            {enderecoErrors.tipo && <FormHelperText>{enderecoErrors.tipo.message}</FormHelperText>}
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Controller
                        name="cep"
                        control={enderecoControl}
                        render={({ field }) => (
                          <FormControl fullWidth>
                            <InputLabel>CEP</InputLabel>
                            <OutlinedInput {...field} value={field.value || ''} label="CEP" />
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 8 }}>
                      <Controller
                        name="logradouro"
                        control={enderecoControl}
                        render={({ field }) => (
                          <FormControl fullWidth error={Boolean(enderecoErrors.logradouro)}>
                            <InputLabel>Logradouro</InputLabel>
                            <OutlinedInput {...field} label="Logradouro" />
                            {enderecoErrors.logradouro && <FormHelperText>{enderecoErrors.logradouro.message}</FormHelperText>}
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Controller
                        name="numero"
                        control={enderecoControl}
                        render={({ field }) => (
                          <FormControl fullWidth>
                            <InputLabel>Número</InputLabel>
                            <OutlinedInput {...field} value={field.value || ''} label="Número" />
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Controller
                        name="bairro"
                        control={enderecoControl}
                        render={({ field }) => (
                          <FormControl fullWidth>
                            <InputLabel>Bairro</InputLabel>
                            <OutlinedInput {...field} value={field.value || ''} label="Bairro" />
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Controller
                        name="cidade"
                        control={enderecoControl}
                        render={({ field }) => (
                          <FormControl fullWidth>
                            <InputLabel>Cidade</InputLabel>
                            <OutlinedInput {...field} value={field.value || ''} label="Cidade" />
                          </FormControl>
                        )}
                      />
                    </Grid>
                    <Grid size={12}>
                      <Controller
                        name="referencia"
                        control={enderecoControl}
                        render={({ field }) => (
                          <FormControl fullWidth>
                            <InputLabel>Referência</InputLabel>
                            <OutlinedInput {...field} value={field.value || ''} label="Referência" />
                          </FormControl>
                        )}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
                <Divider />
                <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                  <Button onClick={handleCloseEnderecoDialog} disabled={loadingEndereco}>Cancelar</Button>
                  <Button type="submit" variant="contained" disabled={loadingEndereco}>
                    {loadingEndereco ? 'Salvando...' : 'Salvar'}
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
