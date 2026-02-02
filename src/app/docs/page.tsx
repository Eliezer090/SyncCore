import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Link from 'next/link';
import { 
  Cube, 
  Scissors, 
  Buildings,
  Rocket,
  CheckCircle,
  ArrowRight,
} from '@phosphor-icons/react/dist/ssr';

export const metadata = {
  title: 'Documentação | SyncCore',
  description: 'Documentação completa do sistema SyncCore - Gestão de Empresas, Produtos, Serviços e Agendamentos',
};

function FeatureCard({ 
  icon, 
  title, 
  description, 
  href,
  color = 'primary.main',
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
  href: string;
  color?: string;
}) {
  return (
    <Card 
      component={Link}
      href={href}
      sx={{ 
        height: '100%', 
        cursor: 'pointer',
        textDecoration: 'none',
        transition: 'all 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box sx={{ 
            p: 1.5, 
            borderRadius: 2, 
            bgcolor: `${color}15`,
            color: color,
            mr: 2,
          }}>
            {icon}
          </Box>
          <Typography variant="h6" fontWeight={600}>{title}</Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, color: 'primary.main' }}>
          <Typography variant="body2" fontWeight={500}>Saiba mais</Typography>
          <ArrowRight size={16} style={{ marginLeft: 4 }} />
        </Box>
      </CardContent>
    </Card>
  );
}

export default function DocsPage() {
  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 6 }}>
        <Chip label="v1.0.0" size="small" color="primary" sx={{ mb: 2 }} />
        <Typography variant="h3" fontWeight={700} gutterBottom>
          Bem-vindo à Documentação do SyncCore
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 800 }}>
          O SyncCore é uma plataforma completa para gestão empresarial que se adapta ao seu modelo de negócio: 
          seja para venda de <strong>produtos</strong>, prestação de <strong>serviços</strong>, ou <strong>ambos</strong>.
        </Typography>
      </Box>

      {/* Alerta de boas-vindas */}
      <Alert severity="info" sx={{ mb: 4 }}>
        <Typography variant="body2">
          <strong>Novo por aqui?</strong> Recomendamos começar pela seção{' '}
          <Link href="/docs/primeiros-passos" style={{ fontWeight: 600 }}>Primeiros Passos</Link>{' '}
          para entender como configurar sua empresa corretamente.
        </Typography>
      </Alert>

      {/* Cards de modelo de negócio */}
      <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
        Escolha seu Modelo de Negócio
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 6 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <FeatureCard
            icon={<Cube size={32} />}
            title="Produtos"
            description="Para lojas, restaurantes, lanchonetes e negócios que vendem produtos físicos. Gerencie estoque, pedidos, variações e delivery."
            href="/docs/fluxos/produtos"
            color="#2196f3"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <FeatureCard
            icon={<Scissors size={32} />}
            title="Serviços"
            description="Para salões, barbearias, clínicas e prestadores de serviço. Gerencie agendamentos, profissionais, expedientes e bloqueios."
            href="/docs/fluxos/servicos"
            color="#9c27b0"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <FeatureCard
            icon={<Buildings size={32} />}
            title="Ambos"
            description="Para negócios que trabalham com produtos E serviços. Tenha acesso a todos os recursos de ambos os modelos."
            href="/docs/fluxos/ambos"
            color="#ff9800"
          />
        </Grid>
      </Grid>

      {/* O que você pode fazer */}
      <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
        O que você pode fazer com o SyncCore
      </Typography>

      <Grid container spacing={2} sx={{ mb: 6 }}>
        {[
          'Cadastrar múltiplas empresas em uma única conta',
          'Gerenciar usuários com diferentes níveis de permissão',
          'Controlar estoque de produtos com variações',
          'Receber e gerenciar pedidos com delivery',
          'Agendar serviços com múltiplos profissionais',
          'Configurar expediente e bloqueios por profissional',
          'Integrar com WhatsApp para atendimento automatizado',
          'Visualizar histórico completo de conversas',
          'Personalizar permissões por papel de usuário',
          'Gerar relatórios e acompanhar métricas',
        ].map((feature, index) => (
          <Grid size={{ xs: 12, sm: 6 }} key={index}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <CheckCircle size={20} color="#4caf50" weight="fill" />
              <Typography variant="body1">{feature}</Typography>
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Começar agora */}
      <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Rocket size={32} style={{ marginRight: 12 }} />
            <Typography variant="h5" fontWeight={600}>
              Pronto para começar?
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
            Siga nosso guia de primeiros passos e tenha sua empresa configurada em poucos minutos.
          </Typography>
          <Box 
            component={Link}
            href="/docs/primeiros-passos"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              bgcolor: 'white',
              color: 'primary.main',
              px: 3,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 600,
              textDecoration: 'none',
              '&:hover': { bgcolor: 'grey.100' },
            }}
          >
            Começar agora
            <ArrowRight size={20} />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
