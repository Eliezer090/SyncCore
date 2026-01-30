'use client';

import * as React from 'react';
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
import { TrashIcon } from '@phosphor-icons/react/dist/ssr/Trash';
import { EyeIcon } from '@phosphor-icons/react/dist/ssr/Eye';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';

import type { HistoricoConversa } from '@/types/database';
import { LoadingOverlay } from '@/components/core/loading-overlay';

export default function HistoricoConversasPage(): React.JSX.Element {
  const [historico, setHistorico] = React.useState<HistoricoConversa[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(25);
  const [loadingData, setLoadingData] = React.useState(true);
  const [selectedItem, setSelectedItem] = React.useState<HistoricoConversa | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const fetchHistorico = React.useCallback(async () => {
    setLoadingData(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: rowsPerPage.toString() });
      const response = await fetch(`/api/historico-conversas?${params}`);
      const data = await response.json();
      setHistorico(data.data || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
    } finally {
      setLoadingData(false);
    }
  }, [page, rowsPerPage]);

  React.useEffect(() => {
    fetchHistorico();
  }, [fetchHistorico]);

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este registro?')) return;
    try {
      const response = await fetch(`/api/historico-conversas/${id}`, { method: 'DELETE' });
      if (response.ok) { fetchHistorico(); }
    } catch (error) {
      console.error('Erro ao excluir registro:', error);
    }
  };

  const handleViewDetails = (item: HistoricoConversa) => {
    setSelectedItem(item);
    setDialogOpen(true);
  };

  return (
    <Box sx={{ position: 'relative', minHeight: 400 }}>
      <LoadingOverlay open={loadingData} message="Carregando histórico..." />
      <Stack spacing={3}>
        <Stack direction="row" spacing={3} alignItems="center" justifyContent="space-between">
        <Typography variant="h4">Histórico de Conversas</Typography>
      </Stack>
      <Card>
        <Box sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: '800px' }}>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Session ID</TableCell>
                <TableCell>Mensagem (resumo)</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {historico.map((row) => (
                <TableRow hover key={row.id}>
                  <TableCell><Typography variant="subtitle2">{row.id}</Typography></TableCell>
                  <TableCell>{row.session_id}</TableCell>
                  <TableCell>
                    <Typography variant="body2" noWrap sx={{ maxWidth: 400 }}>
                      {JSON.stringify(row.message).substring(0, 100)}...
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Ver Detalhes"><IconButton onClick={() => handleViewDetails(row)}><EyeIcon /></IconButton></Tooltip>
                    <Tooltip title="Excluir"><IconButton onClick={() => handleDelete(row.id)} color="error"><TrashIcon /></IconButton></Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
        <Divider />
        <TablePagination component="div" count={total} onPageChange={(_, p) => setPage(p)} onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }} page={page} rowsPerPage={rowsPerPage} rowsPerPageOptions={[10, 25, 50, 100]} labelRowsPerPage="Linhas por página" />
      </Card>
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Detalhes do Registro</DialogTitle>
        <DialogContent dividers>
          {selectedItem && (
            <Stack spacing={2}>
              <Typography><strong>ID:</strong> {selectedItem.id}</Typography>
              <Typography><strong>Session ID:</strong> {selectedItem.session_id}</Typography>
              <Divider />
              <Typography variant="subtitle1"><strong>Mensagem (JSON):</strong></Typography>
              <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1, overflow: 'auto', maxHeight: 400 }}>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                  {JSON.stringify(selectedItem.message, null, 2)}
                </pre>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Fechar</Button>
        </DialogActions>
      </Dialog>
      </Stack>
    </Box>
  );
}
