'use client';

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
import Stack from '@mui/material/Stack';
import { 
  CreditCard,
  Money,
  Bank,
  QrCode,
  CheckCircle,
  Info,
  Warning,
  Lightbulb,
  Receipt,
  ArrowsClockwise,
  Clock,
  XCircle,
} from '@phosphor-icons/react';

interface CampoInfo {
  nome: string;
  tipo: string;
  obrigatorio: boolean;
  descricao: string;
}

const camposPagamento: CampoInfo[] = [
  { nome: 'Pedido', tipo: 'Seleção', obrigatorio: true, descricao: 'Pedido ao qual este pagamento se refere. Vincula automaticamente ao selecionar o pedido' },
  { nome: 'Valor', tipo: 'Moeda (R$)', obrigatorio: true, descricao: 'Valor do pagamento. Pode ser parcial (menor que o total) ou total do pedido' },
  { nome: 'Forma de Pagamento', tipo: 'Seleção', obrigatorio: true, descricao: 'Método utilizado: Dinheiro, PIX, Cartão de Crédito, Cartão de Débito, Transferência, etc.' },
  { nome: 'Status', tipo: 'Seleção', obrigatorio: true, descricao: 'Situação do pagamento: Pendente, Aprovado, Recusado, Estornado, Cancelado' },
  { nome: 'Data/Hora', tipo: 'Data e Hora', obrigatorio: true, descricao: 'Momento em que o pagamento foi registrado. Preenchido automaticamente' },
  { nome: 'Código de Transação', tipo: 'Texto', obrigatorio: false, descricao: 'Código ou número de autorização da transação para rastreabilidade' },
  { nome: 'Parcelas', tipo: 'Número', obrigatorio: false, descricao: 'Quantidade de parcelas (apenas para cartão de crédito). Se vazio, considera à vista' },
  { nome: 'Troco', tipo: 'Moeda (R$)', obrigatorio: false, descricao: 'Valor do troco a ser devolvido (apenas para pagamento em dinheiro)' },
  { nome: 'Observações', tipo: 'Texto', obrigatorio: false, descricao: 'Informações adicionais sobre o pagamento (ex: última parcela, pagamento antecipado)' },
];

const formasPagamento = [
  { nome: 'Dinheiro', icone: <Money size={20} />, cor: '#22c55e', descricao: 'Pagamento em espécie. Sistema calcula troco automaticamente' },
  { nome: 'PIX', icone: <QrCode size={20} />, cor: '#00b894', descricao: 'Transferência instantânea via PIX. Confirmação em tempo real' },
  { nome: 'Cartão de Crédito', icone: <CreditCard size={20} />, cor: '#667eea', descricao: 'Pode ser parcelado. Registre o código de autorização' },
  { nome: 'Cartão de Débito', icone: <CreditCard size={20} />, cor: '#764ba2', descricao: 'Débito direto na conta. Sempre à vista' },
  { nome: 'Transferência Bancária', icone: <Bank size={20} />, cor: '#f59e0b', descricao: 'TED, DOC ou transferência entre contas. Pode demorar para compensar' },
];

const statusPagamento = [
  { status: 'Pendente', icone: <Clock size={20} />, cor: '#f59e0b', descricao: 'Aguardando confirmação ou processamento' },
  { status: 'Aprovado', icone: <CheckCircle size={20} />, cor: '#22c55e', descricao: 'Pagamento confirmado e aceito' },
  { status: 'Recusado', icone: <XCircle size={20} />, cor: '#ef4444', descricao: 'Pagamento negado pela operadora' },
  { status: 'Estornado', icone: <ArrowsClockwise size={20} />, cor: '#3b82f6', descricao: 'Valor devolvido ao cliente' },
  { status: 'Cancelado', icone: <XCircle size={20} />, cor: '#6b7280', descricao: 'Pagamento cancelado antes de completar' },
];

export default function PagamentosPage() {
  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <CreditCard size={40} weight="duotone" color="#667eea" />
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Módulo de Pagamentos
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Registro e controle de pagamentos dos pedidos
            </Typography>
          </Box>
        </Stack>
        
        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <Chip 
            label="Produtos" 
            size="small" 
            sx={{ bgcolor: '#667eea', color: 'white' }}
          />
          <Chip 
            label="Ambos" 
            size="small" 
            sx={{ bgcolor: '#ed6c02', color: 'white' }}
          />
        </Stack>
      </Box>

      <Divider sx={{ mb: 4 }} />

      {/* Visão Geral */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            💳 Visão Geral
          </Typography>
          <Typography paragraph>
            O módulo de <strong>Pagamentos</strong> permite registrar e acompanhar todos os pagamentos 
            recebidos dos pedidos. Um pedido pode ter <strong>múltiplos pagamentos</strong>, 
            possibilitando divisão entre diferentes formas de pagamento.
          </Typography>
          <Typography paragraph>
            O sistema suporta diversas formas de pagamento como dinheiro, PIX, cartões e transferências, 
            com controle de status e histórico completo de transações.
          </Typography>
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Pagamento parcial:</strong> É possível registrar pagamentos parciais. O sistema calcula 
              automaticamente o saldo restante do pedido.
            </Typography>
          </Alert>
        </CardContent>
      </Card>

      {/* Como Acessar */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            🔗 Como Acessar
          </Typography>
          <Typography paragraph>
            Os pagamentos podem ser acessados de duas formas:
          </Typography>
          <Box sx={{ 
            bgcolor: 'grey.100', 
            p: 2, 
            borderRadius: 1, 
            fontFamily: 'monospace',
            mb: 2
          }}>
            Menu lateral → Pedidos → Selecionar pedido → Aba "Pagamentos"
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Ou diretamente pelo menu (se disponível):
          </Typography>
          <Box sx={{ 
            bgcolor: 'grey.100', 
            p: 2, 
            borderRadius: 1, 
            fontFamily: 'monospace'
          }}>
            Menu lateral → Financeiro → Pagamentos
          </Box>
        </CardContent>
      </Card>

      {/* Campos do Cadastro */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            📝 Campos do Cadastro
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.100' }}>
                  <TableCell><strong>Campo</strong></TableCell>
                  <TableCell><strong>Tipo</strong></TableCell>
                  <TableCell align="center"><strong>Obrigatório</strong></TableCell>
                  <TableCell><strong>Descrição</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {camposPagamento.map((campo) => (
                  <TableRow key={campo.nome} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">{campo.nome}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={campo.tipo} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell align="center">
                      {campo.obrigatorio ? (
                        <CheckCircle size={18} color="#22c55e" weight="fill" />
                      ) : (
                        <Typography variant="body2" color="text.secondary">—</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{campo.descricao}</Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Formas de Pagamento */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            💰 Formas de Pagamento
          </Typography>
          <Typography paragraph>
            O sistema suporta as seguintes formas de pagamento:
          </Typography>
          
          <Stack spacing={2}>
            {formasPagamento.map((forma) => (
              <Paper 
                key={forma.nome} 
                variant="outlined" 
                sx={{ 
                  p: 2, 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: 2,
                  borderLeft: `4px solid ${forma.cor}`,
                }}
              >
                <Box sx={{ color: forma.cor, mt: 0.5 }}>{forma.icone}</Box>
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold">{forma.nome}</Typography>
                  <Typography variant="body2" color="text.secondary">{forma.descricao}</Typography>
                </Box>
              </Paper>
            ))}
          </Stack>
        </CardContent>
      </Card>

      {/* Status do Pagamento */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            📊 Status do Pagamento
          </Typography>
          <Typography paragraph>
            Cada pagamento passa por um ciclo de status:
          </Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            {statusPagamento.map((s) => (
              <Paper 
                key={s.status} 
                variant="outlined" 
                sx={{ 
                  p: 2, 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 2,
                }}
              >
                <Box sx={{ color: s.cor }}>{s.icone}</Box>
                <Box>
                  <Chip 
                    label={s.status} 
                    size="small" 
                    sx={{ bgcolor: s.cor, color: 'white', mb: 0.5 }} 
                  />
                  <Typography variant="body2" color="text.secondary">{s.descricao}</Typography>
                </Box>
              </Paper>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Pagamento em Dinheiro */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            <Money size={24} style={{ verticalAlign: 'middle', marginRight: 8 }} />
            Pagamento em Dinheiro
          </Typography>
          <Typography paragraph>
            Para pagamentos em dinheiro, o sistema oferece cálculo automático de troco:
          </Typography>
          
          <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50', mb: 2 }}>
            <Typography variant="body2" fontFamily="monospace" textAlign="center">
              <strong>Troco</strong> = Valor Recebido - Valor do Pedido
            </Typography>
          </Paper>
          
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            Exemplo Prático:
          </Typography>
          
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell>Total do Pedido</TableCell>
                  <TableCell align="right">R$ 87,50</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Valor Recebido</TableCell>
                  <TableCell align="right">R$ 100,00</TableCell>
                </TableRow>
                <TableRow sx={{ bgcolor: 'warning.lighter' }}>
                  <TableCell><strong>Troco a Devolver</strong></TableCell>
                  <TableCell align="right"><strong>R$ 12,50</strong></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Pagamento Parcelado */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            <CreditCard size={24} style={{ verticalAlign: 'middle', marginRight: 8 }} />
            Pagamento Parcelado
          </Typography>
          <Typography paragraph>
            Para <strong>cartão de crédito</strong>, é possível registrar parcelamentos:
          </Typography>
          
          <Box sx={{ pl: 2, mb: 2 }}>
            <ul style={{ margin: 0, paddingLeft: 16 }}>
              <li><Typography variant="body2" sx={{ mb: 1 }}>Informe o número de parcelas no campo correspondente</Typography></li>
              <li><Typography variant="body2" sx={{ mb: 1 }}>O valor de cada parcela é calculado automaticamente</Typography></li>
              <li><Typography variant="body2" sx={{ mb: 1 }}>Registre o código de autorização da maquininha</Typography></li>
            </ul>
          </Box>

          <Alert severity="info">
            <Typography variant="body2">
              O sistema registra o parcelamento para controle, mas o recebimento das parcelas depende 
              da sua operadora de cartão.
            </Typography>
          </Alert>
        </CardContent>
      </Card>

      {/* Pagamento Dividido */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            <Receipt size={24} style={{ verticalAlign: 'middle', marginRight: 8 }} />
            Pagamento Dividido (Split)
          </Typography>
          <Typography paragraph>
            Um pedido pode ter <strong>múltiplos pagamentos</strong> em diferentes formas:
          </Typography>
          
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            Exemplo - Dividir conta:
          </Typography>
          
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.100' }}>
                  <TableCell><strong>Forma</strong></TableCell>
                  <TableCell align="right"><strong>Valor</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Pagamento 1: Cartão de Crédito</TableCell>
                  <TableCell align="right">R$ 50,00</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Pagamento 2: PIX</TableCell>
                  <TableCell align="right">R$ 30,00</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Pagamento 3: Dinheiro</TableCell>
                  <TableCell align="right">R$ 20,00</TableCell>
                </TableRow>
                <TableRow sx={{ bgcolor: 'success.lighter' }}>
                  <TableCell><strong>Total Pago</strong></TableCell>
                  <TableCell align="right"><strong>R$ 100,00</strong></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <Alert severity="success">
            <Typography variant="body2">
              O sistema soma automaticamente todos os pagamentos e verifica se o total do pedido foi quitado.
            </Typography>
          </Alert>
        </CardContent>
      </Card>

      {/* Estornos */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            <ArrowsClockwise size={24} style={{ verticalAlign: 'middle', marginRight: 8 }} />
            Estornos e Cancelamentos
          </Typography>
          <Typography paragraph>
            Para devolver um pagamento ao cliente:
          </Typography>
          
          <Box sx={{ pl: 2 }}>
            <ol style={{ margin: 0, paddingLeft: 16 }}>
              <li><Typography variant="body2" sx={{ mb: 1 }}>Acesse o pagamento que deseja estornar</Typography></li>
              <li><Typography variant="body2" sx={{ mb: 1 }}>Altere o status para "Estornado"</Typography></li>
              <li><Typography variant="body2" sx={{ mb: 1 }}>Adicione uma observação explicando o motivo</Typography></li>
              <li><Typography variant="body2" sx={{ mb: 1 }}>O saldo do pedido será atualizado automaticamente</Typography></li>
            </ol>
          </Box>

          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Atenção:</strong> O estorno no sistema é apenas um registro. Para pagamentos em cartão, 
              o estorno deve ser feito também na maquininha/operadora.
            </Typography>
          </Alert>
        </CardContent>
      </Card>

      {/* Dicas e Avisos */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            💡 Dicas e Avisos
          </Typography>
          
          <Stack spacing={2}>
            <Alert severity="success" icon={<Lightbulb size={20} />}>
              <Typography variant="body2">
                <strong>Código de transação:</strong> Sempre registre o código de autorização do cartão 
                ou o ID da transação PIX. Facilita a conferência e resolução de disputas.
              </Typography>
            </Alert>
            
            <Alert severity="info" icon={<Info size={20} />}>
              <Typography variant="body2">
                <strong>Conferência diária:</strong> Ao fechar o caixa, compare os pagamentos registrados 
                no sistema com os valores recebidos nas maquininhas e conta bancária (PIX).
              </Typography>
            </Alert>
            
            <Alert severity="warning" icon={<Warning size={20} />}>
              <Typography variant="body2">
                <strong>Pagamento pendente:</strong> Pedidos com pagamento pendente devem ser acompanhados. 
                Confirme o recebimento antes de entregar o produto/serviço.
              </Typography>
            </Alert>
            
            <Alert severity="info" icon={<Info size={20} />}>
              <Typography variant="body2">
                <strong>Relatórios:</strong> Use os filtros por forma de pagamento e período para gerar 
                relatórios de vendas e conferir o fechamento de caixa.
              </Typography>
            </Alert>
            
            <Alert severity="success" icon={<Lightbulb size={20} />}>
              <Typography variant="body2">
                <strong>PIX instantâneo:</strong> Para pagamentos PIX, aguarde a confirmação na conta 
                antes de marcar como "Aprovado". A transferência é instantânea.
              </Typography>
            </Alert>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
