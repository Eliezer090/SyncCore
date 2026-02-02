import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import Link from 'next/link';
import {
  Buildings,
  Scissors,
  UsersThree,
  Clock,
  Calendar,
  Prohibit,
  CheckCircle,
  Warning,
  Lightbulb,
} from '@phosphor-icons/react/dist/ssr';

export const metadata = {
  title: 'Fluxo para Empresas de Serviços | SyncCore Docs',
};

const steps = [
  {
    number: 1,
    title: 'Configurar a Empresa',
    icon: <Buildings size={20} />,
    description: 'Configure os dados básicos da sua empresa de serviços',
    details: [
      'Acesse Empresas → Nova Empresa (ou edite a existente)',
      'Preencha o nome, tipo de negócio (ex: Salão de Beleza)',
      'Selecione "Serviço" como modelo de negócio',
      'Configure o tempo limite para cancelamento de agendamentos',
      'Adicione uma descrição do negócio para o agente de IA',
    ],
    tips: [
      'O tempo de cancelamento define até quando o cliente pode cancelar sem penalidade',
      'A descrição ajuda o agente de IA a entender seus serviços e atender melhor',
    ],
    link: '/docs/modulos/empresas',
  },
  {
    number: 2,
    title: 'Configurar Horários da Empresa',
    icon: <Clock size={20} />,
    description: 'Defina os dias e horários de funcionamento',
    details: [
      'Acesse Geral → Horários da Empresa',
      'Configure o horário de abertura e fechamento para cada dia',
      'Marque os dias em que a empresa está fechada',
      'Você pode ter horários diferentes para cada dia da semana',
      'Feriados e fechamentos especiais podem ser configurados',
    ],
    tips: [
      'Os agendamentos só poderão ser feitos dentro destes horários',
      'Se um dia não está configurado, considera-se fechado',
      'Configure também horário de almoço se houver pausa',
    ],
    link: '/docs/modulos/horarios-empresa',
  },
  {
    number: 3,
    title: 'Cadastrar Serviços',
    icon: <Scissors size={20} />,
    description: 'Adicione os serviços que você oferece',
    details: [
      'Acesse Serviços & Agenda → Serviços',
      'Clique em "Novo Serviço"',
      'Preencha: nome, descrição, preço base',
      'Configure a duração padrão em minutos',
      'Faça upload de imagens ilustrativas (opcional)',
      'Defina a antecedência mínima para agendamento',
    ],
    tips: [
      'A duração é importante para calcular os horários disponíveis',
      'A antecedência mínima evita agendamentos de última hora',
      'Boas descrições ajudam o cliente a entender o que está incluído',
    ],
    link: '/docs/modulos/servicos',
  },
  {
    number: 4,
    title: 'Cadastrar Profissionais',
    icon: <UsersThree size={20} />,
    description: 'Adicione sua equipe de profissionais',
    details: [
      'Acesse Serviços & Agenda → Profissionais → Profissionais',
      'Clique em "Novo Usuário" com papel "Profissional"',
      'Preencha: nome, e-mail, senha',
      'Configure se o profissional está ativo',
      'Adicione uma foto do profissional (opcional)',
    ],
    tips: [
      'Cada profissional pode ter login próprio para ver sua agenda',
      'O profissional só vê seus próprios agendamentos e expediente',
      'Mantenha os dados atualizados para facilitar a comunicação',
    ],
    link: '/docs/modulos/profissionais',
  },
  {
    number: 5,
    title: 'Vincular Serviços aos Profissionais',
    icon: <Scissors size={20} />,
    description: 'Defina quais serviços cada profissional realiza',
    details: [
      'Acesse Serviços & Agenda → Profissionais → Serviços do Prof.',
      'Clique em "Novo Vínculo"',
      'Selecione o profissional',
      'Selecione o serviço que ele realiza',
      'Configure duração específica (se diferente do padrão)',
      'Configure preço específico (se diferente do padrão)',
      'Defina antecedência mínima específica (opcional)',
    ],
    tips: [
      'Um profissional pode realizar vários serviços',
      'Um serviço pode ser realizado por vários profissionais',
      'Cada vínculo pode ter duração e preço próprios',
      'Se um profissional é mais rápido, configure duração menor',
    ],
    link: '/docs/modulos/servicos-profissional',
  },
  {
    number: 6,
    title: 'Configurar Expediente dos Profissionais',
    icon: <Clock size={20} />,
    description: 'Defina os horários de trabalho de cada um',
    details: [
      'Acesse Serviços & Agenda → Profissionais → Expediente',
      'Clique em "Novo Expediente"',
      'Selecione o profissional',
      'Configure o horário de Segunda a Sexta (manhã e tarde)',
      'Configure se trabalha aos Sábados e em qual horário',
      'Configure se trabalha aos Domingos e em qual horário',
    ],
    tips: [
      'Cada profissional pode ter expediente diferente',
      'Configure separadamente manhã e tarde para intervalos',
      'Profissional sem expediente não aparece na agenda',
      'O sistema valida se o expediente está dentro do horário da empresa',
    ],
    link: '/docs/modulos/expediente',
  },
  {
    number: 7,
    title: 'Cadastrar Bloqueios (Quando necessário)',
    icon: <Prohibit size={20} />,
    description: 'Registre férias, folgas e indisponibilidades',
    details: [
      'Acesse Serviços & Agenda → Profissionais → Bloqueios',
      'Clique em "Novo Bloqueio"',
      'Selecione o profissional',
      'Defina data/hora de início e fim do bloqueio',
      'Adicione um motivo (ex: Férias, Consulta médica)',
      'Marque se é bloqueio recorrente (ex: toda segunda de manhã)',
    ],
    tips: [
      'Bloqueios impedem agendamentos no período definido',
      'Use bloqueios recorrentes para indisponibilidades fixas',
      'O sistema avisa se há agendamentos no período bloqueado',
    ],
    link: '/docs/modulos/bloqueios',
  },
];

export default function FluxoServicosPage() {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Chip label="SERVIÇO" sx={{ bgcolor: '#9c27b0', color: 'white', fontWeight: 700 }} />
        <Typography variant="h4" fontWeight={700}>
          Fluxo para Empresas de Serviços
        </Typography>
      </Box>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 800 }}>
        Este guia passo a passo mostra como configurar completamente uma empresa que trabalha 
        com prestação de serviços e agendamentos. Siga a ordem recomendada!
      </Typography>

      <Alert severity="info" sx={{ mb: 4 }}>
        <Typography variant="body2">
          <strong>Exemplos de negócios:</strong> Salões de beleza, Barbearias, Clínicas de estética, 
          Consultórios, Pet Shops (banho e tosa), Estúdios de tatuagem, Academias com personal, etc.
        </Typography>
      </Alert>

      {/* Timeline com os passos */}
      <Timeline position="right" sx={{ p: 0 }}>
        {steps.map((step, index) => (
          <TimelineItem key={step.number}>
            <TimelineSeparator>
              <TimelineDot sx={{ bgcolor: '#9c27b0', p: 1.5 }}>
                {step.icon}
              </TimelineDot>
              {index < steps.length - 1 && <TimelineConnector />}
            </TimelineSeparator>
            <TimelineContent sx={{ py: '12px', px: 2 }}>
              <Card variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Chip 
                      label={`Passo ${step.number}`} 
                      size="small" 
                      sx={{ bgcolor: '#9c27b0', color: 'white' }} 
                    />
                    <Typography variant="h6" fontWeight={600}>
                      {step.title}
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {step.description}
                  </Typography>

                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    <CheckCircle size={16} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                    O que fazer:
                  </Typography>
                  <Box component="ul" sx={{ m: 0, pl: 2.5, mb: 2 }}>
                    {step.details.map((detail, i) => (
                      <li key={i}>
                        <Typography variant="body2">{detail}</Typography>
                      </li>
                    ))}
                  </Box>

                  <Alert severity="success" icon={<Lightbulb size={18} />} sx={{ mb: 1 }}>
                    <Typography variant="body2" component="div">
                      <strong>Dicas:</strong>
                      <ul style={{ margin: '4px 0 0 0', paddingLeft: 16 }}>
                        {step.tips.map((tip, i) => (
                          <li key={i}>{tip}</li>
                        ))}
                      </ul>
                    </Typography>
                  </Alert>

                  <Link href={step.link}>
                    <Typography variant="body2" color="primary" sx={{ fontWeight: 500 }}>
                      📖 Ver documentação completa deste módulo →
                    </Typography>
                  </Link>
                </CardContent>
              </Card>
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>

      <Divider sx={{ my: 4 }} />

      {/* Após configurar */}
      <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
        Após a Configuração Inicial
      </Typography>

      <Typography variant="body1" sx={{ mb: 3 }}>
        Com tudo configurado, sua empresa está pronta para receber agendamentos!
      </Typography>

      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Calendar size={24} color="#9c27b0" />
            <Typography variant="h6" fontWeight={600}>Recebendo Agendamentos</Typography>
          </Box>
          <Typography variant="body2">
            Os agendamentos podem chegar pelo WhatsApp (se integrado) ou serem criados manualmente.
            Acesse <strong>Serviços & Agenda → Agenda → Agendamentos</strong> para visualizar e gerenciar.
            O sistema mostra: cliente, serviço, profissional, data/hora e status.
          </Typography>
        </CardContent>
      </Card>

      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Clock size={24} color="#ff9800" />
            <Typography variant="h6" fontWeight={600}>Gerenciando a Agenda</Typography>
          </Box>
          <Typography variant="body2">
            Acompanhe o status de cada agendamento: Pendente → Confirmado → Em Atendimento → Concluído.
            Você pode remarcar, cancelar ou alterar o profissional diretamente pela lista.
            O sistema valida automaticamente conflitos de horário e disponibilidade.
          </Typography>
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <UsersThree size={24} color="#4caf50" />
            <Typography variant="h6" fontWeight={600}>Visão do Profissional</Typography>
          </Box>
          <Typography variant="body2">
            Cada profissional pode fazer login com seu próprio usuário e ver apenas:
            <ul style={{ margin: '8px 0 0 0', paddingLeft: 20 }}>
              <li>Seus próprios agendamentos do dia/semana</li>
              <li>Seu expediente configurado</li>
              <li>Seus bloqueios cadastrados</li>
              <li>Os serviços que ele realiza</li>
            </ul>
          </Typography>
        </CardContent>
      </Card>

      <Alert severity="warning" icon={<Warning size={20} />} sx={{ mt: 4 }}>
        <Typography variant="body2">
          <strong>Importante:</strong> Se você também deseja vender produtos 
          (ex: shampoos, cremes, acessórios), considere mudar o modelo para "Ambos".
        </Typography>
      </Alert>
    </Box>
  );
}
