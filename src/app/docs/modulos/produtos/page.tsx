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
import { Package, Info, Warning, Image, Swap, Plus } from '@phosphor-icons/react/dist/ssr';

export const metadata = {
  title: 'Produtos | SyncCore Docs',
};

const campos = [
  {
    campo: 'Nome',
    tipo: 'Texto',
    obrigatorio: true,
    descricao: 'Nome do produto que será exibido para clientes. Ex: "X-Burger", "Shampoo Profissional".',
  },
  {
    campo: 'Descrição',
    tipo: 'Texto longo',
    obrigatorio: false,
    descricao: 'Descrição detalhada do produto, ingredientes, características.',
  },
  {
    campo: 'Categoria',
    tipo: 'Seleção',
    obrigatorio: true,
    descricao: 'Categoria à qual o produto pertence. Organiza a listagem.',
  },
  {
    campo: 'Preço Base',
    tipo: 'Valor (R$)',
    obrigatorio: true,
    descricao: 'Preço padrão do produto. Variações podem ter preços diferentes.',
  },
  {
    campo: 'SKU',
    tipo: 'Texto',
    obrigatorio: false,
    descricao: 'Código único do produto para controle interno (Stock Keeping Unit).',
  },
  {
    campo: 'Código de Barras',
    tipo: 'Texto',
    obrigatorio: false,
    descricao: 'Código de barras EAN para integração com leitores.',
  },
  {
    campo: 'Controla Estoque',
    tipo: 'Sim/Não',
    obrigatorio: false,
    descricao: 'Se marcado, o sistema controla quantidade disponível e impede venda sem estoque.',
  },
  {
    campo: 'Estoque Mínimo',
    tipo: 'Número',
    obrigatorio: false,
    descricao: 'Quantidade mínima para alerta. Abaixo disso, produto aparece como "estoque baixo".',
  },
  {
    campo: 'Imagens',
    tipo: 'Arquivos',
    obrigatorio: false,
    descricao: 'Fotos do produto. A primeira é usada como capa.',
  },
  {
    campo: 'Ativo',
    tipo: 'Sim/Não',
    obrigatorio: true,
    descricao: 'Produtos inativos não aparecem para venda mas mantêm o histórico.',
  },
];

export default function ProdutosPage() {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Package size={32} color="#667eea" />
        <Typography variant="h4" fontWeight={700}>
          Produtos
        </Typography>
        <Chip label="PRODUTO" size="small" sx={{ bgcolor: '#667eea', color: 'white' }} />
        <Chip label="AMBOS" size="small" sx={{ bgcolor: '#ed6c02', color: 'white' }} />
      </Box>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 800 }}>
        O módulo de Produtos é o coração do catálogo de vendas. Cadastre seus produtos 
        com fotos, preços, variações e adicionais para vender via WhatsApp ou atendimento presencial.
      </Typography>

      {/* Acesso */}
      <Card variant="outlined" sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            📍 Como Acessar
          </Typography>
          <Typography variant="body1">
            Menu lateral → <strong>Produtos & Pedidos</strong> → <strong>Produtos</strong> → <strong>Produtos</strong>
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
        <li><strong>Buscar:</strong> Filtre por nome, SKU ou código de barras</li>
        <li><strong>Filtrar por categoria:</strong> Veja produtos de uma categoria específica</li>
        <li><strong>Filtrar por status:</strong> Ativos, inativos ou com estoque baixo</li>
        <li><strong>Novo produto:</strong> Cadastre um novo produto</li>
        <li><strong>Editar:</strong> Altere dados do produto</li>
        <li><strong>Gerenciar variações:</strong> Adicione tamanhos, cores, etc.</li>
        <li><strong>Gerenciar adicionais:</strong> Configure extras opcionais</li>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Campos */}
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

      {/* Variações */}
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Swap size={24} />
        Variações do Produto
      </Typography>

      <Typography variant="body1" sx={{ mb: 2 }}>
        Variações permitem oferecer o mesmo produto em diferentes versões:
      </Typography>

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            Exemplos de variações:
          </Typography>
          <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
            <li><strong>Tamanho:</strong> Pequeno (R$ 15), Médio (R$ 20), Grande (R$ 25)</li>
            <li><strong>Cor:</strong> Preto, Branco, Azul (mesmo preço)</li>
            <li><strong>Sabor:</strong> Chocolate, Morango, Baunilha</li>
            <li><strong>Volume:</strong> 300ml (R$ 10), 500ml (R$ 15), 1L (R$ 25)</li>
          </Box>
        </CardContent>
      </Card>

      <Alert severity="info" icon={<Info size={20} />} sx={{ mb: 3 }}>
        <Typography variant="body2">
          Cada variação pode ter seu próprio preço e controle de estoque independente. 
          Veja mais detalhes em <strong>Variações de Produto</strong>.
        </Typography>
      </Alert>

      <Divider sx={{ my: 4 }} />

      {/* Adicionais */}
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Plus size={24} />
        Adicionais do Produto
      </Typography>

      <Typography variant="body1" sx={{ mb: 2 }}>
        Adicionais são extras que o cliente pode incluir no produto:
      </Typography>

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            Exemplos de adicionais:
          </Typography>
          <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
            <li><strong>Hambúrguer:</strong> +Bacon (R$ 5), +Ovo (R$ 3), +Queijo Extra (R$ 4)</li>
            <li><strong>Pizza:</strong> +Borda recheada (R$ 8), +Catupiry extra (R$ 6)</li>
            <li><strong>Açaí:</strong> +Leite em pó (R$ 2), +Granola (R$ 2), +Frutas (R$ 4)</li>
          </Box>
        </CardContent>
      </Card>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          Adicionais podem ser obrigatórios (cliente deve escolher pelo menos um) 
          ou opcionais. Veja mais em <strong>Adicionais de Produto</strong>.
        </Typography>
      </Alert>

      <Divider sx={{ my: 4 }} />

      {/* Imagens */}
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Image size={24} />
        Imagens do Produto
      </Typography>

      <Box component="ul" sx={{ mb: 3 }}>
        <li>Até 5 imagens por produto</li>
        <li>Formatos: JPG, PNG, WebP</li>
        <li>Tamanho máximo: 5MB por imagem</li>
        <li>A primeira imagem é a capa/principal</li>
        <li>Imagens são comprimidas automaticamente para performance</li>
      </Box>

      <Alert severity="success" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Dica:</strong> Fotos de qualidade aumentam significativamente as vendas. 
          Use fundo claro e boa iluminação.
        </Typography>
      </Alert>

      <Divider sx={{ my: 4 }} />

      {/* Controle de Estoque */}
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
        Controle de Estoque
      </Typography>

      <Typography variant="body1" sx={{ mb: 2 }}>
        Quando "Controla Estoque" está ativado:
      </Typography>

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
            <li>O sistema desconta automaticamente ao realizar vendas</li>
            <li>Produto com estoque zero não aparece como disponível</li>
            <li>Alertas são gerados quando atinge o estoque mínimo</li>
            <li>Você precisa registrar entradas no módulo de Estoque</li>
          </Box>
        </CardContent>
      </Card>

      <Alert severity="warning" sx={{ mb: 3 }}>
        <Typography variant="body2">
          Se você não quer controlar estoque (ex: alimentos preparados na hora), 
          deixe "Controla Estoque" desativado.
        </Typography>
      </Alert>

      <Divider sx={{ my: 4 }} />

      {/* Dicas */}
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
        Dicas e Avisos
      </Typography>

      <Alert severity="warning" icon={<Warning size={20} />} sx={{ mb: 2 }}>
        <Typography variant="body2">
          <strong>Não é possível excluir</strong> um produto que já tem pedidos. 
          Desative-o para preservar o histórico.
        </Typography>
      </Alert>

      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2">
          O <strong>SKU</strong> e <strong>Código de Barras</strong> são opcionais mas 
          ajudam muito no controle interno e conferência de estoque.
        </Typography>
      </Alert>

      <Alert severity="success" sx={{ mb: 2 }}>
        <Typography variant="body2">
          <strong>Dica:</strong> Uma boa descrição ajuda o agente de IA a responder 
          perguntas dos clientes sobre ingredientes e características.
        </Typography>
      </Alert>

      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2">
          Para produtos com muitas variações e adicionais, considere criar combos 
          pré-montados como produtos separados para simplificar o pedido.
        </Typography>
      </Alert>
    </Box>
  );
}
