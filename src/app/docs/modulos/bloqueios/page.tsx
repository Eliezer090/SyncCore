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
import { Prohibit, Info, Warning, Calendar, ArrowsClockwise } from '@phosphor-icons/react/dist/ssr';

export const metadata = {
  title: 'Bloqueios do Profissional | SyncCore Docs',
};

const campos = [
  {
    campo: 'Profissional',
    tipo: 'Seleção',
    obrigatorio: true,
    descricao: 'O profissional que terá o período bloqueado.',
  },
  {
    campo: 'Data/Hora Início',
    tipo: 'Data e Hora',
    obrigatorio: true,
    descricao: 'Quando começa o período de indisponibilidade. Ex: 15/01/2025 às 09:00',
  },
  {
    campo: 'Data/Hora Fim',
    tipo: 'Data e Hora',
    obrigatorio: true,
    descricao: 'Quando termina o período de indisponibilidade. Ex: 15/01/2025 às 12:00',
  },
  {
    campo: 'Motivo',
    tipo: 'Texto',
    obrigatorio: false,
    descricao: 'Descrição do motivo do bloqueio. Ex: "Férias", "Consulta médica", "Curso".',
  },
  {
    campo: 'Recorrente',
    tipo: 'Sim/Não',
    obrigatorio: false,
    descricao: 'Se marcado, o bloqueio se repete semanalmente no mesmo dia e horário.',
  },
  {
    campo: 'Ativo',
    tipo: 'Sim/Não',
    obrigatorio: true,
    descricao: 'Bloqueios inativos são ignorados pelo sistema.',
  },
];

export default function BloqueiosPage() {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Prohibit size={32} color="#9c27b0" />
        <Typography variant="h4" fontWeight={700}>
          Bloqueios do Profissional
        </Typography>
        <Chip label="SERVIÇO" size="small" sx={{ bgcolor: '#9c27b0', color: 'white' }} />
        <Chip label="AMBOS" size="small" sx={{ bgcolor: '#ed6c02', color: 'white' }} />
      </Box>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 800 }}>
        Bloqueios são períodos em que o profissional não está disponível para atendimento, 
        mesmo dentro do seu expediente normal. Use para férias, folgas, consultas médicas, 
        cursos e outras indisponibilidades.
      </Typography>

      {/* Acesso */}
      <Card variant="outlined" sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            📍 Como Acessar
          </Typography>
          <Typography variant="body1">
            Menu lateral → <strong>Serviços & Agenda</strong> → <strong>Profissionais</strong> → <strong>Bloqueios</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            <strong>Disponível em:</strong> Empresas com modelo "Serviço" ou "Ambos".
          </Typography>
        </CardContent>
      </Card>

      {/* Diferença de Expediente */}
      <Alert severity="info" icon={<Info size={20} />} sx={{ mb: 4 }}>
        <Typography variant="body2">
          <strong>Diferença do Expediente:</strong> O expediente define os horários fixos de trabalho. 
          Bloqueios são exceções pontuais ou recorrentes dentro desses horários.
        </Typography>
      </Alert>

      {/* Grid/Lista */}
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
        Tela Principal (Lista)
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 2 }}>
        A tela mostra todos os bloqueios cadastrados. Funcionalidades:
      </Typography>

      <Box component="ul" sx={{ mb: 3 }}>
        <li><strong>Filtrar por profissional:</strong> Veja bloqueios de um profissional específico</li>
        <li><strong>Filtrar por data:</strong> Veja bloqueios de um período</li>
        <li><strong>Novo bloqueio:</strong> Adicione um período de indisponibilidade</li>
        <li><strong>Editar:</strong> Altere datas, horários ou motivo</li>
        <li><strong>Desativar:</strong> Cancele o bloqueio sem excluí-lo</li>
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

      {/* Casos de Uso */}
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
        Casos de Uso
      </Typography>

      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            🏖️ Férias
          </Typography>
          <Typography variant="body2">
            <strong>Início:</strong> 01/02/2025 00:00<br />
            <strong>Fim:</strong> 15/02/2025 23:59<br />
            <strong>Motivo:</strong> Férias<br />
            <strong>Recorrente:</strong> Não
          </Typography>
        </CardContent>
      </Card>

      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            🏥 Consulta Médica
          </Typography>
          <Typography variant="body2">
            <strong>Início:</strong> 20/01/2025 14:00<br />
            <strong>Fim:</strong> 20/01/2025 16:00<br />
            <strong>Motivo:</strong> Consulta médica<br />
            <strong>Recorrente:</strong> Não
          </Typography>
        </CardContent>
      </Card>

      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            📚 Curso Semanal
          </Typography>
          <Typography variant="body2">
            <strong>Início:</strong> Quarta-feira 14:00<br />
            <strong>Fim:</strong> Quarta-feira 18:00<br />
            <strong>Motivo:</strong> Curso de especialização<br />
            <strong>Recorrente:</strong> Sim (toda quarta-feira)
          </Typography>
        </CardContent>
      </Card>

      <Divider sx={{ my: 4 }} />

      {/* Bloqueios Recorrentes */}
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <ArrowsClockwise size={24} />
        Bloqueios Recorrentes
      </Typography>

      <Typography variant="body1" sx={{ mb: 2 }}>
        Bloqueios recorrentes se repetem automaticamente toda semana:
      </Typography>

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
            <li>Útil para compromissos fixos (faculdade, curso, outro emprego)</li>
            <li>O sistema gera automaticamente os bloqueios futuros</li>
            <li>Ao desativar, para de gerar novos bloqueios</li>
            <li>Bloqueios já gerados não são afetados pela desativação</li>
          </Box>
        </CardContent>
      </Card>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Exemplo:</strong> Bloqueio recorrente toda segunda das 08:00 às 12:00. 
          O sistema criará automaticamente esse bloqueio para todas as segundas-feiras futuras.
        </Typography>
      </Alert>

      <Divider sx={{ my: 4 }} />

      {/* Impacto nos Agendamentos */}
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Calendar size={24} />
        Impacto nos Agendamentos
      </Typography>

      <Typography variant="body1" sx={{ mb: 2 }}>
        Bloqueios afetam a disponibilidade de horários:
      </Typography>

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            <strong>Ao criar um bloqueio:</strong>
          </Typography>
          <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
            <li>Novos agendamentos não podem ser feitos no período bloqueado</li>
            <li>Agendamentos existentes no período <strong>não são cancelados automaticamente</strong></li>
            <li>O sistema avisa se há agendamentos conflitantes</li>
          </Box>
        </CardContent>
      </Card>

      <Alert severity="warning" icon={<Warning size={20} />} sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Atenção:</strong> Se você criar um bloqueio em um período que já tem agendamentos, 
          eles continuarão existindo. Você deve remarcar ou cancelar manualmente.
        </Typography>
      </Alert>

      <Divider sx={{ my: 4 }} />

      {/* Dicas e Avisos */}
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
        Dicas e Avisos
      </Typography>

      <Alert severity="success" sx={{ mb: 2 }}>
        <Typography variant="body2">
          <strong>Dica:</strong> Cadastre férias e folgas com antecedência para que o sistema 
          já impeça novos agendamentos nesses períodos.
        </Typography>
      </Alert>

      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2">
          O profissional pode ver seus próprios bloqueios fazendo login no sistema.
        </Typography>
      </Alert>

      <Alert severity="warning" sx={{ mb: 2 }}>
        <Typography variant="body2">
          Bloqueios são verificados apenas dentro do expediente. Se o profissional 
          não trabalha num dia, não precisa criar bloqueio.
        </Typography>
      </Alert>

      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2">
          Use o campo <strong>Motivo</strong> para documentar a razão do bloqueio. 
          Isso ajuda no gerenciamento da equipe.
        </Typography>
      </Alert>
    </Box>
  );
}
