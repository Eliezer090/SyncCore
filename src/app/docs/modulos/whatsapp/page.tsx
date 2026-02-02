import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import { WhatsappLogo, Robot, ChatCircleDots, Clock, Warning } from '@phosphor-icons/react/dist/ssr';

export const metadata = {
  title: 'Integração WhatsApp | SyncCore Docs',
};

export default function WhatsAppPage() {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <WhatsappLogo size={32} color="#25d366" weight="fill" />
        <Typography variant="h4" fontWeight={700}>
          Integração WhatsApp
        </Typography>
        <Chip label="Configurações" size="small" />
      </Box>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 800 }}>
        A integração com WhatsApp permite que clientes façam pedidos e agendamentos 
        por mensagem, com atendimento automatizado por inteligência artificial.
      </Typography>

      {/* Como Funciona */}
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
        Como Funciona
      </Typography>

      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          <ChatCircleDots size={32} color="#25d366" />
          <Box>
            <Typography variant="subtitle1" fontWeight={600}>1. Cliente envia mensagem</Typography>
            <Typography variant="body2" color="text.secondary">
              O cliente envia uma mensagem para o número de WhatsApp da empresa.
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          <Robot size={32} color="#667eea" />
          <Box>
            <Typography variant="subtitle1" fontWeight={600}>2. IA processa a mensagem</Typography>
            <Typography variant="body2" color="text.secondary">
              O agente de inteligência artificial analisa a mensagem, entende a intenção 
              e consulta os dados da empresa (produtos, serviços, disponibilidade).
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          <Clock size={32} color="#ff9800" />
          <Box>
            <Typography variant="subtitle1" fontWeight={600}>3. Resposta automática</Typography>
            <Typography variant="body2" color="text.secondary">
              A IA responde em segundos com informações precisas, preços, horários 
              disponíveis ou confirmação de pedido/agendamento.
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <Divider sx={{ my: 4 }} />

      {/* Recursos */}
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
        O Que a IA Pode Fazer
      </Typography>

      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            📋 Informações
          </Typography>
          <Typography variant="body2">
            Responder perguntas sobre produtos, preços, horários de funcionamento, 
            localização, formas de pagamento e políticas da empresa.
          </Typography>
        </CardContent>
      </Card>

      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            🛒 Pedidos (Modelo Produto/Ambos)
          </Typography>
          <Typography variant="body2">
            Mostrar cardápio/catálogo, receber pedidos com variações e adicionais, 
            calcular valores, confirmar endereço de entrega e registrar o pedido no sistema.
          </Typography>
        </CardContent>
      </Card>

      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            📅 Agendamentos (Modelo Serviço/Ambos)
          </Typography>
          <Typography variant="body2">
            Mostrar serviços disponíveis, consultar horários livres, permitir escolha 
            de profissional, agendar e confirmar automaticamente.
          </Typography>
        </CardContent>
      </Card>

      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            📊 Acompanhamento
          </Typography>
          <Typography variant="body2">
            Informar status do pedido, enviar lembretes de agendamento, 
            confirmar presença e notificar sobre mudanças.
          </Typography>
        </CardContent>
      </Card>

      <Divider sx={{ my: 4 }} />

      {/* Configuração */}
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
        Configuração
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          A integração com WhatsApp utiliza a <strong>Evolution API</strong>. 
          A configuração é feita pelo administrador do sistema.
        </Typography>
      </Alert>

      <Typography variant="body1" sx={{ mb: 2 }}>
        Para configurar a integração:
      </Typography>

      <Box component="ol" sx={{ mb: 3 }}>
        <li>Certifique-se de ter uma instância da Evolution API configurada</li>
        <li>Conecte o número de WhatsApp da empresa via QR Code</li>
        <li>Configure o webhook para apontar para o SyncCore</li>
        <li>Adicione uma descrição detalhada da empresa no cadastro</li>
        <li>A IA usará essa descrição para responder perguntas</li>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Histórico */}
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
        Histórico de Conversas
      </Typography>

      <Typography variant="body1" sx={{ mb: 2 }}>
        Todas as conversas são registradas no sistema:
      </Typography>

      <Box component="ul" sx={{ mb: 3 }}>
        <li><strong>Acesso:</strong> Geral → Histórico de Conversas</li>
        <li>Veja todas as mensagens enviadas e recebidas</li>
        <li>Identifique o cliente de cada conversa</li>
        <li>Acompanhe pedidos e agendamentos originados da conversa</li>
        <li>Filtre por data, cliente ou status</li>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Dicas */}
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
        Dicas de Uso
      </Typography>

      <Alert severity="success" sx={{ mb: 2 }}>
        <Typography variant="body2">
          <strong>Descrição da empresa:</strong> Quanto mais detalhada a descrição 
          no cadastro da empresa, melhor a IA responde. Inclua: horários, 
          formas de pagamento, políticas, diferenciais, etc.
        </Typography>
      </Alert>

      <Alert severity="success" sx={{ mb: 2 }}>
        <Typography variant="body2">
          <strong>Descrições de produtos/serviços:</strong> Preencha descrições 
          completas com ingredientes, características e informações relevantes.
        </Typography>
      </Alert>

      <Alert severity="warning" icon={<Warning size={20} />} sx={{ mb: 2 }}>
        <Typography variant="body2">
          <strong>Mantenha preços atualizados:</strong> A IA informa preços 
          conforme cadastrados no sistema. Preços desatualizados podem gerar 
          problemas com clientes.
        </Typography>
      </Alert>

      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2">
          A IA responde em português, mas pode entender mensagens em outros idiomas. 
          Ela sempre responde no mesmo idioma da mensagem recebida.
        </Typography>
      </Alert>
    </Box>
  );
}
