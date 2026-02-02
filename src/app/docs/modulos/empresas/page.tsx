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
import { Buildings, Info, Warning, CheckCircle } from '@phosphor-icons/react/dist/ssr';

export const metadata = {
  title: 'Empresas | SyncCore Docs',
};

const campos = [
  {
    campo: 'Nome',
    tipo: 'Texto',
    obrigatorio: true,
    descricao: 'Nome da empresa que aparecerá no sistema e nas comunicações com clientes.',
  },
  {
    campo: 'Tipo de Negócio',
    tipo: 'Texto',
    obrigatorio: false,
    descricao: 'Classificação do negócio (ex: Salão de Beleza, Restaurante, Pet Shop). Ajuda na personalização.',
  },
  {
    campo: 'CNPJ',
    tipo: 'Texto (14 dígitos)',
    obrigatorio: false,
    descricao: 'Cadastro Nacional de Pessoa Jurídica. Usado para identificação fiscal.',
  },
  {
    campo: 'Telefone',
    tipo: 'Texto',
    obrigatorio: false,
    descricao: 'Telefone de contato da empresa. Pode ser usado para WhatsApp se integrado.',
  },
  {
    campo: 'E-mail',
    tipo: 'E-mail',
    obrigatorio: false,
    descricao: 'E-mail de contato ou para recebimento de notificações do sistema.',
  },
  {
    campo: 'Modelo de Negócio',
    tipo: 'Seleção',
    obrigatorio: true,
    descricao: 'Define os menus disponíveis: "Produto" (vendas), "Serviço" (agendamentos) ou "Ambos".',
  },
  {
    campo: 'Tempo Limite Cancelamento',
    tipo: 'Número (minutos)',
    obrigatorio: false,
    descricao: 'Tempo mínimo antes do agendamento em que o cliente pode cancelar sem penalidade. Ex: 120 = 2 horas.',
  },
  {
    campo: 'Descrição (IA)',
    tipo: 'Texto longo',
    obrigatorio: false,
    descricao: 'Descrição do negócio, serviços e regras. Usada pelo agente de IA para responder clientes no WhatsApp.',
  },
  {
    campo: 'Ativo',
    tipo: 'Sim/Não',
    obrigatorio: true,
    descricao: 'Define se a empresa está ativa no sistema. Empresas inativas não podem ser acessadas.',
  },
];

export default function EmpresasPage() {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Buildings size={32} color="#667eea" />
        <Typography variant="h4" fontWeight={700}>
          Empresas
        </Typography>
        <Chip label="Módulo Geral" size="small" />
      </Box>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 800 }}>
        O módulo de Empresas é o ponto central do sistema. Aqui você cadastra e configura 
        as empresas que utilizarão o SyncCore, definindo o modelo de negócio e configurações gerais.
      </Typography>

      {/* Acesso */}
      <Card variant="outlined" sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            📍 Como Acessar
          </Typography>
          <Typography variant="body1">
            Menu lateral → <strong>Empresas</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            <strong>Permissão necessária:</strong> Apenas administradores podem gerenciar empresas.
          </Typography>
        </CardContent>
      </Card>

      {/* Grid/Lista */}
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
        Tela Principal (Lista)
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 2 }}>
        A tela principal mostra todas as empresas cadastradas em formato de lista (grid). 
        Você pode:
      </Typography>

      <Box component="ul" sx={{ mb: 3 }}>
        <li><strong>Buscar:</strong> Digite no campo de busca para filtrar por nome</li>
        <li><strong>Filtrar:</strong> Use os filtros para mostrar apenas empresas ativas/inativas</li>
        <li><strong>Ordenar:</strong> Clique nos cabeçalhos das colunas para ordenar</li>
        <li><strong>Editar:</strong> Clique no ícone de lápis para editar uma empresa</li>
        <li><strong>Excluir:</strong> Clique no ícone de lixeira (apenas se não houver dados vinculados)</li>
        <li><strong>Nova Empresa:</strong> Clique no botão "Nova Empresa" no canto superior direito</li>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Descrição dos campos */}
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

      {/* Modelo de Negócio - Detalhes */}
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
        Modelo de Negócio (Detalhes)
      </Typography>

      <Alert severity="info" icon={<Info size={20} />} sx={{ mb: 3 }}>
        <Typography variant="body2">
          O campo <strong>Modelo de Negócio</strong> é fundamental pois define quais 
          funcionalidades estarão disponíveis na empresa.
        </Typography>
      </Alert>

      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Chip label="PRODUTO" size="small" sx={{ bgcolor: '#667eea', color: 'white' }} />
          </Box>
          <Typography variant="body2">
            Libera os menus de: Categorias de Produto, Produtos, Variações, Adicionais, 
            Estoque, Pedidos, Itens do Pedido, Adicionais do Pedido, Pagamentos.
          </Typography>
        </CardContent>
      </Card>

      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Chip label="SERVIÇO" size="small" sx={{ bgcolor: '#9c27b0', color: 'white' }} />
          </Box>
          <Typography variant="body2">
            Libera os menus de: Serviços, Profissionais, Serviços do Profissional, 
            Expediente, Bloqueios, Agendamentos.
          </Typography>
        </CardContent>
      </Card>

      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Chip label="AMBOS" size="small" sx={{ bgcolor: '#ed6c02', color: 'white' }} />
          </Box>
          <Typography variant="body2">
            Libera <strong>todos os menus</strong> de Produto e Serviço. Ideal para negócios 
            que vendem produtos e também prestam serviços agendados.
          </Typography>
        </CardContent>
      </Card>

      <Divider sx={{ my: 4 }} />

      {/* Descrição para IA */}
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
        Campo "Descrição (IA)"
      </Typography>

      <Typography variant="body1" sx={{ mb: 2 }}>
        Este campo é usado pelo agente de inteligência artificial para entender seu negócio 
        e responder clientes via WhatsApp. Quanto mais detalhado, melhor!
      </Typography>

      <Alert severity="success" icon={<CheckCircle size={20} />} sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Exemplo de boa descrição:</strong>
        </Typography>
        <Box component="pre" sx={{ mt: 1, fontSize: '0.8rem', whiteSpace: 'pre-wrap' }}>
{`Salão de Beleza Maria Bonita
- Especializado em cortes femininos e coloração
- Atendemos de segunda a sábado, das 9h às 19h
- Aceitamos cartão, pix e dinheiro
- Estacionamento gratuito na rua
- Para cancelamentos, avisar com pelo menos 2 horas de antecedência
- Não atendemos sem hora marcada
- Vendemos também produtos para cabelo das marcas X e Y`}
        </Box>
      </Alert>

      <Divider sx={{ my: 4 }} />

      {/* Dicas e Avisos */}
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
        Dicas e Avisos
      </Typography>

      <Alert severity="warning" icon={<Warning size={20} />} sx={{ mb: 2 }}>
        <Typography variant="body2">
          <strong>Não é possível excluir</strong> uma empresa que tenha usuários, clientes, 
          produtos, serviços ou outros dados vinculados. Você deve excluir os dados primeiro.
        </Typography>
      </Alert>

      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2">
          Cada usuário está vinculado a uma empresa. Ao criar um usuário, você define 
          qual empresa ele pode acessar.
        </Typography>
      </Alert>

      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2">
          O <strong>Tempo Limite de Cancelamento</strong> é usado para validar se o cliente 
          pode cancelar um agendamento. Se configurado como 120 (minutos), o cliente não 
          pode cancelar faltando menos de 2 horas para o horário marcado.
        </Typography>
      </Alert>
    </Box>
  );
}
