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
import { ShoppingCart, Info, Warning, WhatsappLogo, CurrencyCircleDollar, CheckCircle } from '@phosphor-icons/react/dist/ssr';

export const metadata = {
  title: 'Pedidos | SyncCore Docs',
};

const campos = [
  {
    campo: 'Cliente',
    tipo: 'Seleção',
    obrigatorio: true,
    descricao: 'O cliente que está fazendo o pedido.',
  },
  {
    campo: 'Endereço de Entrega',
    tipo: 'Seleção',
    obrigatorio: false,
    descricao: 'Endereço para entrega. Obrigatório se pedido for para entrega.',
  },
  {
    campo: 'Tipo',
    tipo: 'Seleção',
    obrigatorio: true,
    descricao: 'Entrega, Retirada no local ou Consumo local.',
  },
  {
    campo: 'Observações',
    tipo: 'Texto',
    obrigatorio: false,
    descricao: 'Instruções especiais do cliente ou do atendente.',
  },
  {
    campo: 'Status',
    tipo: 'Seleção',
    obrigatorio: true,
    descricao: 'Estado atual do pedido no fluxo de atendimento.',
  },
  {
    campo: 'Status Pagamento',
    tipo: 'Seleção',
    obrigatorio: true,
    descricao: 'Estado do pagamento: Pendente, Parcial, Pago.',
  },
];

const statusList = [
  { status: 'Pendente', cor: '#ff9800', descricao: 'Pedido recebido, aguardando confirmação.' },
  { status: 'Confirmado', cor: '#2196f3', descricao: 'Pedido aceito, aguardando preparo.' },
  { status: 'Em Preparo', cor: '#9c27b0', descricao: 'Pedido está sendo preparado.' },
  { status: 'Pronto', cor: '#00bcd4', descricao: 'Pronto para entrega ou retirada.' },
  { status: 'Saiu para Entrega', cor: '#ff5722', descricao: 'Entregador saiu com o pedido.' },
  { status: 'Entregue', cor: '#4caf50', descricao: 'Pedido entregue ao cliente.' },
  { status: 'Cancelado', cor: '#f44336', descricao: 'Pedido cancelado.' },
];

export default function PedidosPage() {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <ShoppingCart size={32} color="#667eea" />
        <Typography variant="h4" fontWeight={700}>
          Pedidos
        </Typography>
        <Chip label="PRODUTO" size="small" sx={{ bgcolor: '#667eea', color: 'white' }} />
        <Chip label="AMBOS" size="small" sx={{ bgcolor: '#ed6c02', color: 'white' }} />
      </Box>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 800 }}>
        O módulo de Pedidos centraliza todas as vendas da empresa. Visualize, gerencie 
        e acompanhe pedidos recebidos via WhatsApp ou criados manualmente.
      </Typography>

      {/* Acesso */}
      <Card variant="outlined" sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            📍 Como Acessar
          </Typography>
          <Typography variant="body1">
            Menu lateral → <strong>Produtos & Pedidos</strong> → <strong>Pedidos</strong> → <strong>Pedidos</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            <strong>Disponível em:</strong> Empresas com modelo "Produto" ou "Ambos".
          </Typography>
        </CardContent>
      </Card>

      {/* Funcionalidades */}
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
        Tela Principal (Lista)
      </Typography>
      
      <Box component="ul" sx={{ mb: 3 }}>
        <li><strong>Filtrar por data:</strong> Veja pedidos de um período específico</li>
        <li><strong>Filtrar por status:</strong> Pendentes, em preparo, entregues, etc.</li>
        <li><strong>Buscar cliente:</strong> Encontre pedidos de um cliente específico</li>
        <li><strong>Novo pedido:</strong> Crie um pedido manualmente</li>
        <li><strong>Ver detalhes:</strong> Veja itens, valores e histórico</li>
        <li><strong>Atualizar status:</strong> Avance o pedido no fluxo</li>
        <li><strong>Registrar pagamento:</strong> Marque como pago</li>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Campos */}
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
        Campos do Pedido
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
        Status do Pedido
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
          <strong>Fluxo típico:</strong> Pendente → Confirmado → Em Preparo → Pronto → Saiu para Entrega → Entregue
        </Typography>
      </Alert>

      <Divider sx={{ my: 4 }} />

      {/* Via WhatsApp */}
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <WhatsappLogo size={24} color="#25d366" />
        Pedidos via WhatsApp
      </Typography>

      <Typography variant="body1" sx={{ mb: 2 }}>
        Com a integração ativa, clientes podem fazer pedidos por mensagem:
      </Typography>

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Box component="ol" sx={{ m: 0, pl: 2.5 }}>
            <li>Cliente inicia conversa pedindo para fazer pedido</li>
            <li>IA apresenta o cardápio/catálogo</li>
            <li>Cliente escolhe produtos, variações e adicionais</li>
            <li>IA confirma endereço (se entrega) ou tipo de retirada</li>
            <li>IA mostra resumo e valor total</li>
            <li>Cliente confirma o pedido</li>
            <li>Pedido é criado automaticamente no sistema</li>
          </Box>
        </CardContent>
      </Card>

      <Alert severity="success" sx={{ mb: 3 }}>
        <Typography variant="body2">
          A IA pode também enviar atualizações de status ao cliente automaticamente.
        </Typography>
      </Alert>

      <Divider sx={{ my: 4 }} />

      {/* Itens do Pedido */}
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
        Itens do Pedido
      </Typography>

      <Typography variant="body1" sx={{ mb: 2 }}>
        Cada pedido contém um ou mais itens:
      </Typography>

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            Cada item possui:
          </Typography>
          <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
            <li><strong>Produto:</strong> Qual produto foi pedido</li>
            <li><strong>Variação:</strong> Tamanho, cor, etc. (se aplicável)</li>
            <li><strong>Quantidade:</strong> Quantas unidades</li>
            <li><strong>Adicionais:</strong> Extras escolhidos</li>
            <li><strong>Preço unitário:</strong> Valor do item</li>
            <li><strong>Observação:</strong> Instruções específicas do item</li>
          </Box>
        </CardContent>
      </Card>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          Gerencie itens em módulos separados: <strong>Itens do Pedido</strong> e 
          <strong> Adicionais do Item</strong>.
        </Typography>
      </Alert>

      <Divider sx={{ my: 4 }} />

      {/* Pagamentos */}
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <CurrencyCircleDollar size={24} />
        Pagamentos
      </Typography>

      <Typography variant="body1" sx={{ mb: 2 }}>
        O status de pagamento acompanha o pedido:
      </Typography>

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
            <li><strong>Pendente:</strong> Nenhum pagamento registrado</li>
            <li><strong>Parcial:</strong> Parte do valor foi paga</li>
            <li><strong>Pago:</strong> Valor total foi recebido</li>
          </Box>
        </CardContent>
      </Card>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          Registre pagamentos no módulo <strong>Pagamentos</strong>. O sistema atualiza 
          automaticamente o status do pedido.
        </Typography>
      </Alert>

      <Divider sx={{ my: 4 }} />

      {/* Dicas */}
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
        Dicas e Avisos
      </Typography>

      <Alert severity="warning" icon={<Warning size={20} />} sx={{ mb: 2 }}>
        <Typography variant="body2">
          <strong>Não é possível excluir</strong> pedidos. Use o status "Cancelado" 
          para preservar o histórico.
        </Typography>
      </Alert>

      <Alert severity="warning" sx={{ mb: 2 }}>
        <Typography variant="body2">
          Ao cancelar um pedido com estoque controlado, lembre-se de fazer o 
          ajuste de estoque se os produtos já foram separados.
        </Typography>
      </Alert>

      <Alert severity="success" sx={{ mb: 2 }}>
        <Typography variant="body2">
          <strong>Dica:</strong> Mantenha os status atualizados para que o cliente 
          receba notificações precisas pelo WhatsApp.
        </Typography>
      </Alert>

      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2">
          Use o campo <strong>Observações</strong> para instruções especiais como 
          "sem cebola", "troco para R$ 50", "ligar antes de entregar".
        </Typography>
      </Alert>
    </Box>
  );
}
