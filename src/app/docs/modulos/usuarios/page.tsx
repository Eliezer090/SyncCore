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
import { Users, Info, Warning, Shield } from '@phosphor-icons/react/dist/ssr';

export const metadata = {
  title: 'Usuários | SyncCore Docs',
};

const campos = [
  {
    campo: 'Nome',
    tipo: 'Texto',
    obrigatorio: true,
    descricao: 'Nome completo do usuário. Será exibido no sistema e identificações.',
  },
  {
    campo: 'E-mail',
    tipo: 'E-mail',
    obrigatorio: true,
    descricao: 'E-mail para login e recuperação de senha. Deve ser único no sistema.',
  },
  {
    campo: 'Senha',
    tipo: 'Senha',
    obrigatorio: true,
    descricao: 'Senha de acesso. Mínimo de 6 caracteres. Não é visível após salvar.',
  },
  {
    campo: 'Empresa',
    tipo: 'Seleção',
    obrigatorio: true,
    descricao: 'Empresa à qual o usuário está vinculado. Define o acesso aos dados.',
  },
  {
    campo: 'Papel',
    tipo: 'Seleção',
    obrigatorio: true,
    descricao: 'Define o nível de acesso: Admin, Gerente, Atendente, Profissional, etc.',
  },
  {
    campo: 'Telefone',
    tipo: 'Texto',
    obrigatorio: false,
    descricao: 'Telefone de contato do usuário.',
  },
  {
    campo: 'Avatar',
    tipo: 'Imagem',
    obrigatorio: false,
    descricao: 'Foto de perfil do usuário. Exibida no menu e identificações.',
  },
  {
    campo: 'Ativo',
    tipo: 'Sim/Não',
    obrigatorio: true,
    descricao: 'Define se o usuário pode fazer login. Usuários inativos são bloqueados.',
  },
];

const papeis = [
  {
    papel: 'Admin',
    descricao: 'Acesso total ao sistema. Pode gerenciar empresas, usuários, permissões e todos os módulos.',
    menus: 'Todos',
  },
  {
    papel: 'Gerente',
    descricao: 'Acesso gerencial. Pode ver relatórios, gerenciar equipe e configurações da empresa.',
    menus: 'Maioria, exceto configurações de sistema',
  },
  {
    papel: 'Atendente',
    descricao: 'Acesso operacional. Pode atender clientes, registrar pedidos e agendamentos.',
    menus: 'Clientes, Pedidos, Agendamentos',
  },
  {
    papel: 'Profissional',
    descricao: 'Acesso restrito. Vê apenas sua própria agenda, expediente e serviços.',
    menus: 'Minha Agenda, Meu Expediente',
  },
  {
    papel: 'Cliente',
    descricao: 'Acesso de cliente (se habilitado portal). Vê seus próprios pedidos e agendamentos.',
    menus: 'Portal do Cliente',
  },
];

export default function UsuariosPage() {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Users size={32} color="#667eea" />
        <Typography variant="h4" fontWeight={700}>
          Usuários
        </Typography>
        <Chip label="Módulo Geral" size="small" />
      </Box>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 800 }}>
        O módulo de Usuários permite gerenciar quem pode acessar o sistema e com quais permissões. 
        Cada usuário pertence a uma empresa e possui um papel que define seus acessos.
      </Typography>

      {/* Acesso */}
      <Card variant="outlined" sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            📍 Como Acessar
          </Typography>
          <Typography variant="body1">
            Menu lateral → <strong>Configurações</strong> → <strong>Usuários</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            <strong>Permissão necessária:</strong> Administradores e Gerentes podem gerenciar usuários.
          </Typography>
        </CardContent>
      </Card>

      {/* Grid/Lista */}
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
        Tela Principal (Lista)
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 2 }}>
        A tela mostra todos os usuários da empresa. Funcionalidades:
      </Typography>

      <Box component="ul" sx={{ mb: 3 }}>
        <li><strong>Buscar:</strong> Filtre por nome ou e-mail</li>
        <li><strong>Filtrar por papel:</strong> Veja apenas usuários de um papel específico</li>
        <li><strong>Filtrar por status:</strong> Ativos ou inativos</li>
        <li><strong>Editar:</strong> Clique no usuário para editar seus dados</li>
        <li><strong>Resetar senha:</strong> Envie um e-mail de redefinição de senha</li>
        <li><strong>Desativar:</strong> Desative o acesso sem excluir o histórico</li>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Descrição dos campos */}
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
        Campos do Cadastro
      </Typography>

      <TableContainer component={Paper} variant="outlined" sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'action.hover' }}>
              <TableCell><strong>Campo</strong></TableCell>
              <TableCell><strong>Tipo</strong></TableCell>
              <TableCell><strong>Obrigatório</strong></TableCell>
              <TableCell><strong>Descrição</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {campos.map((campo) => (
              <TableRow key={campo.campo}>
                <TableCell sx={{ fontWeight: 500 }}>{campo.campo}</TableCell>
                <TableCell>{campo.tipo}</TableCell>
                <TableCell>
                  {campo.obrigatorio ? (
                    <Chip label="Sim" size="small" color="error" />
                  ) : (
                    <Chip label="Não" size="small" variant="outlined" />
                  )}
                </TableCell>
                <TableCell>{campo.descricao}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Divider sx={{ my: 4 }} />

      {/* Papéis */}
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Shield size={24} />
        Papéis e Permissões
      </Typography>

      <Typography variant="body1" sx={{ mb: 3 }}>
        O papel define o nível de acesso padrão do usuário. Permissões específicas podem ser 
        configuradas no módulo de Permissões.
      </Typography>

      <TableContainer component={Paper} variant="outlined" sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'action.hover' }}>
              <TableCell><strong>Papel</strong></TableCell>
              <TableCell><strong>Descrição</strong></TableCell>
              <TableCell><strong>Menus Padrão</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {papeis.map((p) => (
              <TableRow key={p.papel}>
                <TableCell sx={{ fontWeight: 500 }}>
                  <Chip label={p.papel} size="small" variant="outlined" />
                </TableCell>
                <TableCell>{p.descricao}</TableCell>
                <TableCell>{p.menus}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Alert severity="info" icon={<Info size={20} />} sx={{ mb: 3 }}>
        <Typography variant="body2">
          Os papéis mostrados são os padrões do sistema. Você pode criar papéis 
          personalizados em <strong>Configurações → Papéis da Empresa</strong>.
        </Typography>
      </Alert>

      <Divider sx={{ my: 4 }} />

      {/* Usuário como Profissional */}
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
        Usuário como Profissional
      </Typography>

      <Typography variant="body1" sx={{ mb: 2 }}>
        Para que um usuário apareça como profissional disponível para agendamentos:
      </Typography>

      <Box component="ol" sx={{ mb: 3 }}>
        <li>Crie o usuário com o papel <strong>"Profissional"</strong></li>
        <li>Ele aparecerá automaticamente na lista de profissionais</li>
        <li>Configure seu <strong>expediente</strong> em Serviços → Expediente</li>
        <li>Vincule os <strong>serviços</strong> que ele realiza em Serviços → Serviços do Prof.</li>
        <li>Pronto! Ele estará disponível para agendamentos</li>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Dicas e Avisos */}
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
        Dicas e Avisos
      </Typography>

      <Alert severity="warning" icon={<Warning size={20} />} sx={{ mb: 2 }}>
        <Typography variant="body2">
          <strong>E-mail deve ser único:</strong> Não é possível ter dois usuários com o 
          mesmo e-mail, mesmo em empresas diferentes.
        </Typography>
      </Alert>

      <Alert severity="warning" icon={<Warning size={20} />} sx={{ mb: 2 }}>
        <Typography variant="body2">
          <strong>Não é possível excluir</strong> um usuário que já fez operações no sistema 
          (criou pedidos, agendamentos, etc.). Neste caso, apenas desative-o.
        </Typography>
      </Alert>

      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2">
          Para alterar a própria senha, o usuário deve acessar <strong>Minha Conta</strong> 
          no menu superior direito.
        </Typography>
      </Alert>

      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2">
          Ao criar um usuário como <strong>Profissional</strong>, configure também seu 
          expediente e serviços para que ele apareça disponível na agenda.
        </Typography>
      </Alert>
    </Box>
  );
}
