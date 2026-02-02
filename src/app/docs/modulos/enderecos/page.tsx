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
  MapPin,
  House,
  Buildings,
  Truck,
  Star,
  MagnifyingGlass,
  CheckCircle,
  Info,
  Warning,
  Lightbulb,
} from '@phosphor-icons/react';

interface CampoInfo {
  nome: string;
  tipo: string;
  obrigatorio: boolean;
  descricao: string;
}

const camposEndereco: CampoInfo[] = [
  { nome: 'CEP', tipo: 'Texto (8 dígitos)', obrigatorio: true, descricao: 'Código postal do endereço. Ao digitar, o sistema busca automaticamente os dados do endereço via API dos Correios' },
  { nome: 'Logradouro', tipo: 'Texto', obrigatorio: true, descricao: 'Nome da rua, avenida, travessa ou similar. Preenchido automaticamente pelo CEP' },
  { nome: 'Número', tipo: 'Texto', obrigatorio: true, descricao: 'Número do imóvel. Use "S/N" para endereços sem número' },
  { nome: 'Complemento', tipo: 'Texto', obrigatorio: false, descricao: 'Informações adicionais como apartamento, bloco, sala, etc.' },
  { nome: 'Bairro', tipo: 'Texto', obrigatorio: true, descricao: 'Bairro ou setor. Preenchido automaticamente pelo CEP' },
  { nome: 'Cidade', tipo: 'Texto', obrigatorio: true, descricao: 'Nome da cidade. Preenchido automaticamente pelo CEP' },
  { nome: 'Estado', tipo: 'Seleção', obrigatorio: true, descricao: 'Unidade federativa (UF). Preenchido automaticamente pelo CEP' },
  { nome: 'País', tipo: 'Texto', obrigatorio: false, descricao: 'País do endereço. Por padrão, "Brasil"' },
  { nome: 'Tipo', tipo: 'Seleção', obrigatorio: true, descricao: 'Classificação do endereço: Residencial, Comercial, Entrega ou Cobrança' },
  { nome: 'Principal', tipo: 'Switch', obrigatorio: false, descricao: 'Indica se este é o endereço principal do cliente. Apenas um endereço pode ser marcado como principal' },
  { nome: 'Apelido', tipo: 'Texto', obrigatorio: false, descricao: 'Nome de identificação rápida para o endereço (ex: "Casa", "Trabalho", "Escritório")' },
  { nome: 'Referência', tipo: 'Texto', obrigatorio: false, descricao: 'Ponto de referência para facilitar a localização (ex: "Próximo ao supermercado X")' },
];

const tiposEndereco = [
  { tipo: 'Residencial', icone: <House size={20} />, cor: '#667eea', descricao: 'Endereço de moradia do cliente' },
  { tipo: 'Comercial', icone: <Buildings size={20} />, cor: '#764ba2', descricao: 'Endereço de trabalho ou estabelecimento comercial' },
  { tipo: 'Entrega', icone: <Truck size={20} />, cor: '#22c55e', descricao: 'Endereço preferencial para receber entregas' },
  { tipo: 'Cobrança', icone: <MapPin size={20} />, cor: '#f59e0b', descricao: 'Endereço para emissão de notas e boletos' },
];

export default function EnderecosPage() {
  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <MapPin size={40} weight="duotone" color="#667eea" />
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Módulo de Endereços
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Cadastro e gerenciamento de endereços dos clientes
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
            label="Serviços" 
            size="small" 
            sx={{ bgcolor: '#9c27b0', color: 'white' }}
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
            📍 Visão Geral
          </Typography>
          <Typography paragraph>
            O módulo de <strong>Endereços</strong> permite cadastrar múltiplos endereços para cada cliente, 
            facilitando a gestão de entregas e cobrança. Cada cliente pode ter vários endereços cadastrados, 
            mas apenas um pode ser marcado como principal.
          </Typography>
          <Typography paragraph>
            Os endereços são especialmente importantes para empresas que trabalham com <strong>entrega de produtos</strong>, 
            permitindo que o cliente escolha onde deseja receber seus pedidos. Também são úteis para 
            <strong> serviços que vão até o cliente</strong>, como atendimentos domiciliares.
          </Typography>
        </CardContent>
      </Card>

      {/* Como Acessar */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            🔗 Como Acessar
          </Typography>
          <Typography paragraph>
            Os endereços são acessados através do <strong>cadastro de clientes</strong>:
          </Typography>
          <Box sx={{ 
            bgcolor: 'grey.100', 
            p: 2, 
            borderRadius: 1, 
            fontFamily: 'monospace',
            mb: 2
          }}>
            Menu lateral → Clientes → Selecionar cliente → Aba "Endereços"
          </Box>
          <Typography variant="body2" color="text.secondary">
            Ou ao criar um novo pedido, é possível selecionar ou cadastrar um endereço de entrega diretamente.
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
                {camposEndereco.map((campo) => (
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

      {/* Tipos de Endereço */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            🏷️ Tipos de Endereço
          </Typography>
          <Typography paragraph>
            O sistema permite classificar os endereços por tipo, facilitando a organização:
          </Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
            {tiposEndereco.map((tipo) => (
              <Paper 
                key={tipo.tipo} 
                variant="outlined" 
                sx={{ 
                  p: 2, 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: 2,
                  borderLeft: `4px solid ${tipo.cor}`,
                }}
              >
                <Box sx={{ color: tipo.cor }}>{tipo.icone}</Box>
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold">{tipo.tipo}</Typography>
                  <Typography variant="body2" color="text.secondary">{tipo.descricao}</Typography>
                </Box>
              </Paper>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Busca Automática por CEP */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            <MagnifyingGlass size={24} style={{ verticalAlign: 'middle', marginRight: 8 }} />
            Busca Automática por CEP
          </Typography>
          <Typography paragraph>
            Ao digitar o <strong>CEP</strong> no campo correspondente, o sistema automaticamente:
          </Typography>
          
          <Box sx={{ pl: 2, mb: 2 }}>
            <Stack spacing={1}>
              <Stack direction="row" spacing={1} alignItems="center">
                <CheckCircle size={16} color="#22c55e" weight="fill" />
                <Typography variant="body2">Consulta a base de dados dos Correios</Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <CheckCircle size={16} color="#22c55e" weight="fill" />
                <Typography variant="body2">Preenche o logradouro (rua/avenida)</Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <CheckCircle size={16} color="#22c55e" weight="fill" />
                <Typography variant="body2">Preenche o bairro</Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <CheckCircle size={16} color="#22c55e" weight="fill" />
                <Typography variant="body2">Preenche a cidade</Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <CheckCircle size={16} color="#22c55e" weight="fill" />
                <Typography variant="body2">Seleciona o estado (UF)</Typography>
              </Stack>
            </Stack>
          </Box>

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              Caso o CEP não seja encontrado ou esteja incorreto, você pode preencher os campos manualmente.
            </Typography>
          </Alert>
        </CardContent>
      </Card>

      {/* Endereço Principal */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            <Star size={24} weight="fill" color="#f59e0b" style={{ verticalAlign: 'middle', marginRight: 8 }} />
            Endereço Principal
          </Typography>
          <Typography paragraph>
            Cada cliente pode ter <strong>apenas um endereço principal</strong>. Este endereço é:
          </Typography>
          
          <Box sx={{ pl: 2, mb: 2 }}>
            <ul style={{ margin: 0, paddingLeft: 16 }}>
              <li><Typography variant="body2">Sugerido automaticamente ao criar novos pedidos</Typography></li>
              <li><Typography variant="body2">Exibido em destaque na ficha do cliente</Typography></li>
              <li><Typography variant="body2">Usado como padrão para entregas e cobranças</Typography></li>
            </ul>
          </Box>

          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="body2">
              Ao marcar um novo endereço como principal, o endereço anterior perde automaticamente essa marcação.
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
                <strong>Apelido do endereço:</strong> Use apelidos claros como "Casa", "Trabalho", "Casa da Mãe" 
                para facilitar a identificação rápida ao fazer pedidos.
              </Typography>
            </Alert>
            
            <Alert severity="info" icon={<Info size={20} />}>
              <Typography variant="body2">
                <strong>Ponto de referência:</strong> Sempre que possível, preencha o campo de referência para 
                facilitar entregas em locais de difícil localização.
              </Typography>
            </Alert>
            
            <Alert severity="warning" icon={<Warning size={20} />}>
              <Typography variant="body2">
                <strong>Complemento importante:</strong> Para apartamentos, sempre informe o número do bloco/torre 
                e apartamento no campo complemento para evitar problemas na entrega.
              </Typography>
            </Alert>
            
            <Alert severity="info" icon={<Info size={20} />}>
              <Typography variant="body2">
                <strong>Múltiplos endereços:</strong> Um cliente pode ter quantos endereços precisar. 
                Útil para quem recebe no trabalho durante a semana e em casa nos finais de semana.
              </Typography>
            </Alert>
          </Stack>
        </CardContent>
      </Card>

      {/* Uso em Pedidos */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            🛒 Uso em Pedidos
          </Typography>
          <Typography paragraph>
            Ao criar um <strong>pedido para entrega</strong>, o sistema permite:
          </Typography>
          
          <Box sx={{ pl: 2 }}>
            <ol style={{ margin: 0, paddingLeft: 16 }}>
              <li><Typography variant="body2" sx={{ mb: 1 }}>Selecionar um endereço já cadastrado do cliente</Typography></li>
              <li><Typography variant="body2" sx={{ mb: 1 }}>Cadastrar um novo endereço durante o pedido (que fica salvo para o cliente)</Typography></li>
              <li><Typography variant="body2" sx={{ mb: 1 }}>Usar um endereço avulso apenas para aquele pedido específico</Typography></li>
            </ol>
          </Box>
          
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              O endereço principal do cliente é sempre sugerido primeiro na criação de novos pedidos.
            </Typography>
          </Alert>
        </CardContent>
      </Card>
    </Box>
  );
}
