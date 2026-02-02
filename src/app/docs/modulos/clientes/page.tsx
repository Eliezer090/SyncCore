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
import { UsersThree, Info, Warning, WhatsappLogo, MapPin } from '@phosphor-icons/react/dist/ssr';

export const metadata = {
  title: 'Clientes | SyncCore Docs',
};

const campos = [
  {
    campo: 'Nome',
    tipo: 'Texto',
    obrigatorio: true,
    descricao: 'Nome completo do cliente. Será usado nas comunicações e identificações.',
  },
  {
    campo: 'Telefone',
    tipo: 'Texto',
    obrigatorio: true,
    descricao: 'Telefone principal com DDD. Usado para WhatsApp se integrado. Ex: 11999998888',
  },
  {
    campo: 'E-mail',
    tipo: 'E-mail',
    obrigatorio: false,
    descricao: 'E-mail para comunicações e envio de comprovantes.',
  },
  {
    campo: 'CPF',
    tipo: 'Texto (11 dígitos)',
    obrigatorio: false,
    descricao: 'CPF do cliente. Usado para identificação e notas fiscais.',
  },
  {
    campo: 'Data de Nascimento',
    tipo: 'Data',
    obrigatorio: false,
    descricao: 'Para envio de mensagens de aniversário e promoções personalizadas.',
  },
  {
    campo: 'Sexo',
    tipo: 'Seleção',
    obrigatorio: false,
    descricao: 'Masculino, Feminino ou Não informado. Para personalização de comunicações.',
  },
  {
    campo: 'Observações',
    tipo: 'Texto longo',
    obrigatorio: false,
    descricao: 'Anotações sobre o cliente (preferências, alergias, etc.).',
  },
  {
    campo: 'Ativo',
    tipo: 'Sim/Não',
    obrigatorio: true,
    descricao: 'Clientes inativos não aparecem em buscas e não podem fazer novos pedidos/agendamentos.',
  },
];

export default function ClientesPage() {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <UsersThree size={32} color="#667eea" />
        <Typography variant="h4" fontWeight={700}>
          Clientes
        </Typography>
        <Chip label="Módulo Geral" size="small" />
      </Box>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 800 }}>
        O módulo de Clientes centraliza o cadastro de todas as pessoas que compram produtos 
        ou agendam serviços na sua empresa. Os clientes podem ser cadastrados manualmente 
        ou chegar automaticamente via WhatsApp.
      </Typography>

      {/* Acesso */}
      <Card variant="outlined" sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            📍 Como Acessar
          </Typography>
          <Typography variant="body1">
            Menu lateral → <strong>Geral</strong> → <strong>Clientes</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            <strong>Permissão necessária:</strong> Todos os papéis (exceto Cliente) podem visualizar. 
            Criação e edição dependem das permissões configuradas.
          </Typography>
        </CardContent>
      </Card>

      {/* Grid/Lista */}
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
        Tela Principal (Lista)
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 2 }}>
        A tela mostra todos os clientes da empresa. Funcionalidades:
      </Typography>

      <Box component="ul" sx={{ mb: 3 }}>
        <li><strong>Buscar:</strong> Filtre por nome, telefone ou e-mail</li>
        <li><strong>Filtrar por status:</strong> Ativos ou inativos</li>
        <li><strong>Ver detalhes:</strong> Clique no cliente para ver histórico completo</li>
        <li><strong>Editar:</strong> Atualize os dados do cliente</li>
        <li><strong>Gerenciar endereços:</strong> Adicione ou edite endereços de entrega</li>
        <li><strong>Exportar:</strong> Exporte a lista para Excel (se disponível)</li>
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

      <Divider sx={{ my: 4 }} />

      {/* Clientes via WhatsApp */}
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <WhatsappLogo size={24} color="#25d366" />
        Clientes via WhatsApp
      </Typography>

      <Typography variant="body1" sx={{ mb: 2 }}>
        Quando a integração com WhatsApp está ativa, os clientes são criados automaticamente:
      </Typography>

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Box component="ol" sx={{ m: 0, pl: 2.5 }}>
            <li>Cliente envia mensagem para o WhatsApp da empresa</li>
            <li>Sistema verifica se o telefone já existe no cadastro</li>
            <li>Se não existir, cria um novo cliente com o número</li>
            <li>O nome é obtido do perfil do WhatsApp (se disponível)</li>
            <li>Conversa é registrada no histórico</li>
          </Box>
        </CardContent>
      </Card>

      <Alert severity="info" icon={<Info size={20} />} sx={{ mb: 3 }}>
        <Typography variant="body2">
          Clientes criados automaticamente podem ter dados incompletos. 
          Você pode atualizar o cadastro a qualquer momento.
        </Typography>
      </Alert>

      <Divider sx={{ my: 4 }} />

      {/* Endereços */}
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <MapPin size={24} />
        Endereços do Cliente
      </Typography>

      <Typography variant="body1" sx={{ mb: 2 }}>
        Cada cliente pode ter múltiplos endereços cadastrados para entregas:
      </Typography>

      <Box component="ul" sx={{ mb: 3 }}>
        <li><strong>CEP:</strong> Busca automática do endereço pelos Correios</li>
        <li><strong>Logradouro:</strong> Rua, avenida, etc.</li>
        <li><strong>Número:</strong> Número do imóvel</li>
        <li><strong>Complemento:</strong> Apartamento, bloco, etc.</li>
        <li><strong>Bairro:</strong> Nome do bairro</li>
        <li><strong>Cidade / UF:</strong> Cidade e estado</li>
        <li><strong>Ponto de Referência:</strong> Facilita a localização</li>
        <li><strong>Endereço Principal:</strong> Define qual é o padrão para entregas</li>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          Os endereços são gerenciados em um módulo separado. Acesse 
          <strong> Geral → Endereços</strong> ou clique no ícone de endereço na lista de clientes.
        </Typography>
      </Alert>

      <Divider sx={{ my: 4 }} />

      {/* Detalhes do Cliente */}
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
        Tela de Detalhes
      </Typography>

      <Typography variant="body1" sx={{ mb: 2 }}>
        Ao clicar em um cliente, você vê seus dados completos e histórico:
      </Typography>

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            Informações disponíveis:
          </Typography>
          <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
            <li>Dados cadastrais completos</li>
            <li>Lista de endereços cadastrados</li>
            <li>Histórico de pedidos (modelo Produto/Ambos)</li>
            <li>Histórico de agendamentos (modelo Serviço/Ambos)</li>
            <li>Histórico de conversas pelo WhatsApp</li>
            <li>Totais: valor gasto, número de atendimentos</li>
          </Box>
        </CardContent>
      </Card>

      <Divider sx={{ my: 4 }} />

      {/* Dicas e Avisos */}
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
        Dicas e Avisos
      </Typography>

      <Alert severity="warning" icon={<Warning size={20} />} sx={{ mb: 2 }}>
        <Typography variant="body2">
          <strong>Telefone deve ser único:</strong> Não é possível ter dois clientes com o 
          mesmo telefone na mesma empresa. Isso evita duplicidades.
        </Typography>
      </Alert>

      <Alert severity="warning" icon={<Warning size={20} />} sx={{ mb: 2 }}>
        <Typography variant="body2">
          <strong>Não é possível excluir</strong> um cliente que já tem pedidos ou agendamentos. 
          Neste caso, apenas desative-o.
        </Typography>
      </Alert>

      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2">
          O campo <strong>Observações</strong> é muito útil para guardar informações importantes, 
          como: "Alérgica a tintura X", "Prefere corte mais curto", "Sempre pede sem cebola".
        </Typography>
      </Alert>

      <Alert severity="success" sx={{ mb: 2 }}>
        <Typography variant="body2">
          <strong>Dica:</strong> Mantenha o cadastro de clientes atualizado para melhorar 
          a comunicação e personalização do atendimento via WhatsApp.
        </Typography>
      </Alert>
    </Box>
  );
}
