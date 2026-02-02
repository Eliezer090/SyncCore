import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
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
  Package,
  ShoppingCart,
  CurrencyCircleDollar,
  Swap,
} from '@phosphor-icons/react/dist/ssr';

export const metadata = {
  title: 'Fluxo para Empresas Mistas | SyncCore Docs',
};

const produtosSteps = [
  {
    number: 1,
    title: 'Configurar Categorias de Produtos',
    icon: <Package size={20} />,
    details: [
      'Acesse Produtos & Pedidos → Categorias',
      'Crie categorias para organizar seus produtos',
      'Ex: Cabelos, Maquiagem, Unhas, Acessórios',
    ],
    link: '/docs/modulos/categorias',
  },
  {
    number: 2,
    title: 'Cadastrar Produtos',
    icon: <Package size={20} />,
    details: [
      'Acesse Produtos & Pedidos → Produtos',
      'Cadastre com nome, descrição, categoria, preço',
      'Adicione variações (tamanhos, cores)',
      'Configure adicionais se necessário',
    ],
    link: '/docs/modulos/produtos',
  },
  {
    number: 3,
    title: 'Gerenciar Estoque',
    icon: <Package size={20} />,
    details: [
      'Acesse Produtos & Pedidos → Estoque',
      'Registre entrada e saída de produtos',
      'Defina estoque mínimo para alertas',
    ],
    link: '/docs/modulos/estoque',
  },
];

const servicosSteps = [
  {
    number: 1,
    title: 'Cadastrar Serviços',
    icon: <Scissors size={20} />,
    details: [
      'Acesse Serviços & Agenda → Serviços',
      'Cadastre com nome, preço, duração',
      'Configure antecedência mínima',
    ],
    link: '/docs/modulos/servicos',
  },
  {
    number: 2,
    title: 'Cadastrar Profissionais',
    icon: <UsersThree size={20} />,
    details: [
      'Acesse Serviços & Agenda → Profissionais',
      'Adicione a equipe de trabalho',
      'Vincule serviços a cada profissional',
    ],
    link: '/docs/modulos/profissionais',
  },
  {
    number: 3,
    title: 'Configurar Expediente',
    icon: <Clock size={20} />,
    details: [
      'Configure horários de cada profissional',
      'Defina dias de folga fixos',
      'Cadastre bloqueios quando necessário',
    ],
    link: '/docs/modulos/expediente',
  },
];

const commonSteps = [
  {
    number: 1,
    title: 'Configurar a Empresa',
    icon: <Buildings size={20} />,
    description: 'Configure os dados básicos com modelo "Ambos"',
    details: [
      'Acesse Empresas → Editar sua empresa',
      'Selecione "Ambos" como modelo de negócio',
      'Preencha nome, CNPJ, endereço',
      'Configure tempo limite para cancelamento de agendamentos',
      'Adicione descrição para o agente de IA',
    ],
    tips: [
      'O modelo "Ambos" libera todos os menus de produtos e serviços',
      'A descrição ajuda o IA a responder perguntas sobre ambos',
    ],
    link: '/docs/modulos/empresas',
  },
  {
    number: 2,
    title: 'Configurar Horários da Empresa',
    icon: <Clock size={20} />,
    description: 'Defina quando a empresa funciona',
    details: [
      'Acesse Geral → Horários da Empresa',
      'Configure abertura/fechamento por dia',
      'Horários valem para agendamentos E atendimento de pedidos',
    ],
    tips: [
      'Considere se o horário de entrega é o mesmo do salão',
      'Configure dias diferentes se necessário',
    ],
    link: '/docs/modulos/horarios-empresa',
  },
  {
    number: 3,
    title: 'Cadastrar Clientes',
    icon: <UsersThree size={20} />,
    description: 'Base de clientes unificada',
    details: [
      'Acesse Geral → Clientes',
      'Cadastre com nome, telefone, e-mail',
      'Adicione endereços para entregas',
      'Clientes também chegam automaticamente pelo WhatsApp',
    ],
    tips: [
      'Um mesmo cliente pode agendar serviços E fazer pedidos',
      'O histórico fica unificado no cadastro do cliente',
    ],
    link: '/docs/modulos/clientes',
  },
];

export default function FluxoAmbosPage() {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Chip label="AMBOS" sx={{ bgcolor: '#ed6c02', color: 'white', fontWeight: 700 }} />
        <Typography variant="h4" fontWeight={700}>
          Fluxo para Empresas Mistas
        </Typography>
      </Box>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 800 }}>
        Este guia mostra como configurar uma empresa que trabalha tanto com venda de 
        produtos quanto com prestação de serviços agendados. 
      </Typography>

      <Alert severity="info" sx={{ mb: 4 }}>
        <Typography variant="body2">
          <strong>Exemplos de negócios:</strong> Salões que vendem produtos de beleza, 
          Pet Shops com banho/tosa + produtos, Clínicas de estética com cosméticos, 
          Barbearias com produtos para barba, Estúdios de tatuagem com acessórios.
        </Typography>
      </Alert>

      <Alert severity="warning" icon={<Warning size={20} />} sx={{ mb: 4 }}>
        <Typography variant="body2">
          <strong>Nota:</strong> Como o modelo "Ambos" combina as funcionalidades de Produtos e Serviços, 
          você precisará configurar <strong>ambas as partes</strong>. Recomendamos começar pelo que 
          é mais importante para seu negócio.
        </Typography>
      </Alert>

      {/* Configuração Comum */}
      <Typography variant="h5" fontWeight={600} sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Buildings size={24} />
        Configuração Básica (Obrigatória)
      </Typography>

      <Timeline position="right" sx={{ p: 0, mb: 4 }}>
        {commonSteps.map((step, index) => (
          <TimelineItem key={step.number}>
            <TimelineSeparator>
              <TimelineDot sx={{ bgcolor: '#ed6c02', p: 1.5 }}>
                {step.icon}
              </TimelineDot>
              {index < commonSteps.length - 1 && <TimelineConnector />}
            </TimelineSeparator>
            <TimelineContent sx={{ py: '12px', px: 2 }}>
              <Card variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Chip 
                      label={`Passo ${step.number}`} 
                      size="small" 
                      sx={{ bgcolor: '#ed6c02', color: 'white' }} 
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
                      📖 Ver documentação completa →
                    </Typography>
                  </Link>
                </CardContent>
              </Card>
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>

      <Divider sx={{ my: 4 }} />

      {/* Duas colunas: Produtos e Serviços */}
      <Typography variant="h5" fontWeight={600} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Swap size={24} />
        Configurações Específicas
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Configure cada parte conforme sua necessidade. Você pode fazer em paralelo ou começar por uma.
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
        {/* Coluna Produtos */}
        <Box>
          <Card sx={{ height: '100%', borderLeft: '4px solid #667eea' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <ShoppingCart size={32} color="#667eea" />
                <Typography variant="h6" fontWeight={600}>
                  Parte de Produtos
                </Typography>
              </Box>

              {produtosSteps.map((step) => (
                <Card key={step.number} variant="outlined" sx={{ mb: 2 }}>
                  <CardContent sx={{ py: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Chip 
                        label={step.number} 
                        size="small" 
                        sx={{ bgcolor: '#667eea', color: 'white', minWidth: 24 }} 
                      />
                      <Typography variant="subtitle2" fontWeight={600}>
                        {step.title}
                      </Typography>
                    </Box>
                    <Box component="ul" sx={{ m: 0, pl: 2, fontSize: '0.875rem' }}>
                      {step.details.map((detail, i) => (
                        <li key={i}>
                          <Typography variant="body2">{detail}</Typography>
                        </li>
                      ))}
                    </Box>
                    <Link href={step.link}>
                      <Typography variant="caption" color="primary">
                        Ver mais →
                      </Typography>
                    </Link>
                  </CardContent>
                </Card>
              ))}

              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  📖 Veja o <Link href="/docs/fluxos/produtos" style={{ fontWeight: 600 }}>guia completo de produtos</Link> para mais detalhes.
                </Typography>
              </Alert>
            </CardContent>
          </Card>
        </Box>

        {/* Coluna Serviços */}
        <Box>
          <Card sx={{ height: '100%', borderLeft: '4px solid #9c27b0' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Calendar size={32} color="#9c27b0" />
                <Typography variant="h6" fontWeight={600}>
                  Parte de Serviços
                </Typography>
              </Box>

              {servicosSteps.map((step) => (
                <Card key={step.number} variant="outlined" sx={{ mb: 2 }}>
                  <CardContent sx={{ py: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Chip 
                        label={step.number} 
                        size="small" 
                        sx={{ bgcolor: '#9c27b0', color: 'white', minWidth: 24 }} 
                      />
                      <Typography variant="subtitle2" fontWeight={600}>
                        {step.title}
                      </Typography>
                    </Box>
                    <Box component="ul" sx={{ m: 0, pl: 2, fontSize: '0.875rem' }}>
                      {step.details.map((detail, i) => (
                        <li key={i}>
                          <Typography variant="body2">{detail}</Typography>
                        </li>
                      ))}
                    </Box>
                    <Link href={step.link}>
                      <Typography variant="caption" color="primary">
                        Ver mais →
                      </Typography>
                    </Link>
                  </CardContent>
                </Card>
              ))}

              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  📖 Veja o <Link href="/docs/fluxos/servicos" style={{ fontWeight: 600 }}>guia completo de serviços</Link> para mais detalhes.
                </Typography>
              </Alert>
            </CardContent>
          </Card>
        </Box>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Como funciona no dia a dia */}
      <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
        No Dia a Dia
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
        <Box>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Calendar size={24} color="#9c27b0" />
                <Typography variant="subtitle1" fontWeight={600}>Agendamentos</Typography>
              </Box>
              <Typography variant="body2">
                Gerencie a agenda em <strong>Serviços & Agenda → Agendamentos</strong>. 
                Veja os horários de cada profissional, confirme ou remarque atendimentos.
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <ShoppingCart size={24} color="#667eea" />
                <Typography variant="subtitle1" fontWeight={600}>Pedidos</Typography>
              </Box>
              <Typography variant="body2">
                Acompanhe pedidos em <strong>Produtos & Pedidos → Pedidos</strong>. 
                Veja itens, valores, status de pagamento e entrega.
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <CurrencyCircleDollar size={24} color="#4caf50" />
                <Typography variant="subtitle1" fontWeight={600}>Pagamentos</Typography>
              </Box>
              <Typography variant="body2">
                Registre pagamentos tanto de serviços quanto de produtos na mesma tela.
                Controle o que foi recebido e o que está pendente.
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      <Alert severity="success" sx={{ mt: 4 }}>
        <Typography variant="body2">
          <strong>Vantagem do modelo "Ambos":</strong> O cliente pode, em uma mesma conversa pelo 
          WhatsApp, agendar um corte de cabelo E comprar um produto de barba. O sistema gerencia 
          tudo de forma integrada!
        </Typography>
      </Alert>
    </Box>
  );
}
