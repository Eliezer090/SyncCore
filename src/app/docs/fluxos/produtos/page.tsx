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
  ListBullets,
  Cube,
  ShoppingCart,
  Truck,
  CreditCard,
  CheckCircle,
  Warning,
  Lightbulb,
  NumberOne,
  NumberTwo,
  NumberThree,
  NumberFour,
  NumberFive,
  NumberSix,
} from '@phosphor-icons/react/dist/ssr';

export const metadata = {
  title: 'Fluxo para Empresas de Produtos | SyncCore Docs',
};

const steps = [
  {
    number: 1,
    title: 'Configurar a Empresa',
    icon: <Buildings size={20} />,
    description: 'Configure os dados básicos da sua empresa',
    details: [
      'Acesse Empresas → Nova Empresa (ou edite a existente)',
      'Preencha o nome, tipo de negócio e selecione "Produto" como modelo',
      'Configure se oferece delivery e a taxa de entrega padrão',
      'Defina o valor mínimo para entrega grátis (opcional)',
      'Configure o tempo limite para cancelamento de pedidos',
    ],
    tips: [
      'A descrição do negócio ajuda o agente de IA a entender seu negócio e atender melhor os clientes',
      'Se você também presta serviços, escolha o modelo "Ambos"',
    ],
    link: '/docs/modulos/empresas',
  },
  {
    number: 2,
    title: 'Cadastrar Categorias',
    icon: <ListBullets size={20} />,
    description: 'Organize seus produtos em categorias',
    details: [
      'Acesse Produtos & Pedidos → Catálogo → Categorias',
      'Clique em "Nova Categoria"',
      'Preencha o nome da categoria (ex: Pizzas, Bebidas, Lanches)',
      'Adicione uma descrição (opcional)',
      'Faça upload de uma imagem representativa (opcional)',
      'Defina a ordem de exibição',
    ],
    tips: [
      'Categorias bem organizadas facilitam a navegação do cliente',
      'Use nomes claros e objetivos',
      'A ordem de exibição define como aparece no cardápio/catálogo',
    ],
    link: '/docs/modulos/categorias',
  },
  {
    number: 3,
    title: 'Cadastrar Produtos',
    icon: <Cube size={20} />,
    description: 'Adicione seus produtos ao catálogo',
    details: [
      'Acesse Produtos & Pedidos → Catálogo → Produtos',
      'Clique em "Novo Produto"',
      'Selecione a categoria do produto',
      'Preencha: nome, descrição, preço',
      'Faça upload de imagens (a primeira será a principal)',
      'Configure se está disponível e se controla estoque',
      'Defina o tempo de preparo em minutos',
    ],
    tips: [
      'Boas fotos aumentam as vendas! Use imagens de qualidade',
      'A descrição deve ser atrativa e mencionar ingredientes/características',
      'Se marcar "Controla Estoque", precisará cadastrar o estoque depois',
    ],
    link: '/docs/modulos/produtos',
  },
  {
    number: 4,
    title: 'Configurar Variações (Opcional)',
    icon: <Cube size={20} />,
    description: 'Para produtos com tamanhos, sabores ou opções',
    details: [
      'Acesse Produtos & Pedidos → Catálogo → Variações',
      'Clique em "Nova Variação"',
      'Selecione o produto base',
      'Defina o nome da variação (ex: "Grande", "Média", "Pequena")',
      'Configure o preço adicional (ou desconto se negativo)',
      'Marque se está disponível',
    ],
    tips: [
      'Variações são ideais para pizzas com tamanhos diferentes',
      'Também servem para bebidas (300ml, 500ml, 1L)',
      'O preço pode ser adicional (+R$5) ou diferença do produto base',
    ],
    link: '/docs/modulos/variacoes',
  },
  {
    number: 5,
    title: 'Configurar Adicionais (Opcional)',
    icon: <Cube size={20} />,
    description: 'Para extras que o cliente pode escolher',
    details: [
      'Acesse Produtos & Pedidos → Catálogo → Adicionais',
      'Clique em "Novo Adicional"',
      'Selecione o produto ao qual se aplica',
      'Defina o nome do adicional (ex: "Bacon", "Queijo Extra")',
      'Configure o preço do adicional',
      'Defina quantidade máxima permitida (se aplicável)',
    ],
    tips: [
      'Adicionais aumentam o ticket médio dos pedidos',
      'Podem ser ingredientes extras, acompanhamentos, etc.',
      'Configure limite de quantidade se fizer sentido (ex: máx 3 bacon)',
    ],
    link: '/docs/modulos/adicionais',
  },
  {
    number: 6,
    title: 'Controlar Estoque (Se necessário)',
    icon: <Cube size={20} />,
    description: 'Gerencie a quantidade disponível',
    details: [
      'Acesse Produtos & Pedidos → Catálogo → Estoque',
      'Veja os produtos que controlam estoque',
      'Ajuste a quantidade atual de cada item',
      'Configure alertas de estoque baixo',
      'Registre entradas e saídas',
    ],
    tips: [
      'Mantenha o estoque atualizado para não vender o que não tem',
      'Configure alertas para ser avisado quando estiver acabando',
      'O sistema pode desativar automaticamente produtos sem estoque',
    ],
    link: '/docs/modulos/estoque',
  },
];

export default function FluxoProdutosPage() {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Chip label="PRODUTO" sx={{ bgcolor: '#2196f3', color: 'white', fontWeight: 700 }} />
        <Typography variant="h4" fontWeight={700}>
          Fluxo para Empresas de Produtos
        </Typography>
      </Box>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 800 }}>
        Este guia passo a passo mostra como configurar completamente uma empresa que trabalha 
        com venda de produtos. Siga a ordem recomendada para garantir que tudo funcione corretamente.
      </Typography>

      <Alert severity="info" sx={{ mb: 4 }}>
        <Typography variant="body2">
          <strong>Exemplos de negócios:</strong> Restaurantes, Lanchonetes, Pizzarias, Hamburguerias, 
          Lojas de roupas, Mercados, Padarias, Docerias, etc.
        </Typography>
      </Alert>

      {/* Timeline com os passos */}
      <Timeline position="right" sx={{ p: 0 }}>
        {steps.map((step, index) => (
          <TimelineItem key={step.number}>
            <TimelineSeparator>
              <TimelineDot sx={{ bgcolor: '#2196f3', p: 1.5 }}>
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
                      sx={{ bgcolor: '#2196f3', color: 'white' }} 
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
        Com tudo configurado, sua empresa está pronta para receber pedidos! Veja o que acontece:
      </Typography>

      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <ShoppingCart size={24} color="#2196f3" />
            <Typography variant="h6" fontWeight={600}>Recebendo Pedidos</Typography>
          </Box>
          <Typography variant="body2">
            Os pedidos chegam pelo WhatsApp (se integrado) ou podem ser criados manualmente.
            Acesse <strong>Produtos & Pedidos → Vendas → Pedidos</strong> para visualizar e gerenciar.
            Cada pedido mostra: cliente, itens, valor total, status e endereço de entrega.
          </Typography>
        </CardContent>
      </Card>

      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Truck size={24} color="#ff9800" />
            <Typography variant="h6" fontWeight={600}>Gerenciando Entregas</Typography>
          </Box>
          <Typography variant="body2">
            Acompanhe o status de cada pedido: Pendente → Em Preparo → Saiu para Entrega → Entregue.
            Configure o tempo estimado de preparo nos produtos para informar o cliente.
            A taxa de entrega é calculada automaticamente baseada nas configurações da empresa.
          </Typography>
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <CreditCard size={24} color="#4caf50" />
            <Typography variant="h6" fontWeight={600}>Controlando Pagamentos</Typography>
          </Box>
          <Typography variant="body2">
            Registre os pagamentos em <strong>Produtos & Pedidos → Vendas → Pagamentos</strong>.
            Suporta múltiplas formas: Dinheiro, Cartão, PIX, etc.
            O sistema calcula automaticamente valores pendentes e troco quando necessário.
          </Typography>
        </CardContent>
      </Card>

      <Alert severity="warning" icon={<Warning size={20} />} sx={{ mt: 4 }}>
        <Typography variant="body2">
          <strong>Importante:</strong> Se você também deseja oferecer serviços com agendamento 
          (ex: delivery programado, retirada agendada), considere mudar o modelo para "Ambos".
        </Typography>
      </Alert>
    </Box>
  );
}
