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
import { Clock, Info, Warning } from '@phosphor-icons/react/dist/ssr';

export const metadata = {
  title: 'Horários da Empresa | SyncCore Docs',
};

const campos = [
  {
    campo: 'Dia da Semana',
    tipo: 'Seleção',
    obrigatorio: true,
    descricao: 'Segunda, Terça, Quarta, Quinta, Sexta, Sábado ou Domingo.',
  },
  {
    campo: 'Abertura',
    tipo: 'Hora',
    obrigatorio: true,
    descricao: 'Horário de abertura no dia. Ex: 08:00',
  },
  {
    campo: 'Fechamento',
    tipo: 'Hora',
    obrigatorio: true,
    descricao: 'Horário de fechamento no dia. Ex: 18:00',
  },
  {
    campo: 'Fechado',
    tipo: 'Sim/Não',
    obrigatorio: false,
    descricao: 'Se marcado, a empresa está fechada neste dia.',
  },
];

export default function HorariosEmpresaPage() {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Clock size={32} color="#667eea" />
        <Typography variant="h4" fontWeight={700}>
          Horários da Empresa
        </Typography>
        <Chip label="Módulo Geral" size="small" />
      </Box>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 800 }}>
        Configure os dias e horários de funcionamento da empresa. Esses horários são 
        usados para validar agendamentos, informar clientes e limitar o expediente dos profissionais.
      </Typography>

      {/* Acesso */}
      <Card variant="outlined" sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            📍 Como Acessar
          </Typography>
          <Typography variant="body1">
            Menu lateral → <strong>Geral</strong> → <strong>Horários da Empresa</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            <strong>Permissão necessária:</strong> Administradores e Gerentes.
          </Typography>
        </CardContent>
      </Card>

      {/* Funcionalidades */}
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
        Tela Principal
      </Typography>
      
      <Box component="ul" sx={{ mb: 3 }}>
        <li><strong>Visão semanal:</strong> Veja os horários de todos os dias de uma vez</li>
        <li><strong>Editar dia:</strong> Clique no dia para alterar horários</li>
        <li><strong>Marcar como fechado:</strong> Indique que não funciona no dia</li>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Campos */}
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

      {/* Impacto */}
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
        Onde os Horários São Usados
      </Typography>

      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            📅 Agendamentos
          </Typography>
          <Typography variant="body2">
            Clientes só podem agendar em dias e horários que a empresa está aberta. 
            Se a empresa fecha às 18h, o último agendamento possível é antes desse horário.
          </Typography>
        </CardContent>
      </Card>

      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            👤 Expediente de Profissionais
          </Typography>
          <Typography variant="body2">
            O expediente dos profissionais é validado dentro do horário da empresa. 
            Um profissional não pode ter expediente que ultrapasse o horário de funcionamento.
          </Typography>
        </CardContent>
      </Card>

      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            🤖 Agente de IA (WhatsApp)
          </Typography>
          <Typography variant="body2">
            O agente informa aos clientes os horários de funcionamento e pode 
            avisar se a empresa está fechada no momento.
          </Typography>
        </CardContent>
      </Card>

      <Divider sx={{ my: 4 }} />

      {/* Exemplo */}
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
        Exemplo de Configuração
      </Typography>

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ fontFamily: 'monospace', fontSize: '0.85rem', bgcolor: 'grey.100', p: 2, borderRadius: 1 }}>
            <Box>Segunda a Sexta: 08:00 - 18:00</Box>
            <Box>Sábado: 08:00 - 12:00</Box>
            <Box>Domingo: Fechado</Box>
          </Box>
        </CardContent>
      </Card>

      <Divider sx={{ my: 4 }} />

      {/* Dicas */}
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
        Dicas e Avisos
      </Typography>

      <Alert severity="warning" icon={<Warning size={20} />} sx={{ mb: 2 }}>
        <Typography variant="body2">
          <strong>Alterar horários não afeta agendamentos existentes.</strong> Se você 
          mudar o fechamento de 18h para 16h, agendamentos das 17h continuam válidos.
        </Typography>
      </Alert>

      <Alert severity="info" icon={<Info size={20} />} sx={{ mb: 2 }}>
        <Typography variant="body2">
          Para fechar em um dia específico (feriado), use o módulo de bloqueios ou 
          altere temporariamente o horário do dia.
        </Typography>
      </Alert>

      <Alert severity="success" sx={{ mb: 2 }}>
        <Typography variant="body2">
          <strong>Dica:</strong> Configure os horários antes de cadastrar o expediente 
          dos profissionais para evitar conflitos.
        </Typography>
      </Alert>
    </Box>
  );
}
