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
  PlusCircle,
  Hamburger,
  Pizza,
  Coffee,
  CheckCircle,
  Info,
  Warning,
  Lightbulb,
  CurrencyDollar,
  ListChecks,
  ShoppingCart,
} from '@phosphor-icons/react';

interface CampoInfo {
  nome: string;
  tipo: string;
  obrigatorio: boolean;
  descricao: string;
}

const camposAdicional: CampoInfo[] = [
  { nome: 'Produto', tipo: 'Seleção', obrigatorio: true, descricao: 'Produto ao qual este adicional pode ser incluído. Um adicional pode estar vinculado a múltiplos produtos' },
  { nome: 'Nome', tipo: 'Texto', obrigatorio: true, descricao: 'Identificação do adicional (ex: "Bacon Extra", "Molho Especial", "Borda Recheada")' },
  { nome: 'Descrição', tipo: 'Texto', obrigatorio: false, descricao: 'Detalhes sobre o adicional, como ingredientes ou modo de preparo' },
  { nome: 'Preço', tipo: 'Moeda (R$)', obrigatorio: true, descricao: 'Valor a ser adicionado ao produto quando este adicional for selecionado' },
  { nome: 'Quantidade Máxima', tipo: 'Número', obrigatorio: false, descricao: 'Limite de vezes que este adicional pode ser adicionado a um mesmo item. Ex: máximo 3 porções extras' },
  { nome: 'Obrigatório', tipo: 'Switch', obrigatorio: false, descricao: 'Se marcado, o cliente deve selecionar este adicional ao comprar o produto' },
  { nome: 'Ativo', tipo: 'Switch', obrigatorio: false, descricao: 'Define se o adicional está disponível para seleção. Adicionais inativos não aparecem para o cliente' },
  { nome: 'Ordem', tipo: 'Número', obrigatorio: false, descricao: 'Posição de exibição do adicional na lista. Números menores aparecem primeiro' },
];

const exemplosAdicionais = [
  {
    categoria: 'Hambúrguer',
    icone: <Hamburger size={24} />,
    cor: '#e74c3c',
    adicionais: [
      { nome: 'Bacon Extra', preco: 'R$ 5,00', descricao: '50g de bacon crocante' },
      { nome: 'Queijo Extra', preco: 'R$ 4,00', descricao: 'Fatia adicional de cheddar' },
      { nome: 'Ovo', preco: 'R$ 3,00', descricao: 'Ovo frito' },
      { nome: 'Cebola Caramelizada', preco: 'R$ 3,50', descricao: 'Cebola caramelizada no shoyu' },
    ],
  },
  {
    categoria: 'Pizza',
    icone: <Pizza size={24} />,
    cor: '#f39c12',
    adicionais: [
      { nome: 'Borda Recheada', preco: 'R$ 12,00', descricao: 'Borda com catupiry' },
      { nome: 'Dobro de Queijo', preco: 'R$ 10,00', descricao: 'Quantidade dobrada de mussarela' },
      { nome: 'Pepperoni Extra', preco: 'R$ 8,00', descricao: 'Porção adicional de pepperoni' },
    ],
  },
  {
    categoria: 'Bebidas',
    icone: <Coffee size={24} />,
    cor: '#8b4513',
    adicionais: [
      { nome: 'Chantilly', preco: 'R$ 2,00', descricao: 'Cobertura de chantilly' },
      { nome: 'Shot de Expresso', preco: 'R$ 3,00', descricao: 'Dose extra de café' },
      { nome: 'Leite de Amêndoas', preco: 'R$ 4,00', descricao: 'Substituir leite comum' },
      { nome: 'Calda de Caramelo', preco: 'R$ 2,50', descricao: 'Calda sabor caramelo' },
    ],
  },
];

export default function AdicionaisPage() {
  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <PlusCircle size={40} weight="duotone" color="#667eea" />
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Adicionais de Produtos
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Itens extras que podem ser adicionados aos produtos
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
            ➕ Visão Geral
          </Typography>
          <Typography paragraph>
            Os <strong>Adicionais</strong> são itens extras que podem ser selecionados pelo cliente ao 
            comprar um produto. São muito utilizados em restaurantes, lanchonetes e delivery de alimentos, 
            mas podem ser aplicados a qualquer tipo de produto.
          </Typography>
          <Typography paragraph>
            Cada adicional tem um <strong>preço próprio</strong> que é somado ao valor do produto base. 
            Por exemplo, ao pedir um hambúrguer de R$ 25,00 e adicionar "Bacon Extra" por R$ 5,00, 
            o total do item será R$ 30,00.
          </Typography>
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Diferença de Variação:</strong> Variações são opções excludentes (tamanho P ou M ou G), 
              enquanto adicionais são cumulativos (bacon + queijo + ovo).
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
            Os adicionais são gerenciados através do cadastro de produtos:
          </Typography>
          <Box sx={{ 
            bgcolor: 'grey.100', 
            p: 2, 
            borderRadius: 1, 
            fontFamily: 'monospace',
            mb: 2
          }}>
            Menu lateral → Produtos → Selecionar produto → Aba "Adicionais"
          </Box>
          <Typography variant="body2" color="text.secondary">
            Também é possível acessar via Produtos → botão "Adicionais" na linha do produto desejado.
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
                {camposAdicional.map((campo) => (
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

      {/* Exemplos de Adicionais */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            🍔 Exemplos de Adicionais por Categoria
          </Typography>
          <Typography paragraph>
            Veja como diferentes tipos de produtos podem usar adicionais:
          </Typography>
          
          <Stack spacing={3}>
            {exemplosAdicionais.map((exemplo) => (
              <Paper 
                key={exemplo.categoria} 
                variant="outlined" 
                sx={{ p: 2, borderLeft: `4px solid ${exemplo.cor}` }}
              >
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                  <Box sx={{ color: exemplo.cor }}>{exemplo.icone}</Box>
                  <Typography variant="subtitle1" fontWeight="bold">{exemplo.categoria}</Typography>
                </Stack>
                
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Adicional</strong></TableCell>
                        <TableCell><strong>Preço</strong></TableCell>
                        <TableCell><strong>Descrição</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {exemplo.adicionais.map((a) => (
                        <TableRow key={a.nome} hover>
                          <TableCell>{a.nome}</TableCell>
                          <TableCell>
                            <Chip label={a.preco} size="small" color="success" />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">{a.descricao}</Typography>
                          </TableCell>
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

      {/* Cálculo de Preços */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            <CurrencyDollar size={24} style={{ verticalAlign: 'middle', marginRight: 8 }} />
            Cálculo de Preços com Adicionais
          </Typography>
          <Typography paragraph>
            O preço final de um item é calculado da seguinte forma:
          </Typography>
          
          <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50', mb: 2 }}>
            <Typography variant="body2" fontFamily="monospace" textAlign="center">
              <strong>Preço Final</strong> = Preço do Produto + (Adicional 1 × Qtd) + (Adicional 2 × Qtd) + ...
            </Typography>
          </Paper>
          
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            Exemplo Prático:
          </Typography>
          
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell>Hambúrguer Clássico</TableCell>
                  <TableCell align="right">R$ 25,00</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>+ Bacon Extra (×1)</TableCell>
                  <TableCell align="right">R$ 5,00</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>+ Queijo Extra (×2)</TableCell>
                  <TableCell align="right">R$ 8,00</TableCell>
                </TableRow>
                <TableRow sx={{ bgcolor: 'primary.lighter' }}>
                  <TableCell><strong>TOTAL DO ITEM</strong></TableCell>
                  <TableCell align="right"><strong>R$ 38,00</strong></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Quantidade Máxima */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            <ListChecks size={24} style={{ verticalAlign: 'middle', marginRight: 8 }} />
            Quantidade Máxima
          </Typography>
          <Typography paragraph>
            O campo <strong>Quantidade Máxima</strong> permite limitar quantas vezes um adicional pode ser 
            adicionado a um mesmo item:
          </Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="primary">
                Sem Limite (vazio ou 0)
              </Typography>
              <Typography variant="body2">
                O cliente pode adicionar quantas unidades quiser deste adicional.
              </Typography>
            </Paper>
            
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="primary">
                Com Limite (ex: 3)
              </Typography>
              <Typography variant="body2">
                O cliente pode adicionar no máximo 3 unidades. Útil para controle de porções.
              </Typography>
            </Paper>
          </Box>

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Exemplo:</strong> "Bacon Extra" com quantidade máxima 3 permite ao cliente escolher 
              entre 1, 2 ou 3 porções extras de bacon.
            </Typography>
          </Alert>
        </CardContent>
      </Card>

      {/* Adicionais Obrigatórios */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            ⚠️ Adicionais Obrigatórios
          </Typography>
          <Typography paragraph>
            Marcar um adicional como <strong>obrigatório</strong> força o cliente a selecioná-lo ao comprar o produto:
          </Typography>
          
          <Stack spacing={2}>
            <Paper variant="outlined" sx={{ p: 2, borderLeft: '4px solid #22c55e' }}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                Quando usar adicionais obrigatórios:
              </Typography>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                <li><Typography variant="body2">Escolha de ponto da carne (bem passado, ao ponto, mal passado)</Typography></li>
                <li><Typography variant="body2">Tipo de pão (tradicional, australiano, integral)</Typography></li>
                <li><Typography variant="body2">Tamanho da porção quando não é variação</Typography></li>
                <li><Typography variant="body2">Molho acompanhante (mostarda, ketchup, maionese)</Typography></li>
              </ul>
            </Paper>
            
            <Paper variant="outlined" sx={{ p: 2, borderLeft: '4px solid #f59e0b' }}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                Adicionais obrigatórios com preço R$ 0,00:
              </Typography>
              <Typography variant="body2">
                Use adicionais obrigatórios gratuitos quando o cliente precisa escolher algo sem custo adicional. 
                Exemplo: escolher entre molho de tomate ou molho branco na massa.
              </Typography>
            </Paper>
          </Stack>
        </CardContent>
      </Card>

      {/* Uso nos Pedidos */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            <ShoppingCart size={24} style={{ verticalAlign: 'middle', marginRight: 8 }} />
            Uso nos Pedidos
          </Typography>
          <Typography paragraph>
            Ao adicionar um produto ao pedido, os adicionais aparecem para seleção:
          </Typography>
          
          <Box sx={{ pl: 2 }}>
            <ol style={{ margin: 0, paddingLeft: 16 }}>
              <li><Typography variant="body2" sx={{ mb: 1 }}>Cliente seleciona o produto desejado</Typography></li>
              <li><Typography variant="body2" sx={{ mb: 1 }}>Sistema exibe os adicionais disponíveis (se houver)</Typography></li>
              <li><Typography variant="body2" sx={{ mb: 1 }}>Cliente marca os adicionais desejados e quantidade de cada</Typography></li>
              <li><Typography variant="body2" sx={{ mb: 1 }}>Preço total é calculado automaticamente</Typography></li>
              <li><Typography variant="body2" sx={{ mb: 1 }}>Item é adicionado ao carrinho com os adicionais selecionados</Typography></li>
            </ol>
          </Box>

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              Os adicionais selecionados ficam registrados no pedido e são exibidos no histórico, 
              cupom fiscal e relatórios.
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
                <strong>Organização:</strong> Use o campo "Ordem" para organizar os adicionais. 
                Coloque os mais populares primeiro para facilitar a escolha do cliente.
              </Typography>
            </Alert>
            
            <Alert severity="info" icon={<Info size={20} />}>
              <Typography variant="body2">
                <strong>Descrição detalhada:</strong> Inclua informações sobre quantidade ou preparo na descrição. 
                Ex: "50g de bacon crocante" é melhor que apenas "Bacon".
              </Typography>
            </Alert>
            
            <Alert severity="warning" icon={<Warning size={20} />}>
              <Typography variant="body2">
                <strong>Adicionais esgotados:</strong> Se um ingrediente acabou, desative temporariamente 
                o adicional em vez de excluí-lo. Assim, mantém o histórico e pode reativar depois.
              </Typography>
            </Alert>
            
            <Alert severity="success" icon={<Lightbulb size={20} />}>
              <Typography variant="body2">
                <strong>Mesmo adicional em vários produtos:</strong> Adicionais como "Bacon Extra" podem ser 
                vinculados a múltiplos produtos (hambúrguer, hot dog, pizza) sem precisar cadastrar novamente.
              </Typography>
            </Alert>
            
            <Alert severity="info" icon={<Info size={20} />}>
              <Typography variant="body2">
                <strong>Precificação estratégica:</strong> Adicionais são uma ótima forma de aumentar o 
                ticket médio. Ofereça opções atrativas a preços justos.
              </Typography>
            </Alert>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
