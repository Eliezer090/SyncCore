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

import type { Empresa } from '@/types/database';
import { LoadingOverlay } from '@/components/core/loading-overlay';
import { EmpresasFilters } from '@/components/dashboard/empresas/empresas-filters';
import { EmpresasTable } from '@/components/dashboard/empresas/empresas-table';
import { EmpresaForm } from '@/components/dashboard/empresas/empresa-form';
import { useEmpresa } from '@/hooks/use-empresa';
import { getAuthHeaders } from '@/lib/auth/client';

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
      </Stack>
    </Box>
  );
}
