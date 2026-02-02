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
import { CalendarCheck, Info, Warning, WhatsappLogo, Clock, CheckCircle } from '@phosphor-icons/react/dist/ssr';

export const metadata = {
  title: 'Agendamentos | SyncCore Docs',
};

const campos = [
  {
    campo: 'Cliente',
    tipo: 'Seleção',
    obrigatorio: true,
    descricao: 'O cliente que será atendido. Pode buscar por nome ou telefone.',
  },
  {
    campo: 'Serviço',
    tipo: 'Seleção',
    obrigatorio: true,
    descricao: 'O serviço a ser realizado.',
  },
  {
    campo: 'Profissional',
    tipo: 'Seleção',
    obrigatorio: true,
    descricao: 'O profissional que realizará o serviço. Mostra apenas os que realizam o serviço selecionado.',
  },
  {
    campo: 'Data',
    tipo: 'Data',
    obrigatorio: true,
    descricao: 'Data do agendamento. Mostra apenas dias em que o profissional trabalha.',
  },
  {
    campo: 'Horário',
    tipo: 'Hora',
    obrigatorio: true,
    descricao: 'Horário do agendamento. Mostra apenas horários disponíveis.',
  },
  {
    campo: 'Observações',
    tipo: 'Texto',
    obrigatorio: false,
    descricao: 'Anotações sobre o agendamento (ex: "trazer referência de corte").',
  },
  {
    campo: 'Status',
    tipo: 'Seleção',
    obrigatorio: true,
    descricao: 'Estado atual do agendamento: Pendente, Confirmado, Em Atendimento, Concluído, Cancelado, No-Show.',
  },
];

const statusList = [
  { status: 'Pendente', cor: '#ff9800', descricao: 'Agendamento criado, aguardando confirmação do cliente ou empresa.' },
  { status: 'Confirmado', cor: '#2196f3', descricao: 'Cliente confirmou presença ou empresa validou o agendamento.' },
  { status: 'Em Atendimento', cor: '#9c27b0', descricao: 'O serviço está sendo realizado neste momento.' },
  { status: 'Concluído', cor: '#4caf50', descricao: 'Serviço finalizado com sucesso.' },
  { status: 'Cancelado', cor: '#f44336', descricao: 'Agendamento cancelado pelo cliente ou empresa.' },
  { status: 'No-Show', cor: '#757575', descricao: 'Cliente não compareceu ao agendamento.' },
];

export default function AgendamentosPage() {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <CalendarCheck size={32} color="#9c27b0" />
        <Typography variant="h4" fontWeight={700}>
          Agendamentos
        </Typography>
        <Chip label="SERVIÇO" size="small" sx={{ bgcolor: '#9c27b0', color: 'white' }} />
        <Chip label="AMBOS" size="small" sx={{ bgcolor: '#ed6c02', color: 'white' }} />
      </Box>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 800 }}>
        O módulo de Agendamentos é onde você gerencia toda a agenda de serviços. 
        Visualize, crie, confirme, remarque ou cancele agendamentos. 
        Agendamentos também podem ser criados automaticamente via WhatsApp.
      </Typography>

      {/* Acesso */}
      <Card variant="outlined" sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            📍 Como Acessar
          </Typography>
          <Typography variant="body1">
            Menu lateral → <strong>Serviços & Agenda</strong> → <strong>Agenda</strong> → <strong>Agendamentos</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            <strong>Disponível em:</strong> Empresas com modelo "Serviço" ou "Ambos".
          </Typography>
        </CardContent>
      </Card>

      {/* Visualizações */}
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
        Tela Principal (Lista)
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 2 }}>
        A tela oferece diferentes visualizações e filtros:
      </Typography>

      <Box component="ul" sx={{ mb: 3 }}>
        <li><strong>Filtrar por data:</strong> Veja agendamentos de um dia ou período específico</li>
        <li><strong>Filtrar por profissional:</strong> Veja apenas agendamentos de um profissional</li>
        <li><strong>Filtrar por status:</strong> Pendentes, confirmados, concluídos, etc.</li>
        <li><strong>Buscar cliente:</strong> Encontre agendamentos de um cliente específico</li>
        <li><strong>Novo agendamento:</strong> Crie um agendamento manualmente</li>
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

      {/* Status */}
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <CheckCircle size={24} />
        Status do Agendamento
      </Typography>

      <Typography variant="body1" sx={{ mb: 3 }}>
        O ciclo de vida de um agendamento passa pelos seguintes status:
      </Typography>

      <TableContainer component={Paper} variant="outlined" sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'action.hover' }}>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Descrição</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {statusList.map((s) => (
              <TableRow key={s.status}>
                <TableCell>
                  <Chip 
                    label={s.status} 
                    size="small" 
                    sx={{ bgcolor: s.cor, color: 'white', fontWeight: 600 }}
                  />
                </TableCell>
                <TableCell>{s.descricao}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Fluxo típico:</strong> Pendente → Confirmado → Em Atendimento → Concluído
        </Typography>
      </Alert>

      <Divider sx={{ my: 4 }} />

      {/* Como Funciona a Criação */}
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
        Como Criar um Agendamento
      </Typography>

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            Passo a passo:
          </Typography>
          <Box component="ol" sx={{ m: 0, pl: 2.5 }}>
            <li>Clique em "Novo Agendamento"</li>
            <li>Selecione ou cadastre o cliente</li>
            <li>Escolha o serviço desejado</li>
            <li>Selecione o profissional (apenas os que realizam o serviço)</li>
            <li>Escolha a data (mostra apenas dias que o profissional trabalha)</li>
            <li>Selecione o horário disponível</li>
            <li>Adicione observações se necessário</li>
            <li>Salve o agendamento</li>
          </Box>
        </CardContent>
      </Card>

      <Alert severity="info" icon={<Clock size={20} />} sx={{ mb: 3 }}>
        <Typography variant="body2">
          O sistema calcula automaticamente os horários disponíveis baseado no expediente, 
          bloqueios, outros agendamentos e duração do serviço.
        </Typography>
      </Alert>

      <Divider sx={{ my: 4 }} />

      {/* Via WhatsApp */}
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <WhatsappLogo size={24} color="#25d366" />
        Agendamentos via WhatsApp
      </Typography>

      <Typography variant="body1" sx={{ mb: 2 }}>
        Com a integração WhatsApp configurada, clientes podem agendar por mensagem:
      </Typography>

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Box component="ol" sx={{ m: 0, pl: 2.5 }}>
            <li>Cliente envia mensagem pedindo agendamento</li>
            <li>IA identifica o serviço e preferências</li>
            <li>IA consulta disponibilidade e oferece opções</li>
            <li>Cliente escolhe data e horário</li>
            <li>IA confirma e cria o agendamento automaticamente</li>
            <li>Agendamento aparece no sistema com status "Confirmado"</li>
          </Box>
        </CardContent>
      </Card>

      <Alert severity="success" sx={{ mb: 3 }}>
        <Typography variant="body2">
          Agendamentos via WhatsApp já são considerados confirmados, 
          pois o cliente interagiu ativamente para agendar.
        </Typography>
      </Alert>

      <Divider sx={{ my: 4 }} />

      {/* Remarcar e Cancelar */}
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
        Remarcar e Cancelar
      </Typography>

      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            ✏️ Remarcar
          </Typography>
          <Typography variant="body2">
            Para alterar data/hora de um agendamento, edite-o e selecione novos valores. 
            O sistema validará a disponibilidade no novo horário. Agendamentos já iniciados 
            ou concluídos não podem ser remarcados.
          </Typography>
        </CardContent>
      </Card>

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            ❌ Cancelar
          </Typography>
          <Typography variant="body2">
            Mude o status para "Cancelado". O horário voltará a ficar disponível. 
            Se o cliente cancelar fora do tempo limite configurado na empresa, 
            você pode registrar como "No-Show" para histórico.
          </Typography>
        </CardContent>
      </Card>

      <Alert severity="warning" icon={<Warning size={20} />} sx={{ mb: 3 }}>
        <Typography variant="body2">
          O <strong>Tempo Limite de Cancelamento</strong> configurado na empresa define 
          até quando o cliente pode cancelar. Fora desse prazo, considere como No-Show.
        </Typography>
      </Alert>

      <Divider sx={{ my: 4 }} />

      {/* Dicas e Avisos */}
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
        Dicas e Avisos
      </Typography>

      <Alert severity="warning" icon={<Warning size={20} />} sx={{ mb: 2 }}>
        <Typography variant="body2">
          <strong>Não é possível excluir</strong> agendamentos. Use o status "Cancelado" 
          para preservar o histórico.
        </Typography>
      </Alert>

      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2">
          Profissionais logados veem apenas seus próprios agendamentos. 
          Admins e gerentes veem todos.
        </Typography>
      </Alert>

      <Alert severity="success" sx={{ mb: 2 }}>
        <Typography variant="body2">
          <strong>Dica:</strong> Use as observações para guardar informações importantes, 
          como "cliente pediu corte mais curto" ou "trazer referência de cor".
        </Typography>
      </Alert>

      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2">
          O status "Em Atendimento" é útil para saber quem está sendo atendido agora. 
          Lembre-se de atualizar para "Concluído" ao terminar.
        </Typography>
      </Alert>
    </Box>
  );
}
