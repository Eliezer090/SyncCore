import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Alert from '@mui/material/Alert';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import StepContent from '@mui/material/StepContent';
import Divider from '@mui/material/Divider';
import Link from 'next/link';
import { 
  UserCirclePlus,
  Buildings,
  UsersThree,
  Gear,
  CheckCircle,
  Info,
  Warning,
} from '@phosphor-icons/react/dist/ssr';

export const metadata = {
  title: 'Primeiros Passos | SyncCore Docs',
};

const steps = [
  {
    label: 'Criar sua conta de administrador',
    icon: <UserCirclePlus size={24} />,
    description: `O primeiro passo é criar uma conta no sistema. Acesse a página de cadastro e preencha seus dados:`,
    details: [
      { field: 'Nome completo', desc: 'Seu nome que será exibido no sistema' },
      { field: 'E-mail', desc: 'Será usado para login e recuperação de senha' },
      { field: 'Senha', desc: 'Mínimo de 6 caracteres, use letras e números' },
    ],
    tip: 'Guarde bem seu e-mail e senha. Você pode recuperar a senha a qualquer momento pelo link "Esqueci minha senha".',
  },
  {
    label: 'Configurar sua primeira empresa',
    icon: <Buildings size={24} />,
    description: `Após o login, você será direcionado para cadastrar sua empresa. Os campos importantes são:`,
    details: [
      { field: 'Nome da empresa', desc: 'Nome comercial do seu negócio' },
      { field: 'Tipo de negócio', desc: 'Ex: Restaurante, Salão de Beleza, Loja, etc.' },
      { field: 'Modelo de negócio', desc: 'Produto, Serviço ou Ambos - define quais módulos estarão disponíveis' },
      { field: 'Descrição do negócio', desc: 'Breve descrição para o agente de IA entender seu negócio' },
      { field: 'WhatsApp vinculado', desc: 'Número para integração com atendimento automatizado' },
    ],
    tip: 'O modelo de negócio é muito importante! Ele define quais funcionalidades estarão disponíveis. Veja a seção Modelos de Negócio para mais detalhes.',
  },
  {
    label: 'Cadastrar sua equipe (opcional)',
    icon: <UsersThree size={24} />,
    description: `Se você tem funcionários, pode cadastrá-los com diferentes níveis de acesso:`,
    details: [
      { field: 'Gerente', desc: 'Acesso quase completo, gerencia o dia a dia' },
      { field: 'Profissional', desc: 'Para quem presta serviços - vê apenas seus agendamentos e expediente' },
      { field: 'Atendente', desc: 'Acesso limitado a pedidos e atendimento' },
    ],
    tip: 'Você pode personalizar as permissões de cada papel na seção Configurações > Permissões.',
  },
  {
    label: 'Configurar horários e expediente',
    icon: <Gear size={24} />,
    description: `Defina quando sua empresa funciona e, se for de serviços, o expediente de cada profissional:`,
    details: [
      { field: 'Horários da Empresa', desc: 'Dias e horários de funcionamento geral' },
      { field: 'Expediente do Profissional', desc: 'Horários específicos de cada profissional (apenas para serviços)' },
      { field: 'Bloqueios', desc: 'Férias, folgas ou indisponibilidades (apenas para serviços)' },
    ],
    tip: 'Os agendamentos só poderão ser feitos dentro dos horários configurados.',
  },
];

export default function PrimeirosPassosPage() {
  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Primeiros Passos
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 800 }}>
        Este guia vai te ajudar a configurar sua empresa no SyncCore em poucos minutos.
        Siga cada etapa com atenção para garantir que tudo funcione corretamente.
      </Typography>

      <Alert severity="info" icon={<Info size={20} />} sx={{ mb: 4 }}>
        <Typography variant="body2">
          <strong>Tempo estimado:</strong> 10-15 minutos para configuração completa básica.
        </Typography>
      </Alert>

      {/* Stepper com os passos */}
      <Stepper orientation="vertical" sx={{ mb: 4 }}>
        {steps.map((step, index) => (
          <Step key={step.label} active expanded>
            <StepLabel
              StepIconComponent={() => (
                <Box sx={{ 
                  width: 40, 
                  height: 40, 
                  borderRadius: '50%', 
                  bgcolor: 'primary.main',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {step.icon}
                </Box>
              )}
            >
              <Typography variant="h6" fontWeight={600}>
                {index + 1}. {step.label}
              </Typography>
            </StepLabel>
            <StepContent>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {step.description}
              </Typography>
              
              <Card variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  {step.details.map((detail, i) => (
                    <Box key={i} sx={{ mb: i < step.details.length - 1 ? 2 : 0 }}>
                      <Typography variant="subtitle2" fontWeight={600} color="primary">
                        {detail.field}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {detail.desc}
                      </Typography>
                    </Box>
                  ))}
                </CardContent>
              </Card>

              <Alert severity="success" icon={<CheckCircle size={20} />}>
                <Typography variant="body2">
                  <strong>Dica:</strong> {step.tip}
                </Typography>
              </Alert>
            </StepContent>
          </Step>
        ))}
      </Stepper>

      <Divider sx={{ my: 4 }} />

      {/* O que fazer depois */}
      <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
        E depois?
      </Typography>

      <Typography variant="body1" sx={{ mb: 3 }}>
        Após completar a configuração básica, o próximo passo depende do seu modelo de negócio:
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Card variant="outlined">
          <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ 
              p: 1.5, 
              borderRadius: 2, 
              bgcolor: 'info.lighter',
              color: 'info.main',
            }}>
              🛒
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight={600}>
                Se você trabalha com PRODUTOS
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Cadastre categorias, depois produtos, configure variações e adicionais se necessário.{' '}
                <Link href="/docs/fluxos/produtos">Ver fluxo completo →</Link>
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ 
              p: 1.5, 
              borderRadius: 2, 
              bgcolor: 'secondary.lighter',
              color: 'secondary.main',
            }}>
              ✂️
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight={600}>
                Se você trabalha com SERVIÇOS
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Cadastre serviços, depois profissionais, configure expediente e vincule serviços aos profissionais.{' '}
                <Link href="/docs/fluxos/servicos">Ver fluxo completo →</Link>
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ 
              p: 1.5, 
              borderRadius: 2, 
              bgcolor: 'warning.lighter',
              color: 'warning.main',
            }}>
              🏢
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight={600}>
                Se você trabalha com AMBOS
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Você tem acesso a todos os recursos! Configure produtos e serviços conforme sua necessidade.{' '}
                <Link href="/docs/fluxos/ambos">Ver fluxo completo →</Link>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Alert severity="warning" icon={<Warning size={20} />} sx={{ mt: 4 }}>
        <Typography variant="body2">
          <strong>Importante:</strong> Se você escolheu o modelo errado, pode alterar em{' '}
          <strong>Empresas → Editar → Modelo de Negócio</strong>. Mas atenção: se mudar de "Ambos" 
          para "Produto" ou "Serviço", perderá acesso aos módulos do outro tipo.
        </Typography>
      </Alert>
    </Box>
  );
}
