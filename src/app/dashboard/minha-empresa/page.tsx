'use client';

import * as React from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import type { Empresa } from '@/types/database';
import { LoadingOverlay } from '@/components/core/loading-overlay';
import { EmpresaForm } from '@/components/dashboard/empresas/empresa-form';
import { useUser } from '@/hooks/use-user';
import { getAuthHeaders } from '@/lib/auth/client';

export default function MinhaEmpresaPage(): React.JSX.Element {
  const { user } = useUser();
  const [empresa, setEmpresa] = React.useState<Empresa | null>(null);
  const [loadingData, setLoadingData] = React.useState(true);
  const [loadingSave, setLoadingSave] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  const empresaId = user?.empresa?.id || user?.empresaAtiva?.id;

  const fetchEmpresa = React.useCallback(async () => {
    if (!empresaId) {
      setLoadingData(false);
      return;
    }

    setLoadingData(true);
    try {
      const response = await fetch(`/api/empresas/${empresaId}`, {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        setEmpresa(data);
      } else {
        setErrorMessage('Erro ao carregar dados da empresa');
      }
    } catch (error) {
      console.error('Erro ao buscar empresa:', error);
      setErrorMessage('Erro de conexão ao carregar empresa');
    } finally {
      setLoadingData(false);
    }
  }, [empresaId]);

  React.useEffect(() => {
    fetchEmpresa();
  }, [fetchEmpresa]);

  const handleSubmit = async (data: Record<string, unknown>) => {
    if (!empresaId) return;

    setLoadingSave(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`/api/empresas/${empresaId}`, {
        method: 'PUT',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const updatedEmpresa = await response.json();
        setEmpresa(updatedEmpresa);
        setSuccessMessage('Empresa atualizada com sucesso!');
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

  if (!empresaId) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          Você não possui uma empresa vinculada. Entre em contato com o administrador.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative', minHeight: 400 }}>
      <LoadingOverlay open={loadingData} message="Carregando dados da empresa..." />
      <Stack spacing={3}>
        <Typography variant="h4">Minha Empresa</Typography>

        {errorMessage && (
          <Alert severity="error" onClose={() => setErrorMessage(null)}>
            {errorMessage}
          </Alert>
        )}

        {successMessage && (
          <Alert severity="success" onClose={() => setSuccessMessage(null)}>
            {successMessage}
          </Alert>
        )}

        {empresa && (
          <EmpresaForm
            empresa={empresa}
            onSubmit={handleSubmit}
            onCancel={() => {
              // Recarrega os dados ao cancelar
              fetchEmpresa();
            }}
            loading={loadingSave}
          />
        )}
      </Stack>
    </Box>
  );
}
