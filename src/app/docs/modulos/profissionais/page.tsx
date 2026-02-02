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
import { UserCircle, Info, Warning, Scissors, Clock } from '@phosphor-icons/react/dist/ssr';

export const metadata = {
  title: 'Profissionais | SyncCore Docs',
};

const campos = [
  {
    campo: 'Nome',
    tipo: 'Texto',
    obrigatorio: true,
    descricao: 'Nome do profissional. Será exibido na agenda e para clientes.',
  },
  {
    campo: 'E-mail',
    tipo: 'E-mail',
    obrigatorio: true,
    descricao: 'E-mail para login. O profissional poderá acessar sua própria agenda.',
  },
  {
    campo: 'Senha',
    tipo: 'Senha',
    obrigatorio: true,
    descricao: 'Senha de acesso. Mínimo 6 caracteres.',
  },
  {
    campo: 'Telefone',
    tipo: 'Texto',
    obrigatorio: false,
    descricao: 'Telefone de contato do profissional.',
  },
  {
    campo: 'Avatar',
    tipo: 'Imagem',
    obrigatorio: false,
    descricao: 'Foto do profissional. Exibida no sistema e pode ser usada pelo cliente.',
  },
  {
    campo: 'Ativo',
    tipo: 'Sim/Não',
    obrigatorio: true,
    descricao: 'Profissionais inativos não aparecem na agenda mas mantêm o histórico.',
  },
];

export default function ProfissionaisPage() {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <UserCircle size={32} color="#9c27b0" />
        <Typography variant="h4" fontWeight={700}>
          Profissionais
        </Typography>
        <Chip label="SERVIÇO" size="small" sx={{ bgcolor: '#9c27b0', color: 'white' }} />
        <Chip label="AMBOS" size="small" sx={{ bgcolor: '#ed6c02', color: 'white' }} />
      </Box>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 800 }}>
        Profissionais são os membros da equipe que realizam os serviços agendados. 
        Cada profissional é um usuário do sistema com papel "Profissional" e pode 
        ter seu próprio login para ver sua agenda.
      </Typography>

      {/* Acesso */}
      <Card variant="outlined" sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            📍 Como Acessar
          </Typography>
          <Typography variant="body1">
            Menu lateral → <strong>Serviços & Agenda</strong> → <strong>Profissionais</strong> → <strong>Profissionais</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            <strong>Disponível em:</strong> Empresas com modelo "Serviço" ou "Ambos".
          </Typography>
        </CardContent>
      </Card>

      {/* Conceito */}
      <Alert severity="info" icon={<Info size={20} />} sx={{ mb: 4 }}>
        <Typography variant="body2">
          <strong>Importante:</strong> Profissionais são usuários do sistema com papel "Profissional". 
          Ao criar um usuário com este papel, ele automaticamente aparece na lista de profissionais 
          disponíveis para agendamentos.
        </Typography>
      </Alert>

      {/* Grid/Lista */}
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
        Tela Principal (Lista)
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 2 }}>
        A tela mostra todos os profissionais da empresa. Funcionalidades:
      </Typography>

      <Box component="ul" sx={{ mb: 3 }}>
        <li><strong>Buscar:</strong> Filtre por nome</li>
        <li><strong>Filtrar por status:</strong> Ativos ou inativos</li>
        <li><strong>Ver agenda:</strong> Veja os agendamentos do profissional</li>
        <li><strong>Editar:</strong> Altere dados do profissional</li>
        <li><strong>Ver serviços:</strong> Veja quais serviços ele realiza</li>
        <li><strong>Ver expediente:</strong> Veja os horários de trabalho</li>
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

      {/* Configurações Necessárias */}
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
        Configurações Necessárias
      </Typography>

      <Typography variant="body1" sx={{ mb: 2 }}>
        Para que um profissional esteja disponível para agendamentos, você precisa:
      </Typography>

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Box component="ol" sx={{ m: 0, pl: 2.5 }}>
            <li>
              <strong>Cadastrar o profissional</strong> (criar usuário com papel Profissional)
            </li>
            <li>
              <strong>Configurar expediente</strong> (definir dias e horários de trabalho)
              <br />
              <Typography variant="caption" color="text.secondary">
                Acesse: Profissionais → Expediente
              </Typography>
            </li>
            <li>
              <strong>Vincular serviços</strong> (definir quais serviços ele realiza)
              <br />
              <Typography variant="caption" color="text.secondary">
                Acesse: Profissionais → Serviços do Prof.
              </Typography>
            </li>
          </Box>
        </CardContent>
      </Card>

      <Alert severity="warning" icon={<Warning size={20} />} sx={{ mb: 3 }}>
        <Typography variant="body2">
          Um profissional <strong>sem expediente configurado</strong> ou <strong>sem serviços vinculados</strong> 
          não aparecerá como disponível para agendamentos.
        </Typography>
      </Alert>

      <Divider sx={{ my: 4 }} />

      {/* Visão do Profissional */}
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <UserCircle size={24} />
        Visão do Profissional
      </Typography>

      <Typography variant="body1" sx={{ mb: 2 }}>
        Quando um profissional faz login com suas credenciais, ele tem acesso limitado:
      </Typography>

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            O profissional pode ver:
          </Typography>
          <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
            <li>Seus próprios agendamentos do dia/semana</li>
            <li>Detalhes dos clientes agendados</li>
            <li>Seu expediente configurado</li>
            <li>Seus bloqueios cadastrados</li>
            <li>Os serviços que ele realiza com preços</li>
          </Box>
        </CardContent>
      </Card>

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            O profissional NÃO pode ver:
          </Typography>
          <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
            <li>Agendamentos de outros profissionais</li>
            <li>Dados financeiros gerais da empresa</li>
            <li>Cadastro de outros funcionários</li>
            <li>Configurações administrativas</li>
          </Box>
        </CardContent>
      </Card>

      <Divider sx={{ my: 4 }} />

      {/* Módulos Relacionados */}
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
        Módulos Relacionados
      </Typography>

      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Scissors size={24} color="#9c27b0" />
          <Box>
            <Typography variant="subtitle2" fontWeight={600}>Serviços do Profissional</Typography>
            <Typography variant="body2" color="text.secondary">
              Define quais serviços cada profissional realiza, com duração e preço específicos.
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Clock size={24} color="#9c27b0" />
          <Box>
            <Typography variant="subtitle2" fontWeight={600}>Expediente</Typography>
            <Typography variant="body2" color="text.secondary">
              Define os dias e horários de trabalho de cada profissional.
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <Divider sx={{ my: 4 }} />

      {/* Dicas e Avisos */}
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
        Dicas e Avisos
      </Typography>

      <Alert severity="warning" icon={<Warning size={20} />} sx={{ mb: 2 }}>
        <Typography variant="body2">
          <strong>Não é possível excluir</strong> um profissional que já tem agendamentos. 
          Neste caso, desative-o para preservar o histórico.
        </Typography>
      </Alert>

      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2">
          Ao desativar um profissional, agendamentos futuros dele continuam válidos. 
          Se necessário, remarque ou cancele manualmente.
        </Typography>
      </Alert>

      <Alert severity="success" sx={{ mb: 2 }}>
        <Typography variant="body2">
          <strong>Dica:</strong> Adicione uma foto do profissional. Isso ajuda os clientes 
          a reconhecerem quem irá atendê-los, especialmente em salões com vários profissionais.
        </Typography>
      </Alert>
    </Box>
  );
}
