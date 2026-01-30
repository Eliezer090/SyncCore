'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { PencilSimpleIcon } from '@phosphor-icons/react/dist/ssr/PencilSimple';
import { TrashIcon } from '@phosphor-icons/react/dist/ssr/Trash';
import dayjs from 'dayjs';

import type { Empresa } from '@/types/database';
import { useSelection } from '@/hooks/use-selection';

interface EmpresasTableProps {
  count?: number;
  page?: number;
  rows?: Empresa[];
  rowsPerPage?: number;
  onPageChange?: (page: number) => void;
  onRowsPerPageChange?: (rowsPerPage: number) => void;
  onEdit?: (empresa: Empresa) => void;
  onDelete?: (id: number) => void;
}

export function EmpresasTable({
  count = 0,
  rows = [],
  page = 0,
  rowsPerPage = 10,
  onPageChange,
  onRowsPerPageChange,
  onEdit,
  onDelete,
}: EmpresasTableProps): React.JSX.Element {
  const rowIds = React.useMemo(() => rows.map((empresa) => empresa.id.toString()), [rows]);
  const { selectAll, deselectAll, selectOne, deselectOne, selected } = useSelection(rowIds);

  const selectedSome = (selected?.size ?? 0) > 0 && (selected?.size ?? 0) < rows.length;
  const selectedAll = rows.length > 0 && selected?.size === rows.length;

  const handlePageChange = (_: unknown, newPage: number) => {
    onPageChange?.(newPage);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onRowsPerPageChange?.(parseInt(event.target.value, 10));
  };

  return (
    <Card>
      <Box sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: '900px' }}>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectedAll}
                  indeterminate={selectedSome}
                  onChange={(event) => {
                    if (event.target.checked) {
                      selectAll();
                    } else {
                      deselectAll();
                    }
                  }}
                />
              </TableCell>
              <TableCell>Nome</TableCell>
              <TableCell>Tipo de Negócio</TableCell>
              <TableCell>Modelo</TableCell>
              <TableCell>WhatsApp</TableCell>
              <TableCell>Delivery</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Criado em</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => {
              const isSelected = selected?.has(row.id.toString());

              return (
                <TableRow hover key={row.id} selected={isSelected}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isSelected}
                      onChange={(event) => {
                        if (event.target.checked) {
                          selectOne(row.id.toString());
                        } else {
                          deselectOne(row.id.toString());
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2">{row.nome}</Typography>
                    {row.nome_agente && (
                      <Typography color="text.secondary" variant="body2">
                        Agente: {row.nome_agente}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{row.tipo_negocio}</TableCell>
                  <TableCell>
                    <Chip
                      label={row.modelo_negocio}
                      size="small"
                      color={row.modelo_negocio === 'produto' ? 'primary' : row.modelo_negocio === 'servico' ? 'secondary' : 'default'}
                    />
                  </TableCell>
                  <TableCell>{row.whatsapp_vinculado || '-'}</TableCell>
                  <TableCell>
                    {row.oferece_delivery ? (
                      <Chip label="Sim" size="small" color="success" />
                    ) : (
                      <Chip label="Não" size="small" color="default" />
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={row.ativo ? 'Ativo' : 'Inativo'}
                      size="small"
                      color={row.ativo ? 'success' : 'error'}
                    />
                  </TableCell>
                  <TableCell>{dayjs(row.criado_em).format('DD/MM/YYYY HH:mm')}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Editar">
                      <IconButton onClick={() => onEdit?.(row)}>
                        <PencilSimpleIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Excluir">
                      <IconButton onClick={() => onDelete?.(row.id)} color="error">
                        <TrashIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>
      <Divider />
      <TablePagination
        component="div"
        count={count}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
        labelRowsPerPage="Linhas por página"
      />
    </Card>
  );
}
