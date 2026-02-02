import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Shield, Info, Warning, CheckSquare, LockKey } from '@phosphor-icons/react/dist/ssr';

export const metadata = {
  title: 'Permissões | SyncCore Docs',
};

const recursos = [
  { recurso: 'empresas', descricao: 'Gerenciar empresas cadastradas' },
  { recurso: 'usuarios', descricao: 'Gerenciar usuários do sistema' },
  { recurso: 'clientes', descricao: 'Gerenciar cadastro de clientes' },
  { recurso: 'produtos', descricao: 'Gerenciar produtos e catálogo' },
  { recurso: 'pedidos', descricao: 'Visualizar e gerenciar pedidos' },
  { recurso: 'servicos', descricao: 'Gerenciar serviços oferecidos' },
  { recurso: 'profissionais', descricao: 'Gerenciar profissionais' },
  { recurso: 'agendamentos', descricao: 'Visualizar e gerenciar agenda' },
  { recurso: 'estoque', descricao: 'Controle de estoque' },
  { recurso: 'pagamentos', descricao: 'Registrar e gerenciar pagamentos' },
  { recurso: 'permissoes', descricao: 'Gerenciar permissões (somente admin)' },
];

const acoes = [
  { acao: 'Visualizar', descricao: 'Permite ver registros na listagem e detalhes' },
  { acao: 'Criar', descricao: 'Permite adicionar novos registros' },
  { acao: 'Editar', descricao: 'Permite alterar registros existentes' },
  { acao: 'Excluir', descricao: 'Permite remover registros (quando possível)' },
];

export default function PermissoesPage() {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Shield size={32} color="#667eea" />
        <Typography variant="h4" fontWeight={700}>
          Permissões
        </Typography>
        <Chip label="Configurações" size="small" />
      </Box>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 800 }}>
        O módulo de Permissões permite configurar o que cada papel pode fazer no sistema. 
        Configure acessos granulares para cada recurso do sistema.
      </Typography>

      {/* Acesso */}
      <Card variant="outlined" sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            📍 Como Acessar
          </Typography>
          <Typography variant="body1">
            Menu lateral → <strong>Configurações</strong> → <strong>Permissões</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            <strong>Permissão necessária:</strong> Apenas Administradores.
          </Typography>
        </CardContent>
      </Card>

      {/* Conceito */}
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
        Como Funciona
      </Typography>

      <Typography variant="body1" sx={{ mb: 2 }}>
        As permissões são organizadas em três níveis:
      </Typography>

      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          <Box sx={{ bgcolor: '#667eea', color: 'white', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>1</Box>
          <Box>
            <Typography variant="subtitle1" fontWeight={600}>Papel (Role)</Typography>
            <Typography variant="body2" color="text.secondary">
              Cada usuário tem um papel: Admin, Gerente, Atendente, Profissional, etc.
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          <Box sx={{ bgcolor: '#667eea', color: 'white', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>2</Box>
          <Box>
            <Typography variant="subtitle1" fontWeight={600}>Recurso</Typography>
            <Typography variant="body2" color="text.secondary">
              Cada módulo do sistema: Clientes, Produtos, Pedidos, Agendamentos, etc.
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          <Box sx={{ bgcolor: '#667eea', color: 'white', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>3</Box>
          <Box>
            <Typography variant="subtitle1" fontWeight={600}>Ação</Typography>
            <Typography variant="body2" color="text.secondary">
              O que pode fazer com o recurso: Visualizar, Criar, Editar, Excluir.
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <Divider sx={{ my: 4 }} />

      {/* Recursos */}
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <LockKey size={24} />
        Recursos Disponíveis
      </Typography>

      <TableContainer component={Paper} variant="outlined" sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'action.hover' }}>
              <TableCell><strong>Recurso</strong></TableCell>
              <TableCell><strong>Descrição</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {recursos.map((r) => (
              <TableRow key={r.recurso}>
                <TableCell sx={{ fontWeight: 500 }}>
                  <Chip label={r.recurso} size="small" variant="outlined" />
                </TableCell>
                <TableCell>{r.descricao}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Divider sx={{ my: 4 }} />

      {/* Ações */}
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <CheckSquare size={24} />
        Ações por Recurso
      </Typography>

      <TableContainer component={Paper} variant="outlined" sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'action.hover' }}>
              <TableCell><strong>Ação</strong></TableCell>
              <TableCell><strong>Descrição</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {acoes.map((a) => (
              <TableRow key={a.acao}>
                <TableCell sx={{ fontWeight: 500 }}>{a.acao}</TableCell>
                <TableCell>{a.descricao}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Divider sx={{ my: 4 }} />

      {/* Exemplo */}
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
        Exemplo de Configuração
      </Typography>

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            Papel: Atendente
          </Typography>
          <Box sx={{ fontFamily: 'monospace', fontSize: '0.85rem', bgcolor: 'grey.100', p: 2, borderRadius: 1 }}>
            <Box>✅ Clientes: Visualizar, Criar, Editar</Box>
            <Box>✅ Pedidos: Visualizar, Criar, Editar</Box>
            <Box>✅ Agendamentos: Visualizar, Criar, Editar</Box>
            <Box>❌ Produtos: Apenas Visualizar</Box>
            <Box>❌ Estoque: Sem acesso</Box>
            <Box>❌ Usuários: Sem acesso</Box>
            <Box>❌ Permissões: Sem acesso</Box>
          </Box>
        </CardContent>
      </Card>

      <Divider sx={{ my: 4 }} />

      {/* Tela de Configuração */}
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
        Tela de Configuração
      </Typography>

      <Typography variant="body1" sx={{ mb: 2 }}>
        Na tela de permissões você vê uma matriz:
      </Typography>

      <Box component="ul" sx={{ mb: 3 }}>
        <li><strong>Linhas:</strong> Recursos do sistema</li>
        <li><strong>Colunas:</strong> Ações (Visualizar, Criar, Editar, Excluir)</li>
        <li><strong>Checkboxes:</strong> Marque para permitir, desmarque para bloquear</li>
        <li><strong>Filtro por papel:</strong> Selecione qual papel está configurando</li>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Dicas */}
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
        Dicas e Avisos
      </Typography>

      <Alert severity="warning" icon={<Warning size={20} />} sx={{ mb: 2 }}>
        <Typography variant="body2">
          <strong>Cuidado ao configurar permissões de Admin.</strong> Remover acesso 
          a permissões pode impedir alterações futuras.
        </Typography>
      </Alert>

      <Alert severity="info" icon={<Info size={20} />} sx={{ mb: 2 }}>
        <Typography variant="body2">
          Alterações nas permissões são aplicadas imediatamente. O usuário precisa 
          fazer logout e login para ver as mudanças.
        </Typography>
      </Alert>

      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2">
          Os papéis são configurados por empresa em <strong>Papéis da Empresa</strong>. 
          Você pode criar papéis personalizados além dos padrões.
        </Typography>
      </Alert>

      <Alert severity="success" sx={{ mb: 2 }}>
        <Typography variant="body2">
          <strong>Dica:</strong> Comece com permissões mínimas e vá adicionando conforme 
          a necessidade. É mais seguro do que dar acesso total e depois restringir.
        </Typography>
      </Alert>
    </Box>
  );
}
