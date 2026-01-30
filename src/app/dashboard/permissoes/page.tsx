'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import { 
  ArrowClockwise as RefreshIcon, 
  FloppyDisk as SaveIcon,
  Plus as PlusIcon,
  PencilSimple as EditIcon,
  Trash as TrashIcon
} from '@phosphor-icons/react/dist/ssr';

import type { PermissaoCompleta, PapelEmpresa } from '@/types/database';
import { getAuthHeaders } from '@/lib/auth/client';
import { useUser } from '@/hooks/use-user';

// Papéis do sistema (fixos)
type PapelSistema = 'gerente' | 'profissional' | 'atendente';

const PAPEIS_SISTEMA: { value: PapelSistema; label: string; cor: 'primary' | 'secondary' | 'success' | 'warning' | 'info' }[] = [
  { value: 'gerente', label: 'Gerente', cor: 'secondary' },
  { value: 'profissional', label: 'Profissional', cor: 'success' },
  { value: 'atendente', label: 'Atendente', cor: 'warning' },
];

interface PermissaoEditavel extends PermissaoCompleta {
  modificado?: boolean;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

export default function PermissoesPage(): React.JSX.Element {
  const { user, isLoading: userLoading } = useUser();
  const [tabAtual, setTabAtual] = React.useState(0);
  
  // Estado para papéis do sistema
  const [papelSelecionado, setPapelSelecionado] = React.useState<PapelSistema>('gerente');
  const [permissoes, setPermissoes] = React.useState<PermissaoEditavel[]>([]);
  
  // Estado para papéis customizados
  const [papeisCustomizados, setPapeisCustomizados] = React.useState<PapelEmpresa[]>([]);
  const [papelCustomizadoSelecionado, setPapelCustomizadoSelecionado] = React.useState<number | null>(null);
  const [permissoesCustomizadas, setPermissoesCustomizadas] = React.useState<PermissaoEditavel[]>([]);
  
  // Dialog para criar/editar papel customizado
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogMode, setDialogMode] = React.useState<'criar' | 'editar'>('criar');
  const [novoPapel, setNovoPapel] = React.useState({ codigo: '', nome: '', descricao: '', cor: 'default', papel_base: 'atendente' });
  
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const isAdmin = user?.papel === 'admin';
  const isGerente = user?.papel === 'gerente';
  const podeAcessar = isAdmin || isGerente;
  const podeEditar = isAdmin || isGerente; // Agora gerente também pode editar

  // Carregar permissões do papel do sistema selecionado
  const carregarPermissoes = React.useCallback(async () => {
    if (!podeAcessar) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/permissoes?papel=${papelSelecionado}`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) throw new Error('Erro ao carregar permissões');

      const data = await response.json();
      // Filtrar grupo "Empresas" se não for admin
      let perms = data.permissoes || [];
      if (!isAdmin) {
        perms = perms.filter((p: PermissaoCompleta) => p.recurso_codigo !== 'empresas');
      }
      setPermissoes(perms);
    } catch (error) {
      console.error('Erro:', error);
      setSnackbar({ open: true, message: 'Erro ao carregar permissões', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [papelSelecionado, podeAcessar, isAdmin]);

  // Carregar papéis customizados
  const carregarPapeisCustomizados = React.useCallback(async () => {
    if (!podeAcessar) return;
    
    try {
      const response = await fetch('/api/papeis-empresa', {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        setPapeisCustomizados(data.papeis || []);
      }
    } catch (error) {
      console.error('Erro ao carregar papéis customizados:', error);
    }
  }, [podeAcessar]);

  // Carregar permissões do papel customizado selecionado
  const carregarPermissoesCustomizadas = React.useCallback(async () => {
    if (!papelCustomizadoSelecionado) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/permissoes?papel_empresa_id=${papelCustomizadoSelecionado}`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) throw new Error('Erro ao carregar permissões');

      const data = await response.json();
      // Filtrar grupo "Empresas" - nunca aparece para papéis customizados
      const perms = (data.permissoes || []).filter((p: PermissaoCompleta) => p.recurso_codigo !== 'empresas');
      setPermissoesCustomizadas(perms);
    } catch (error) {
      console.error('Erro:', error);
      setSnackbar({ open: true, message: 'Erro ao carregar permissões', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [papelCustomizadoSelecionado]);

  React.useEffect(() => {
    if (podeAcessar) {
      carregarPermissoes();
      carregarPapeisCustomizados();
    }
  }, [carregarPermissoes, carregarPapeisCustomizados, podeAcessar]);

  React.useEffect(() => {
    if (papelCustomizadoSelecionado) {
      carregarPermissoesCustomizadas();
    }
  }, [papelCustomizadoSelecionado, carregarPermissoesCustomizadas]);

  // Alterar uma permissão
  const togglePermissao = (
    recursoId: number, 
    campo: 'pode_visualizar' | 'pode_criar' | 'pode_editar' | 'pode_excluir',
    isCustomizado: boolean
  ) => {
    const setFunc = isCustomizado ? setPermissoesCustomizadas : setPermissoes;
    
    setFunc((prev) =>
      prev.map((p) => {
        if (p.recurso_id === recursoId) {
          const novoValor = !p[campo];
          if (campo === 'pode_visualizar' && !novoValor) {
            return { ...p, pode_visualizar: false, pode_criar: false, pode_editar: false, pode_excluir: false, modificado: true };
          }
          if (campo !== 'pode_visualizar' && novoValor && !p.pode_visualizar) {
            return { ...p, [campo]: novoValor, pode_visualizar: true, modificado: true };
          }
          return { ...p, [campo]: novoValor, modificado: true };
        }
        return p;
      })
    );
  };

  // Salvar alterações
  const salvarPermissoes = async (isCustomizado: boolean) => {
    const perms = isCustomizado ? permissoesCustomizadas : permissoes;
    const modificadas = perms.filter((p) => p.modificado);
    
    if (modificadas.length === 0) {
      setSnackbar({ open: true, message: 'Nenhuma alteração para salvar', severity: 'info' });
      return;
    }

    setSaving(true);
    try {
      const body = isCustomizado 
        ? {
            papel_empresa_id: papelCustomizadoSelecionado,
            permissoes: modificadas.map((p) => ({
              recurso_id: p.recurso_id,
              pode_visualizar: p.pode_visualizar,
              pode_criar: p.pode_criar,
              pode_editar: p.pode_editar,
              pode_excluir: p.pode_excluir,
            })),
          }
        : {
            papel: papelSelecionado,
            permissoes: modificadas.map((p) => ({
              recurso_id: p.recurso_id,
              pode_visualizar: p.pode_visualizar,
              pode_criar: p.pode_criar,
              pode_editar: p.pode_editar,
              pode_excluir: p.pode_excluir,
            })),
          };

      const response = await fetch('/api/permissoes', {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao salvar permissões');
      }

      setSnackbar({ open: true, message: 'Permissões salvas com sucesso!', severity: 'success' });
      
      if (isCustomizado) {
        carregarPermissoesCustomizadas();
      } else {
        carregarPermissoes();
      }
    } catch (error) {
      console.error('Erro:', error);
      setSnackbar({ open: true, message: error instanceof Error ? error.message : 'Erro ao salvar permissões', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // Resetar para padrão
  const resetarPermissoes = async (isCustomizado: boolean) => {
    const label = isCustomizado 
      ? papeisCustomizados.find(p => p.id === papelCustomizadoSelecionado)?.nome 
      : papelSelecionado;
      
    if (!confirm(`Tem certeza que deseja resetar as permissões do papel "${label}" para o padrão?`)) {
      return;
    }

    setLoading(true);
    try {
      const body = isCustomizado 
        ? { acao: 'resetar', papel_empresa_id: papelCustomizadoSelecionado }
        : { acao: 'resetar', papel: papelSelecionado };

      const response = await fetch('/api/permissoes', {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error('Erro ao resetar permissões');

      setSnackbar({ open: true, message: 'Permissões resetadas para o padrão', severity: 'success' });
      
      if (isCustomizado) {
        carregarPermissoesCustomizadas();
      } else {
        carregarPermissoes();
      }
    } catch (error) {
      console.error('Erro:', error);
      setSnackbar({ open: true, message: 'Erro ao resetar permissões', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Criar papel customizado
  const criarPapelCustomizado = async () => {
    if (!novoPapel.codigo || !novoPapel.nome) {
      setSnackbar({ open: true, message: 'Código e nome são obrigatórios', severity: 'error' });
      return;
    }

    try {
      const response = await fetch('/api/papeis-empresa', {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(novoPapel),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao criar papel');
      }

      setSnackbar({ open: true, message: 'Papel criado com sucesso!', severity: 'success' });
      setDialogOpen(false);
      setNovoPapel({ codigo: '', nome: '', descricao: '', cor: 'default', papel_base: 'atendente' });
      carregarPapeisCustomizados();
    } catch (error) {
      console.error('Erro:', error);
      setSnackbar({ open: true, message: error instanceof Error ? error.message : 'Erro ao criar papel', severity: 'error' });
    }
  };

  // Excluir papel customizado
  const excluirPapelCustomizado = async (id: number) => {
    const papel = papeisCustomizados.find(p => p.id === id);
    if (!confirm(`Tem certeza que deseja excluir o papel "${papel?.nome}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/papeis-empresa?id=${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao excluir papel');
      }

      setSnackbar({ open: true, message: 'Papel excluído com sucesso!', severity: 'success' });
      if (papelCustomizadoSelecionado === id) {
        setPapelCustomizadoSelecionado(null);
        setPermissoesCustomizadas([]);
      }
      carregarPapeisCustomizados();
    } catch (error) {
      console.error('Erro:', error);
      setSnackbar({ open: true, message: error instanceof Error ? error.message : 'Erro ao excluir papel', severity: 'error' });
    }
  };

  // Agrupar permissões por grupo
  const agruparPermissoes = (perms: PermissaoEditavel[]) => {
    return perms.reduce(
      (acc, p) => {
        const grupo = p.recurso_grupo || 'Outros';
        if (!acc[grupo]) acc[grupo] = [];
        acc[grupo].push(p);
        return acc;
      },
      {} as Record<string, PermissaoEditavel[]>
    );
  };

  const permissoesPorGrupo = React.useMemo(() => agruparPermissoes(permissoes), [permissoes]);
  const permissoesCustomizadasPorGrupo = React.useMemo(() => agruparPermissoes(permissoesCustomizadas), [permissoesCustomizadas]);

  const temAlteracoes = permissoes.some((p) => p.modificado);
  const temAlteracoesCustomizadas = permissoesCustomizadas.some((p) => p.modificado);

  // Loading state
  if (userLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Verificar acesso
  if (!podeAcessar) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Acesso negado. Apenas administradores e gerentes podem gerenciar permissões.
        </Alert>
      </Box>
    );
  }

  // Renderizar tabela de permissões
  const renderTabelaPermissoes = (perms: Record<string, PermissaoEditavel[]>, isCustomizado: boolean) => (
    <>
      {Object.entries(perms).map(([grupo, items]) => (
        <Card key={grupo} sx={{ mb: 2 }}>
          <CardHeader
            title={grupo}
            subheader={`${items.length} recursos neste grupo`}
          />
          <Divider />
          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ minWidth: 200 }}>Recurso</TableCell>
                  <TableCell align="center" sx={{ width: 90 }}>Ver</TableCell>
                  <TableCell align="center" sx={{ width: 90 }}>Criar</TableCell>
                  <TableCell align="center" sx={{ width: 90 }}>Editar</TableCell>
                  <TableCell align="center" sx={{ width: 90 }}>Excluir</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((p) => (
                  <TableRow
                    key={p.recurso_id}
                    sx={{
                      bgcolor: p.modificado ? 'action.selected' : 'inherit',
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                  >
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body2" fontWeight="medium">
                          {p.recurso_nome}
                        </Typography>
                        {p.modificado && (
                          <Chip label="*" size="small" color="warning" variant="outlined" />
                        )}
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        {p.recurso_rota}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Checkbox
                        size="small"
                        checked={p.pode_visualizar}
                        onChange={() => togglePermissao(p.recurso_id, 'pode_visualizar', isCustomizado)}
                        disabled={!podeEditar}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Checkbox
                        size="small"
                        checked={p.pode_criar}
                        onChange={() => togglePermissao(p.recurso_id, 'pode_criar', isCustomizado)}
                        disabled={!p.pode_visualizar || !podeEditar}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Checkbox
                        size="small"
                        checked={p.pode_editar}
                        onChange={() => togglePermissao(p.recurso_id, 'pode_editar', isCustomizado)}
                        disabled={!p.pode_visualizar || !podeEditar}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Checkbox
                        size="small"
                        checked={p.pode_excluir}
                        onChange={() => togglePermissao(p.recurso_id, 'pode_excluir', isCustomizado)}
                        disabled={!p.pode_visualizar || !podeEditar}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </Card>
      ))}
    </>
  );

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <div>
          <Typography variant="h4">Gerenciar Permissões</Typography>
          <Typography color="text.secondary" variant="body2">
            Configure o que cada tipo de usuário pode fazer no sistema
          </Typography>
        </div>
      </Stack>

      <Card>
        <Tabs value={tabAtual} onChange={(_, v) => setTabAtual(v)}>
          <Tab label="Papéis do Sistema" />
          <Tab label="Papéis Customizados" />
        </Tabs>
      </Card>

      {/* Tab: Papéis do Sistema */}
      <TabPanel value={tabAtual} index={0}>
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Papel</InputLabel>
                <Select
                  value={papelSelecionado}
                  label="Papel"
                  onChange={(e) => setPapelSelecionado(e.target.value as PapelSistema)}
                >
                  {PAPEIS_SISTEMA.map((p) => (
                    <MenuItem key={p.value} value={p.value}>
                      <Chip label={p.label} size="small" color={p.cor} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={() => resetarPermissoes(false)}
                disabled={loading || saving || !podeEditar}
              >
                Resetar
              </Button>

              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={() => salvarPermissoes(false)}
                disabled={loading || saving || !temAlteracoes || !podeEditar}
              >
                {saving ? 'Salvando...' : 'Salvar'}
              </Button>

              {temAlteracoes && (
                <Chip label="Alterações não salvas" color="warning" size="small" />
              )}
            </Stack>
          </CardContent>
        </Card>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          renderTabelaPermissoes(permissoesPorGrupo, false)
        )}
      </TabPanel>

      {/* Tab: Papéis Customizados */}
      <TabPanel value={tabAtual} index={1}>
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Papel Customizado</InputLabel>
                <Select
                  value={papelCustomizadoSelecionado || ''}
                  label="Papel Customizado"
                  onChange={(e) => setPapelCustomizadoSelecionado(e.target.value as number)}
                  displayEmpty
                >
                  <MenuItem value="" disabled>
                    <em>Selecione um papel</em>
                  </MenuItem>
                  {papeisCustomizados.map((p) => (
                    <MenuItem key={p.id} value={p.id}>
                      <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" width="100%">
                        <Typography>{p.nome}</Typography>
                        <Stack direction="row" spacing={0.5}>
                          <IconButton 
                            size="small" 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              excluirPapelCustomizado(p.id); 
                            }}
                          >
                            <TrashIcon size={16} />
                          </IconButton>
                        </Stack>
                      </Stack>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button
                variant="outlined"
                startIcon={<PlusIcon />}
                onClick={() => {
                  setDialogMode('criar');
                  setNovoPapel({ codigo: '', nome: '', descricao: '', cor: 'default', papel_base: 'atendente' });
                  setDialogOpen(true);
                }}
              >
                Novo Papel
              </Button>

              {papelCustomizadoSelecionado && (
                <>
                  <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={() => resetarPermissoes(true)}
                    disabled={loading || saving || !podeEditar}
                  >
                    Resetar
                  </Button>

                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={() => salvarPermissoes(true)}
                    disabled={loading || saving || !temAlteracoesCustomizadas || !podeEditar}
                  >
                    {saving ? 'Salvando...' : 'Salvar'}
                  </Button>

                  {temAlteracoesCustomizadas && (
                    <Chip label="Alterações não salvas" color="warning" size="small" />
                  )}
                </>
              )}
            </Stack>
          </CardContent>
        </Card>

        {papeisCustomizados.length === 0 ? (
          <Alert severity="info">
            Nenhum papel customizado criado ainda. Clique em &quot;Novo Papel&quot; para criar um.
          </Alert>
        ) : !papelCustomizadoSelecionado ? (
          <Alert severity="info">
            Selecione um papel customizado para configurar suas permissões.
          </Alert>
        ) : loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          renderTabelaPermissoes(permissoesCustomizadasPorGrupo, true)
        )}
      </TabPanel>

      {/* Dialog para criar papel */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogMode === 'criar' ? 'Criar Novo Papel' : 'Editar Papel'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Código"
              value={novoPapel.codigo}
              onChange={(e) => setNovoPapel({ ...novoPapel, codigo: e.target.value.toLowerCase().replace(/\s/g, '_') })}
              placeholder="Ex: supervisor, caixa"
              helperText="Identificador único (sem espaços)"
              fullWidth
            />
            <TextField
              label="Nome"
              value={novoPapel.nome}
              onChange={(e) => setNovoPapel({ ...novoPapel, nome: e.target.value })}
              placeholder="Ex: Supervisor de Loja"
              fullWidth
            />
            <TextField
              label="Descrição"
              value={novoPapel.descricao}
              onChange={(e) => setNovoPapel({ ...novoPapel, descricao: e.target.value })}
              placeholder="Descrição das responsabilidades"
              multiline
              rows={2}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Baseado em</InputLabel>
              <Select
                value={novoPapel.papel_base}
                label="Baseado em"
                onChange={(e) => setNovoPapel({ ...novoPapel, papel_base: e.target.value })}
              >
                <MenuItem value="gerente">Gerente (mais permissões)</MenuItem>
                <MenuItem value="profissional">Profissional</MenuItem>
                <MenuItem value="atendente">Atendente (menos permissões)</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Cor</InputLabel>
              <Select
                value={novoPapel.cor}
                label="Cor"
                onChange={(e) => setNovoPapel({ ...novoPapel, cor: e.target.value })}
              >
                <MenuItem value="default">Padrão</MenuItem>
                <MenuItem value="primary">Azul</MenuItem>
                <MenuItem value="secondary">Roxo</MenuItem>
                <MenuItem value="success">Verde</MenuItem>
                <MenuItem value="warning">Amarelo</MenuItem>
                <MenuItem value="error">Vermelho</MenuItem>
                <MenuItem value="info">Ciano</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={criarPapelCustomizado}>
            {dialogMode === 'criar' ? 'Criar' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Stack>
  );
}
