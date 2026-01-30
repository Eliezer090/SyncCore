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
import { useSearchParams, useRouter } from 'next/navigation';

import type { Usuario, Empresa } from '@/types/database';
import { LoadingOverlay } from '@/components/core/loading-overlay';
import { UsuariosTable } from '@/components/dashboard/usuarios/usuarios-table';
import { UsuarioForm } from '@/components/dashboard/usuarios/usuario-form';
import { useUser } from '@/hooks/use-user';
import { useEmpresa } from '@/hooks/use-empresa';
import { getAuthHeaders } from '@/lib/auth/client';

export default function UsuariosPage(): React.JSX.Element {
  const { user } = useUser();
  const { empresaId, refreshKey } = useEmpresa();
  const isAdminGlobal = user?.papel === 'admin';
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [usuarios, setUsuarios] = React.useState<(Usuario & { empresa_nome?: string })[]>([]);
  const [empresas, setEmpresas] = React.useState<Empresa[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [loadingData, setLoadingData] = React.useState(true);
  const [loadingSave, setLoadingSave] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedUsuario, setSelectedUsuario] = React.useState<Usuario | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [defaultPapel, setDefaultPapel] = React.useState<string | null>(null);

  const fetchUsuarios = React.useCallback(async () => {
    setLoadingData(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: rowsPerPage.toString(),
      });
      const response = await fetch(`/api/usuarios?${params}`, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      setUsuarios(data.data || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
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

  React.useEffect(() => {
    fetchUsuarios();
    fetchEmpresas();
  }, [fetchUsuarios, fetchEmpresas]);

  // Processar parâmetros da URL (novo=profissional ou editar={id})
  React.useEffect(() => {
    const novo = searchParams.get('novo');
    const editarId = searchParams.get('editar');
    
    if (novo === 'profissional') {
      // Abrir dialog para criar novo profissional
      setDefaultPapel('profissional');
      setSelectedUsuario(null);
      setErrorMessage(null);
      setDialogOpen(true);
      // Limpar parâmetros da URL
      router.replace('/dashboard/usuarios');
    } else if (editarId && usuarios.length > 0) {
      // Abrir dialog para editar usuário específico
      const usuarioParaEditar = usuarios.find(u => u.id === parseInt(editarId, 10));
      if (usuarioParaEditar) {
        setSelectedUsuario(usuarioParaEditar);
        setErrorMessage(null);
        setDialogOpen(true);
        // Limpar parâmetros da URL
        router.replace('/dashboard/usuarios');
      }
    }
  }, [searchParams, usuarios, router]);

  const handleOpenDialog = (usuario?: Usuario) => {
    setSelectedUsuario(usuario || null);
    setDefaultPapel(null);
    setErrorMessage(null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedUsuario(null);
    setDefaultPapel(null);
    setErrorMessage(null);
  };

  const handleSubmit = async (data: Record<string, unknown>) => {
    console.log('[UsuariosPage] handleSubmit chamado com:', data);
    setLoadingSave(true);
    setErrorMessage(null);
    try {
      const url = selectedUsuario ? `/api/usuarios/${selectedUsuario.id}` : '/api/usuarios';
      const method = selectedUsuario ? 'PUT' : 'POST';
      
      console.log('[UsuariosPage] Fazendo requisição:', method, url);

      const response = await fetch(url, {
        method,
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      console.log('[UsuariosPage] Resposta:', response.status, response.ok);

      if (response.ok) {
        handleCloseDialog();
        fetchUsuarios();
      } else {
        const errorData = await response.json();
        console.error('[UsuariosPage] Erro na resposta:', errorData);
        setErrorMessage(errorData.error || 'Erro ao salvar usuário');
      }
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      setErrorMessage('Erro de conexão. Tente novamente.');
    } finally {
      setLoadingSave(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return;

    try {
      const response = await fetch(`/api/usuarios/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
      if (response.ok) {
        fetchUsuarios();
      }
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
    }
  };

  return (
    <Box sx={{ position: 'relative', minHeight: 400 }}>
      <LoadingOverlay open={loadingData} message="Carregando usuários..." />
      <Stack spacing={3}>
        <Stack direction="row" spacing={3} alignItems="center" justifyContent="space-between">
          <Typography variant="h4">Usuários</Typography>
          <Button
            startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />}
            variant="contained"
            onClick={() => handleOpenDialog()}
          >
            Novo Usuário
          </Button>
        </Stack>
        <UsuariosTable
          count={total}
          rows={usuarios}
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
            <UsuarioForm
              usuario={selectedUsuario}
              empresas={empresas}
              onSubmit={handleSubmit}
              onCancel={handleCloseDialog}
              loading={loadingSave}
              defaultPapel={defaultPapel}
            />
          </DialogContent>
        </Dialog>
      </Stack>
    </Box>
  );
}
