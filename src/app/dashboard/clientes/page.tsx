'use client';

import * as React from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';

import type { Cliente } from '@/types/database';
import { LoadingOverlay } from '@/components/core/loading-overlay';
import { ClientesFilters } from '@/components/dashboard/clientes/clientes-filters';
import { ClientesTable } from '@/components/dashboard/clientes/clientes-table';
import { ClienteForm } from '@/components/dashboard/clientes/cliente-form';
import { useEmpresa } from '@/hooks/use-empresa';
import { getAuthHeaders } from '@/lib/auth/client';

export default function ClientesPage(): React.JSX.Element {
  const { empresaId, refreshKey } = useEmpresa();
  const [clientes, setClientes] = React.useState<Cliente[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [search, setSearch] = React.useState('');
  const [loadingData, setLoadingData] = React.useState(true);
  const [loadingSave, setLoadingSave] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedCliente, setSelectedCliente] = React.useState<Cliente | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const fetchClientes = React.useCallback(async () => {
    setLoadingData(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: rowsPerPage.toString(),
        ...(search && { search }),
      });
      const response = await fetch(`/api/clientes?${params}`, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      setClientes(data.data || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
    } finally {
      setLoadingData(false);
    }
  }, [page, rowsPerPage, search, empresaId, refreshKey]); // empresaId e refreshKey como dependências para refetch quando admin muda de empresa

  React.useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(0);
  };

  const handleOpenDialog = (cliente?: Cliente) => {
    setSelectedCliente(cliente || null);
    setErrorMessage(null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedCliente(null);
    setErrorMessage(null);
  };

  const handleSubmit = async (data: Record<string, unknown>) => {
    setLoadingSave(true);
    setErrorMessage(null);
    try {
      const url = selectedCliente ? `/api/clientes/${selectedCliente.id}` : '/api/clientes';
      const method = selectedCliente ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        handleCloseDialog();
        fetchClientes();
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.error || 'Erro ao salvar cliente');
      }
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      setErrorMessage('Erro de conexão. Tente novamente.');
    } finally {
      setLoadingSave(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este cliente?')) return;

    try {
      const response = await fetch(`/api/clientes/${id}`, { 
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        fetchClientes();
      }
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
    }
  };

  return (
    <Box sx={{ position: 'relative', minHeight: 400 }}>
      <LoadingOverlay open={loadingData} message="Carregando clientes..." />
      <Stack spacing={3}>
        <Stack direction="row" spacing={3} alignItems="center" justifyContent="space-between">
          <Typography variant="h4">Clientes</Typography>
          <Button
            startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />}
            variant="contained"
            onClick={() => handleOpenDialog()}
          >
            Novo Cliente
          </Button>
        </Stack>
        <ClientesFilters onSearch={handleSearch} />
        <ClientesTable
          count={total}
          rows={clientes}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={setPage}
          onRowsPerPageChange={(rpp) => {
            setRowsPerPage(rpp);
            setPage(0);
          }}
          onEdit={handleOpenDialog}
          onDelete={handleDelete}
        />
        <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogContent>
            {errorMessage && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErrorMessage(null)}>
                {errorMessage}
              </Alert>
            )}
            <ClienteForm
              cliente={selectedCliente}
              onSubmit={handleSubmit}
              onCancel={handleCloseDialog}
              loading={loadingSave}
            />
          </DialogContent>
        </Dialog>
      </Stack>
    </Box>
  );
}
