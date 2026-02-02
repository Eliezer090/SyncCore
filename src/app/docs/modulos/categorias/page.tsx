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
import { Folders, Info, Warning } from '@phosphor-icons/react/dist/ssr';

export const metadata = {
  title: 'Categorias de Produto | SyncCore Docs',
};

const campos = [
  {
    campo: 'Nome',
    tipo: 'Texto',
    obrigatorio: true,
    descricao: 'Nome da categoria. Ex: "Bebidas", "Lanches", "Produtos para Cabelo".',
  },
  {
    campo: 'Descrição',
    tipo: 'Texto',
    obrigatorio: false,
    descricao: 'Descrição da categoria para ajudar na organização.',
  },
  {
    campo: 'Ordem',
    tipo: 'Número',
    obrigatorio: false,
    descricao: 'Define a posição da categoria na listagem. Menor número aparece primeiro.',
  },
  {
    campo: 'Ativo',
    tipo: 'Sim/Não',
    obrigatorio: true,
    descricao: 'Categorias inativas não aparecem na listagem de produtos para clientes.',
  },
];

export default function CategoriasPage() {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Folders size={32} color="#667eea" />
        <Typography variant="h4" fontWeight={700}>
          Categorias de Produto
        </Typography>
        <Chip label="PRODUTO" size="small" sx={{ bgcolor: '#667eea', color: 'white' }} />
        <Chip label="AMBOS" size="small" sx={{ bgcolor: '#ed6c02', color: 'white' }} />
      </Box>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 800 }}>
        Categorias organizam seus produtos em grupos lógicos, facilitando a navegação 
        e busca tanto para a equipe quanto para clientes via WhatsApp.
      </Typography>

      {/* Acesso */}
      <Card variant="outlined" sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            📍 Como Acessar
          </Typography>
          <Typography variant="body1">
            Menu lateral → <strong>Produtos & Pedidos</strong> → <strong>Produtos</strong> → <strong>Categorias</strong>
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
        <li><strong>Buscar:</strong> Filtre por nome da categoria</li>
        <li><strong>Ordenar:</strong> Arraste para reorganizar (se disponível) ou edite o campo "Ordem"</li>
        <li><strong>Nova categoria:</strong> Crie uma nova categoria para organizar produtos</li>
        <li><strong>Editar:</strong> Altere nome, descrição ou ordem</li>
        <li><strong>Ver produtos:</strong> Veja quantos produtos estão na categoria</li>
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

      {/* Exemplos */}
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
        Exemplos por Tipo de Negócio
      </Typography>

      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            🍔 Lanchonete / Restaurante
          </Typography>
          <Typography variant="body2">
            Lanches, Bebidas, Sobremesas, Porções, Combos, Promoções
          </Typography>
        </CardContent>
      </Card>

      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            💇 Salão de Beleza (produtos)
          </Typography>
          <Typography variant="body2">
            Produtos para Cabelo, Maquiagem, Esmaltes, Acessórios, Kits
          </Typography>
        </CardContent>
      </Card>

      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            🐕 Pet Shop (produtos)
          </Typography>
          <Typography variant="body2">
            Ração, Petiscos, Brinquedos, Higiene, Coleiras e Acessórios, Medicamentos
          </Typography>
        </CardContent>
      </Card>

      <Divider sx={{ my: 4 }} />

      {/* Dicas */}
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
        Dicas e Avisos
      </Typography>

      <Alert severity="warning" icon={<Warning size={20} />} sx={{ mb: 2 }}>
        <Typography variant="body2">
          <strong>Não é possível excluir</strong> uma categoria que tem produtos vinculados. 
          Mova os produtos para outra categoria primeiro ou desative a categoria.
        </Typography>
      </Alert>

      <Alert severity="info" icon={<Info size={20} />} sx={{ mb: 2 }}>
        <Typography variant="body2">
          Categorias inativas continuam existindo, mas não aparecem para clientes. 
          Útil para categorias sazonais (ex: "Páscoa", "Natal").
        </Typography>
      </Alert>

      <Alert severity="success" sx={{ mb: 2 }}>
        <Typography variant="body2">
          <strong>Dica:</strong> Use o campo "Ordem" para destacar categorias mais vendidas 
          ou promoções no topo da lista.
        </Typography>
      </Alert>

      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2">
          O agente de IA usa as categorias para organizar as respostas quando cliente 
          pergunta "o que vocês têm?" ou "quero ver o cardápio".
        </Typography>
      </Alert>
    </Box>
  );
}
