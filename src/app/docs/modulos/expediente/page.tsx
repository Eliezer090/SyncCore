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
import { Clock, Info, Warning, CalendarCheck } from '@phosphor-icons/react/dist/ssr';

export const metadata = {
  title: 'Expediente do Profissional | SyncCore Docs',
};

const campos = [
  {
    campo: 'Profissional',
    tipo: 'Seleção',
    obrigatorio: true,
    descricao: 'O profissional para o qual o expediente será configurado.',
  },
  {
    campo: 'Segunda - Início Manhã',
    tipo: 'Hora',
    obrigatorio: false,
    descricao: 'Horário de início do expediente na segunda-feira (manhã). Ex: 09:00',
  },
  {
    campo: 'Segunda - Fim Manhã',
    tipo: 'Hora',
    obrigatorio: false,
    descricao: 'Horário de término do expediente na segunda-feira (manhã). Ex: 12:00',
  },
  {
    campo: 'Segunda - Início Tarde',
    tipo: 'Hora',
    obrigatorio: false,
    descricao: 'Horário de início do expediente na segunda-feira (tarde). Ex: 13:00',
  },
  {
    campo: 'Segunda - Fim Tarde',
    tipo: 'Hora',
    obrigatorio: false,
    descricao: 'Horário de término do expediente na segunda-feira (tarde). Ex: 18:00',
  },
  {
    campo: '(mesmos campos para Terça a Sexta)',
    tipo: '-',
    obrigatorio: false,
    descricao: 'Configuração idêntica para terça, quarta, quinta e sexta-feira.',
  },
  {
    campo: 'Sábado - Trabalha',
    tipo: 'Sim/Não',
    obrigatorio: false,
    descricao: 'Se o profissional trabalha aos sábados.',
  },
  {
    campo: 'Sábado - Início/Fim',
    tipo: 'Hora',
    obrigatorio: false,
    descricao: 'Horário de início e fim do expediente no sábado (se trabalhar).',
  },
  {
    campo: 'Domingo - Trabalha',
    tipo: 'Sim/Não',
    obrigatorio: false,
    descricao: 'Se o profissional trabalha aos domingos.',
  },
  {
    campo: 'Domingo - Início/Fim',
    tipo: 'Hora',
    obrigatorio: false,
    descricao: 'Horário de início e fim do expediente no domingo (se trabalhar).',
  },
];

export default function ExpedientePage() {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Clock size={32} color="#9c27b0" />
        <Typography variant="h4" fontWeight={700}>
          Expediente do Profissional
        </Typography>
        <Chip label="SERVIÇO" size="small" sx={{ bgcolor: '#9c27b0', color: 'white' }} />
        <Chip label="AMBOS" size="small" sx={{ bgcolor: '#ed6c02', color: 'white' }} />
      </Box>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 800 }}>
        O expediente define em quais dias e horários cada profissional está disponível 
        para atendimento. Sem expediente configurado, o profissional não aparece na agenda.
      </Typography>

      {/* Acesso */}
      <Card variant="outlined" sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            📍 Como Acessar
          </Typography>
          <Typography variant="body1">
            Menu lateral → <strong>Serviços & Agenda</strong> → <strong>Profissionais</strong> → <strong>Expediente</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            <strong>Disponível em:</strong> Empresas com modelo "Serviço" ou "Ambos".
          </Typography>
        </CardContent>
      </Card>

      {/* Por que é importante */}
      <Alert severity="warning" icon={<Warning size={20} />} sx={{ mb: 4 }}>
        <Typography variant="body2">
          <strong>Importante:</strong> Um profissional SEM expediente configurado NÃO aparecerá 
          como opção disponível para agendamentos, mesmo tendo serviços vinculados.
        </Typography>
      </Alert>

      {/* Grid/Lista */}
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
        Tela Principal (Lista)
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 2 }}>
        A tela mostra o expediente de cada profissional. Funcionalidades:
      </Typography>

      <Box component="ul" sx={{ mb: 3 }}>
        <li><strong>Filtrar por profissional:</strong> Veja o expediente de um profissional específico</li>
        <li><strong>Novo expediente:</strong> Configure o expediente de um profissional</li>
        <li><strong>Editar:</strong> Altere horários de trabalho</li>
        <li><strong>Visualizar resumo:</strong> Veja rapidamente os dias que trabalha</li>
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
            {campos.map((campo, index) => (
              <TableRow key={index}>
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

      {/* Como Funciona */}
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
        Como Funciona
      </Typography>

      <Typography variant="body1" sx={{ mb: 2 }}>
        O expediente é configurado por dia da semana, com possibilidade de definir 
        dois períodos (manhã e tarde) para permitir intervalo de almoço.
      </Typography>

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            Exemplo de Expediente Completo:
          </Typography>
          <Box sx={{ fontFamily: 'monospace', fontSize: '0.85rem', bgcolor: 'grey.100', p: 2, borderRadius: 1 }}>
            <Box>Segunda a Sexta:</Box>
            <Box sx={{ pl: 2 }}>Manhã: 09:00 - 12:00</Box>
            <Box sx={{ pl: 2 }}>Tarde: 13:00 - 18:00</Box>
            <Box sx={{ mt: 1 }}>Sábado:</Box>
            <Box sx={{ pl: 2 }}>09:00 - 13:00 (sem intervalo)</Box>
            <Box sx={{ mt: 1 }}>Domingo: Não trabalha</Box>
          </Box>
        </CardContent>
      </Card>

      <Alert severity="info" icon={<Info size={20} />} sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Intervalo de almoço:</strong> Configure fim da manhã (ex: 12:00) e início da tarde (ex: 13:00). 
          O sistema entenderá que das 12:00 às 13:00 o profissional não está disponível.
        </Typography>
      </Alert>

      <Divider sx={{ my: 4 }} />

      {/* Validações */}
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
        Validações do Sistema
      </Typography>

      <Typography variant="body1" sx={{ mb: 2 }}>
        O sistema valida automaticamente:
      </Typography>

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
            <li>
              <strong>Dentro do horário da empresa:</strong> O expediente do profissional 
              não pode ultrapassar o horário de funcionamento da empresa.
            </li>
            <li>
              <strong>Horários consistentes:</strong> Início deve ser antes do fim em cada período.
            </li>
            <li>
              <strong>Um expediente por profissional:</strong> Cada profissional só pode 
              ter uma configuração de expediente.
            </li>
          </Box>
        </CardContent>
      </Card>

      <Alert severity="warning" icon={<Warning size={20} />} sx={{ mb: 3 }}>
        <Typography variant="body2">
          Se a empresa fecha às 18:00, você não pode configurar um profissional 
          para trabalhar até 19:00.
        </Typography>
      </Alert>

      <Divider sx={{ my: 4 }} />

      {/* Impacto nos Agendamentos */}
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <CalendarCheck size={24} />
        Impacto nos Agendamentos
      </Typography>

      <Typography variant="body1" sx={{ mb: 2 }}>
        O expediente é usado para calcular os horários disponíveis:
      </Typography>

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            <strong>Exemplo:</strong>
          </Typography>
          <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
            <li>Profissional trabalha de 09:00 às 18:00</li>
            <li>Serviço de "Corte" dura 30 minutos</li>
            <li>Sistema oferece: 09:00, 09:30, 10:00, 10:30... até 17:30</li>
            <li>O último horário é 17:30 pois o serviço de 30min termina às 18:00</li>
          </Box>
        </CardContent>
      </Card>

      <Divider sx={{ my: 4 }} />

      {/* Alterando Expediente */}
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
        Alterando o Expediente
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          Alterar o expediente <strong>não afeta agendamentos já realizados</strong>. 
          Se um cliente agendou para 17:00 e você alterou o expediente para terminar às 16:00, 
          o agendamento continua válido.
        </Typography>
      </Alert>

      <Alert severity="warning" sx={{ mb: 3 }}>
        <Typography variant="body2">
          Para folgas pontuais (férias, consultas médicas), use o módulo de 
          <strong> Bloqueios</strong> em vez de alterar o expediente.
        </Typography>
      </Alert>

      <Divider sx={{ my: 4 }} />

      {/* Dicas e Avisos */}
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
        Dicas e Avisos
      </Typography>

      <Alert severity="success" sx={{ mb: 2 }}>
        <Typography variant="body2">
          <strong>Dica:</strong> Configure o expediente assim que cadastrar um novo profissional. 
          Sem isso, ele não aparecerá como disponível.
        </Typography>
      </Alert>

      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2">
          Se um profissional não trabalha em determinado dia, simplesmente deixe 
          os campos daquele dia em branco.
        </Typography>
      </Alert>

      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2">
          O profissional pode ver seu próprio expediente fazendo login no sistema 
          com suas credenciais.
        </Typography>
      </Alert>
    </Box>
  );
}
