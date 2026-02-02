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
import { Cube, Info, Warning } from '@phosphor-icons/react/dist/ssr';

export const metadata = {
  title: 'Estoque | SyncCore Docs',
};

const campos = [
  {
    campo: 'Produto',
    tipo: 'Seleção',
    obrigatorio: true,
    descricao: 'O produto para o qual será registrada a movimentação.',
  },
  {
    campo: 'Variação',
    tipo: 'Seleção',
    obrigatorio: false,
    descricao: 'Se o produto tem variações, selecione qual. Ex: "Tamanho M", "Cor Preta".',
  },
  {
    campo: 'Tipo de Movimentação',
    tipo: 'Seleção',
    obrigatorio: true,
    descricao: 'Entrada (compra, devolução) ou Saída (venda, perda).',
  },
  {
    campo: 'Quantidade',
    tipo: 'Número',
    obrigatorio: true,
    descricao: 'Quantidade sendo movimentada. Sempre positivo.',
  },
  {
    campo: 'Motivo',
    tipo: 'Texto',
    obrigatorio: false,
    descricao: 'Descrição da movimentação. Ex: "Compra fornecedor X", "Perda por validade".',
  },
  {
    campo: 'Data',
    tipo: 'Data',
    obrigatorio: true,
    descricao: 'Data da movimentação. Padrão: data atual.',
  },
];

const tiposMovimentacao = [
  { tipo: 'Entrada - Compra', descricao: 'Mercadoria recebida de fornecedor.' },
  { tipo: 'Entrada - Devolução', descricao: 'Cliente devolveu produto.' },
  { tipo: 'Entrada - Ajuste', descricao: 'Correção de inventário para mais.' },
  { tipo: 'Saída - Venda', descricao: 'Produto vendido (automático nos pedidos).' },
  { tipo: 'Saída - Perda', descricao: 'Produto perdido, vencido ou danificado.' },
  { tipo: 'Saída - Ajuste', descricao: 'Correção de inventário para menos.' },
];

export default function EstoquePage() {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Cube size={32} color="#667eea" />
        <Typography variant="h4" fontWeight={700}>
          Estoque
        </Typography>
        <Chip label="PRODUTO" size="small" sx={{ bgcolor: '#667eea', color: 'white' }} />
        <Chip label="AMBOS" size="small" sx={{ bgcolor: '#ed6c02', color: 'white' }} />
      </Box>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 800 }}>
        O módulo de Estoque controla a quantidade disponível de cada produto e variação. 
        Registre entradas de compras e o sistema desconta automaticamente nas vendas.
      </Typography>

      {/* Acesso */}
      <Card variant="outlined" sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            📍 Como Acessar
          </Typography>
          <Typography variant="body1">
            Menu lateral → <strong>Produtos & Pedidos</strong> → <strong>Produtos</strong> → <strong>Estoque</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            <strong>Disponível em:</strong> Empresas com modelo "Produto" ou "Ambos".
          </Typography>
        </CardContent>
      </Card>

      {/* Quando usar */}
      <Alert severity="info" icon={<Info size={20} />} sx={{ mb: 4 }}>
        <Typography variant="body2">
          O controle de estoque é <strong>opcional</strong>. Só é aplicado a produtos 
          que estão com "Controla Estoque" ativado no cadastro.
        </Typography>
      </Alert>

      {/* Funcionalidades */}
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
        Tela Principal
      </Typography>
      
      <Box component="ul" sx={{ mb: 3 }}>
        <li><strong>Visão geral:</strong> Veja quantidade atual de todos os produtos</li>
        <li><strong>Filtrar por categoria:</strong> Foque em uma categoria específica</li>
        <li><strong>Produtos com estoque baixo:</strong> Veja os que precisam de reposição</li>
        <li><strong>Nova movimentação:</strong> Registre entrada ou saída manual</li>
        <li><strong>Histórico:</strong> Veja todas as movimentações de um produto</li>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Campos */}
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
        Campos da Movimentação
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

      {/* Tipos de Movimentação */}
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
        Tipos de Movimentação
      </Typography>

      <TableContainer component={Paper} variant="outlined" sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'action.hover' }}>
              <TableCell><strong>Tipo</strong></TableCell>
              <TableCell><strong>Descrição</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tiposMovimentacao.map((t) => (
              <TableRow key={t.tipo}>
                <TableCell sx={{ fontWeight: 500 }}>
                  <Chip 
                    label={t.tipo} 
                    size="small" 
                    color={t.tipo.startsWith('Entrada') ? 'success' : 'error'}
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>{t.descricao}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Divider sx={{ my: 4 }} />

      {/* Automático vs Manual */}
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
        Movimentações Automáticas vs Manuais
      </Typography>

      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            🤖 Automáticas (o sistema faz)
          </Typography>
          <Typography variant="body2">
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              <li><strong>Saída - Venda:</strong> Quando um pedido é confirmado</li>
              <li><strong>Entrada - Devolução:</strong> Quando um pedido é cancelado (configurável)</li>
            </ul>
          </Typography>
        </CardContent>
      </Card>

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            ✋ Manuais (você registra)
          </Typography>
          <Typography variant="body2">
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              <li><strong>Entrada - Compra:</strong> Recebeu mercadoria do fornecedor</li>
              <li><strong>Saída - Perda:</strong> Produto venceu, quebrou ou foi perdido</li>
              <li><strong>Ajustes:</strong> Correções após inventário físico</li>
            </ul>
          </Typography>
        </CardContent>
      </Card>

      <Divider sx={{ my: 4 }} />

      {/* Estoque por Variação */}
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
        Estoque por Variação
      </Typography>

      <Typography variant="body1" sx={{ mb: 2 }}>
        Se o produto tem variações, cada uma tem seu próprio estoque:
      </Typography>

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            <strong>Exemplo - Camiseta:</strong>
          </Typography>
          <Box sx={{ fontFamily: 'monospace', fontSize: '0.85rem', bgcolor: 'grey.100', p: 2, borderRadius: 1 }}>
            <Box>Camiseta Preta - Tamanho P: 15 unidades</Box>
            <Box>Camiseta Preta - Tamanho M: 23 unidades</Box>
            <Box>Camiseta Preta - Tamanho G: 8 unidades</Box>
            <Box>Camiseta Branca - Tamanho P: 20 unidades</Box>
            <Box>Camiseta Branca - Tamanho M: 0 unidades ⚠️</Box>
          </Box>
        </CardContent>
      </Card>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          Ao registrar entrada de compra, especifique a variação para ter controle preciso.
        </Typography>
      </Alert>

      <Divider sx={{ my: 4 }} />

      {/* Alertas */}
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
        Alertas de Estoque
      </Typography>

      <Typography variant="body1" sx={{ mb: 2 }}>
        O sistema alerta quando:
      </Typography>

      <Box component="ul" sx={{ mb: 3 }}>
        <li><strong>Estoque Baixo:</strong> Quantidade igual ou menor que o estoque mínimo configurado</li>
        <li><strong>Sem Estoque:</strong> Quantidade zerada - produto não aparece como disponível</li>
      </Box>

      <Alert severity="warning" sx={{ mb: 3 }}>
        <Typography variant="body2">
          Configure o <strong>Estoque Mínimo</strong> no cadastro do produto para receber 
          alertas antes de zerar. Ex: se estoque mínimo = 5, você é alertado quando 
          chegar a 5 unidades.
        </Typography>
      </Alert>

      <Divider sx={{ my: 4 }} />

      {/* Dicas */}
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
        Dicas e Avisos
      </Typography>

      <Alert severity="warning" icon={<Warning size={20} />} sx={{ mb: 2 }}>
        <Typography variant="body2">
          <strong>Movimentações não podem ser excluídas.</strong> Se cometeu um erro, 
          faça uma movimentação de ajuste para corrigir.
        </Typography>
      </Alert>

      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2">
          Faça inventário físico regularmente e use ajustes para sincronizar 
          o estoque do sistema com o real.
        </Typography>
      </Alert>

      <Alert severity="success" sx={{ mb: 2 }}>
        <Typography variant="body2">
          <strong>Dica:</strong> Ao receber mercadoria, registre a entrada antes de colocar 
          na prateleira. Assim o sistema já considera disponível para venda.
        </Typography>
      </Alert>

      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2">
          Use o campo <strong>Motivo</strong> para documentar a movimentação. 
          Ajuda na análise de perdas e controle interno.
        </Typography>
      </Alert>
    </Box>
  );
}
