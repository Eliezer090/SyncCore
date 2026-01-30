'use client';

import * as React from 'react';
import Button from '@mui/material/Button';
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
import Avatar from '@mui/material/Avatar';
import { PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { PencilSimpleIcon } from '@phosphor-icons/react/dist/ssr/PencilSimple';
import { UserIcon } from '@phosphor-icons/react/dist/ssr/User';
import dayjs from 'dayjs';

import type { Usuario } from '@/types/database';
import { LoadingOverlay } from '@/components/core/loading-overlay';
import { useEmpresa } from '@/hooks/use-empresa';
import { getAuthHeaders } from '@/lib/auth/client';
import { useRouter } from 'next/navigation';

// Profissionais agora sao usuarios com papel = 'profissional'
// Para criar/editar, redirecionar para /dashboard/usuarios

export default function ProfissionaisPage(): React.JSX.Element {
  const router = useRouter();
  const { isAdminGlobal, refreshKey } = useEmpresa();
  const [profissionais, setProfissionais] = React.useState<(Usuario & { empresa_nome?: string })[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [loadingData, setLoadingData] = React.useState(true);

  const fetchProfissionais = React.useCallback(async () => {
    setLoadingData(true);
    try {
      const params = new URLSearchParams({ 
        page: page.toString(), 
        limit: rowsPerPage.toString(),
        apenas_ativos: 'false'
      });
      const response = await fetch(`/api/profissionais?${params}`, {
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      setProfissionais(data.data || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Erro ao buscar profissionais:', error);
    } finally {
      setLoadingData(false);
    }
  }, [page, rowsPerPage, refreshKey]);

  React.useEffect(() => {
    fetchProfissionais();
  }, [fetchProfissionais]);

  const handleNovoProfissional = () => {
    router.push('/dashboard/usuarios?novo=profissional');
  };

  const handleEditarProfissional = (id: number) => {
    router.push(`/dashboard/usuarios?editar=${id}`);
  };

  return (
    <Box sx={{ position: 'relative', minHeight: 400 }}>
      <LoadingOverlay open={loadingData} message="Carregando profissionais..." />
      <Stack spacing={3}>
        <Stack direction="row" spacing={3} alignItems="center" justifyContent="space-between">
          <Stack spacing={1}>
            <Typography variant="h4">Profissionais</Typography>
            <Typography color="text.secondary" variant="body2">
              Profissionais sao usuarios com papel &quot;profissional&quot;. Para cadastrar, va em Usuarios.
            </Typography>
          </Stack>
          <Button 
            startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />} 
            variant="contained" 
            onClick={handleNovoProfissional}
          >
            Novo Profissional
          </Button>
        </Stack>
        <Card>
          <Box sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: '700px' }}>
              <TableHead>
                <TableRow>
                  <TableCell>Profissional</TableCell>
                  <TableCell>Email</TableCell>
                  {isAdminGlobal && <TableCell>Empresa</TableCell>}
                  <TableCell>Status</TableCell>
                  <TableCell>Criado em</TableCell>
                  <TableCell align="right">Acoes</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {profissionais.length === 0 && !loadingData && (
                  <TableRow>
                    <TableCell colSpan={isAdminGlobal ? 6 : 5} align="center">
                      <Typography color="text.secondary" variant="body2" sx={{ py: 3 }}>
                        Nenhum profissional encontrado
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
                {profissionais.map((row) => (
                  <TableRow hover key={row.id}>
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar src={row.url_foto || undefined} sx={{ width: 40, height: 40 }}>
                          <UserIcon />
                        </Avatar>
                        <Typography variant="subtitle2">{row.nome}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>{row.email}</TableCell>
                    {isAdminGlobal && <TableCell>{row.empresa_nome || '-'}</TableCell>}
                    <TableCell>
                      <Chip 
                        label={row.ativo ? 'Ativo' : 'Inativo'} 
                        size="small" 
                        color={row.ativo ? 'success' : 'error'} 
                      />
                    </TableCell>
                    <TableCell>{dayjs(row.criado_em).format('DD/MM/YYYY')}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Editar">
                        <IconButton onClick={() => handleEditarProfissional(row.id)}>
                          <PencilSimpleIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
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
            labelRowsPerPage="Linhas por pagina" 
          />
        </Card>
      </Stack>
    </Box>
  );
}
