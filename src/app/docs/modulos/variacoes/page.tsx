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
  Palette,
  TShirt,
  Ruler,
  CheckCircle,
  Info,
  Warning,
  Lightbulb,
  Tag,
  CurrencyDollar,
  Package,
} from '@phosphor-icons/react';

interface CampoInfo {
  nome: string;
  tipo: string;
  obrigatorio: boolean;
  descricao: string;
}

const camposVariacao: CampoInfo[] = [
  { nome: 'Produto', tipo: 'Seleção', obrigatorio: true, descricao: 'Produto ao qual esta variação pertence. Uma variação sempre está vinculada a um produto específico' },
  { nome: 'Nome da Variação', tipo: 'Texto', obrigatorio: true, descricao: 'Identificação da variação (ex: "Vermelho - P", "Azul - M", "Branco - G")' },
  { nome: 'SKU', tipo: 'Texto', obrigatorio: false, descricao: 'Código único de identificação da variação para controle de estoque e inventário' },
  { nome: 'Código de Barras', tipo: 'Texto', obrigatorio: false, descricao: 'Código EAN/GTIN para leitura em caixa e integração com sistemas de PDV' },
  { nome: 'Preço', tipo: 'Moeda (R$)', obrigatorio: true, descricao: 'Preço de venda específico desta variação. Pode ser diferente do preço base do produto' },
  { nome: 'Preço Promocional', tipo: 'Moeda (R$)', obrigatorio: false, descricao: 'Preço com desconto para promoções. Se preenchido, será exibido como preço atual' },
  { nome: 'Custo', tipo: 'Moeda (R$)', obrigatorio: false, descricao: 'Custo de aquisição/produção da variação para cálculo de margem de lucro' },
  { nome: 'Estoque', tipo: 'Número', obrigatorio: true, descricao: 'Quantidade disponível em estoque desta variação específica' },
  { nome: 'Estoque Mínimo', tipo: 'Número', obrigatorio: false, descricao: 'Quantidade mínima para alertas de reposição. Sistema avisa quando atingir esse valor' },
  { nome: 'Peso', tipo: 'Número (kg)', obrigatorio: false, descricao: 'Peso da variação para cálculo de frete em entregas' },
  { nome: 'Ativo', tipo: 'Switch', obrigatorio: false, descricao: 'Define se a variação está disponível para venda. Variações inativas não aparecem para o cliente' },
];

const exemplosVariacao = [
  {
    categoria: 'Vestuário',
    icone: <TShirt size={24} />,
    cor: '#667eea',
    produto: 'Camiseta Básica',
    variacoes: [
      { nome: 'Preta - P', preco: 'R$ 49,90', estoque: 15 },
      { nome: 'Preta - M', preco: 'R$ 49,90', estoque: 20 },
      { nome: 'Preta - G', preco: 'R$ 54,90', estoque: 12 },
      { nome: 'Branca - P', preco: 'R$ 44,90', estoque: 8 },
      { nome: 'Branca - M', preco: 'R$ 44,90', estoque: 25 },
    ],
  },
  {
    categoria: 'Eletrônicos',
    icone: <Package size={24} />,
    cor: '#22c55e',
    produto: 'Smartphone XYZ',
    variacoes: [
      { nome: '64GB - Preto', preco: 'R$ 1.999,00', estoque: 5 },
      { nome: '128GB - Preto', preco: 'R$ 2.299,00', estoque: 8 },
      { nome: '64GB - Branco', preco: 'R$ 1.999,00', estoque: 3 },
      { nome: '128GB - Branco', preco: 'R$ 2.299,00', estoque: 6 },
    ],
  },
  {
    categoria: 'Calçados',
    icone: <Ruler size={24} />,
    cor: '#f59e0b',
    produto: 'Tênis Esportivo',
    variacoes: [
      { nome: 'Nº 38', preco: 'R$ 299,90', estoque: 4 },
      { nome: 'Nº 39', preco: 'R$ 299,90', estoque: 6 },
      { nome: 'Nº 40', preco: 'R$ 299,90', estoque: 8 },
      { nome: 'Nº 41', preco: 'R$ 299,90', estoque: 5 },
      { nome: 'Nº 42', preco: 'R$ 299,90', estoque: 3 },
    ],
  },
];

export default function VariacoesPage() {
  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Palette size={40} weight="duotone" color="#667eea" />
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Variações de Produtos
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Gerenciamento de tamanhos, cores e outras variantes
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
            🎨 Visão Geral
          </Typography>
          <Typography paragraph>
            As <strong>Variações</strong> permitem que um mesmo produto tenha diferentes versões, como 
            tamanhos, cores, capacidades de armazenamento ou outras características que definem opções distintas.
          </Typography>
          <Typography paragraph>
            Cada variação pode ter seu próprio <strong>preço</strong>, <strong>estoque</strong>, <strong>SKU</strong> e 
            <strong> código de barras</strong>, permitindo controle individualizado mesmo sendo parte de um mesmo produto.
          </Typography>
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Exemplo:</strong> Uma "Camiseta Básica" pode ter variações como "Preta - P", "Preta - M", 
              "Branca - G", cada uma com seu próprio estoque e, opcionalmente, preços diferentes.
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
            As variações são gerenciadas através do cadastro de produtos:
          </Typography>
          <Box sx={{ 
            bgcolor: 'grey.100', 
            p: 2, 
            borderRadius: 1, 
            fontFamily: 'monospace',
            mb: 2
          }}>
            Menu lateral → Produtos → Selecionar produto → Aba "Variações"
          </Box>
          <Typography variant="body2" color="text.secondary">
            Também é possível acessar via Produtos → botão "Variações" na linha do produto desejado.
          </Typography>
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
                {camposVariacao.map((campo) => (
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

      {/* Exemplos de Variações */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            📦 Exemplos de Variações por Categoria
          </Typography>
          <Typography paragraph>
            Veja como diferentes tipos de produtos podem usar variações:
          </Typography>
          
          <Stack spacing={3}>
            {exemplosVariacao.map((exemplo) => (
              <Paper 
                key={exemplo.categoria} 
                variant="outlined" 
                sx={{ p: 2, borderLeft: `4px solid ${exemplo.cor}` }}
              >
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                  <Box sx={{ color: exemplo.cor }}>{exemplo.icone}</Box>
                  <Typography variant="subtitle1" fontWeight="bold">{exemplo.categoria}</Typography>
                  <Chip label={exemplo.produto} size="small" />
                </Stack>
                
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Variação</strong></TableCell>
                        <TableCell><strong>Preço</strong></TableCell>
                        <TableCell align="right"><strong>Estoque</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {exemplo.variacoes.map((v) => (
                        <TableRow key={v.nome} hover>
                          <TableCell>{v.nome}</TableCell>
                          <TableCell>{v.preco}</TableCell>
                          <TableCell align="right">{v.estoque} un.</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            ))}
          </Stack>
        </CardContent>
      </Card>

      {/* Preços por Variação */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            <CurrencyDollar size={24} style={{ verticalAlign: 'middle', marginRight: 8 }} />
            Preços por Variação
          </Typography>
          <Typography paragraph>
            Cada variação pode ter seu próprio preço, o que permite:
          </Typography>
          
          <Box sx={{ pl: 2, mb: 2 }}>
            <ul style={{ margin: 0, paddingLeft: 16 }}>
              <li><Typography variant="body2" sx={{ mb: 1 }}>Cobrar mais por tamanhos maiores (ex: GG custa mais que P)</Typography></li>
              <li><Typography variant="body2" sx={{ mb: 1 }}>Preços diferentes por cor (ex: cores especiais custam mais)</Typography></li>
              <li><Typography variant="body2" sx={{ mb: 1 }}>Preços escalonados por capacidade (ex: 128GB mais caro que 64GB)</Typography></li>
              <li><Typography variant="body2" sx={{ mb: 1 }}>Promoções específicas em determinadas variações</Typography></li>
            </ul>
          </Box>

          <Alert severity="info">
            <Typography variant="body2">
              <strong>Dica:</strong> Use o campo "Preço Promocional" para criar ofertas em variações específicas 
              sem alterar o preço original.
            </Typography>
          </Alert>
        </CardContent>
      </Card>

      {/* Controle de Estoque */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            <Package size={24} style={{ verticalAlign: 'middle', marginRight: 8 }} />
            Controle de Estoque
          </Typography>
          <Typography paragraph>
            O estoque de cada variação é controlado <strong>individualmente</strong>:
          </Typography>
          
          <Stack spacing={2}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                Estoque Individual
              </Typography>
              <Typography variant="body2">
                Cada variação tem seu próprio contador de estoque. Exemplo: "Camiseta Preta M" pode ter 
                20 unidades, enquanto "Camiseta Preta G" tem apenas 5.
              </Typography>
            </Paper>
            
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                Alertas de Estoque Mínimo
              </Typography>
              <Typography variant="body2">
                Configure o estoque mínimo para receber alertas quando determinada variação estiver acabando. 
                Útil para planejar reposição de tamanhos/cores mais vendidos.
              </Typography>
            </Paper>
            
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                Movimentações
              </Typography>
              <Typography variant="body2">
                O módulo de Estoque registra todas as entradas e saídas de cada variação, permitindo 
                rastreabilidade completa das movimentações.
              </Typography>
            </Paper>
          </Stack>
        </CardContent>
      </Card>

      {/* SKU e Código de Barras */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            <Tag size={24} style={{ verticalAlign: 'middle', marginRight: 8 }} />
            SKU e Código de Barras
          </Typography>
          <Typography paragraph>
            Cada variação pode ter identificadores únicos para facilitar o gerenciamento:
          </Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="primary">
                SKU (Stock Keeping Unit)
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Código interno de identificação do produto. Útil para:
              </Typography>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                <li><Typography variant="body2">Busca rápida no sistema</Typography></li>
                <li><Typography variant="body2">Controle de inventário</Typography></li>
                <li><Typography variant="body2">Integração com ERPs</Typography></li>
              </ul>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Exemplo: CAM-BAS-PRT-M (Camiseta Básica Preta M)
              </Typography>
            </Paper>
            
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="primary">
                Código de Barras (EAN/GTIN)
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Código padrão internacional para leitura em caixa. Útil para:
              </Typography>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                <li><Typography variant="body2">Leitura em PDV com scanner</Typography></li>
                <li><Typography variant="body2">Conferência de mercadorias</Typography></li>
                <li><Typography variant="body2">Integração com marketplaces</Typography></li>
              </ul>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Exemplo: 7891234567890
              </Typography>
            </Paper>
          </Box>
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
                <strong>Nomeação clara:</strong> Use nomes que combinem as características principais, 
                como "Cor - Tamanho" ou "Capacidade - Cor". Isso facilita a identificação rápida.
              </Typography>
            </Alert>
            
            <Alert severity="info" icon={<Info size={20} />}>
              <Typography variant="body2">
                <strong>Produto sem variação:</strong> Se seu produto não tem variações, não é necessário 
                criar uma. O estoque e preço do produto principal serão usados.
              </Typography>
            </Alert>
            
            <Alert severity="warning" icon={<Warning size={20} />}>
              <Typography variant="body2">
                <strong>Variação inativa:</strong> Desativar uma variação impede novas vendas, mas não 
                afeta pedidos já realizados. Use para descontinuar variações sem perder histórico.
              </Typography>
            </Alert>
            
            <Alert severity="info" icon={<Info size={20} />}>
              <Typography variant="body2">
                <strong>Imagens por variação:</strong> Você pode adicionar imagens específicas para cada 
                variação, mostrando a cor ou característica exata ao cliente.
              </Typography>
            </Alert>
            
            <Alert severity="success" icon={<Lightbulb size={20} />}>
              <Typography variant="body2">
                <strong>SKU padronizado:</strong> Crie um padrão de SKU para todas as variações. 
                Exemplo: [CATEGORIA]-[PRODUTO]-[COR]-[TAMANHO]. Isso facilita buscas e organização.
              </Typography>
            </Alert>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
