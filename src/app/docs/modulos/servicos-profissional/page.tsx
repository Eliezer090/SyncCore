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
import { Link as LinkIcon, Info, Warning, CurrencyCircleDollar, Clock } from '@phosphor-icons/react/dist/ssr';

export const metadata = {
  title: 'Serviços do Profissional | SyncCore Docs',
};

const campos = [
  {
    campo: 'Profissional',
    tipo: 'Seleção',
    obrigatorio: true,
    descricao: 'O profissional que realizará o serviço.',
  },
  {
    campo: 'Serviço',
    tipo: 'Seleção',
    obrigatorio: true,
    descricao: 'O serviço a ser vinculado ao profissional.',
  },
  {
    campo: 'Duração (minutos)',
    tipo: 'Número',
    obrigatorio: false,
    descricao: 'Duração específica para este profissional. Se vazio, usa a duração padrão do serviço.',
  },
  {
    campo: 'Preço (R$)',
    tipo: 'Valor',
    obrigatorio: false,
    descricao: 'Preço específico para este profissional. Se vazio, usa o preço base do serviço.',
  },
  {
    campo: 'Antecedência Mínima',
    tipo: 'Número (minutos)',
    obrigatorio: false,
    descricao: 'Tempo mínimo antes do horário para permitir agendamento. Sobrepõe a config. do serviço.',
  },
  {
    campo: 'Ativo',
    tipo: 'Sim/Não',
    obrigatorio: true,
    descricao: 'Se desativado, o profissional não aparece como opção para este serviço.',
  },
];

export default function ServicosProfissionalPage() {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <LinkIcon size={32} color="#9c27b0" />
        <Typography variant="h4" fontWeight={700}>
          Serviços do Profissional
        </Typography>
        <Chip label="SERVIÇO" size="small" sx={{ bgcolor: '#9c27b0', color: 'white' }} />
        <Chip label="AMBOS" size="small" sx={{ bgcolor: '#ed6c02', color: 'white' }} />
      </Box>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 800 }}>
        Este módulo conecta serviços aos profissionais que podem realizá-los. 
        Cada vínculo pode ter configurações personalizadas de duração e preço, 
        permitindo diferenciação por profissional.
      </Typography>

      {/* Acesso */}
      <Card variant="outlined" sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            📍 Como Acessar
          </Typography>
          <Typography variant="body1">
            Menu lateral → <strong>Serviços & Agenda</strong> → <strong>Profissionais</strong> → <strong>Serviços do Prof.</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            <strong>Disponível em:</strong> Empresas com modelo "Serviço" ou "Ambos".
          </Typography>
        </CardContent>
      </Card>

      {/* Por que é importante */}
      <Alert severity="info" icon={<Info size={20} />} sx={{ mb: 4 }}>
        <Typography variant="body2">
          <strong>Por que é importante?</strong> Um serviço só estará disponível para agendamento 
          se estiver vinculado a pelo menos um profissional que tenha expediente configurado.
        </Typography>
      </Alert>

      {/* Grid/Lista */}
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
        Tela Principal (Lista)
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 2 }}>
        A tela mostra todos os vínculos existentes. Funcionalidades:
      </Typography>

      <Box component="ul" sx={{ mb: 3 }}>
        <li><strong>Filtrar por profissional:</strong> Veja todos os serviços de um profissional</li>
        <li><strong>Filtrar por serviço:</strong> Veja todos os profissionais que realizam um serviço</li>
        <li><strong>Novo vínculo:</strong> Crie uma nova associação serviço-profissional</li>
        <li><strong>Editar:</strong> Altere duração, preço ou antecedência do vínculo</li>
        <li><strong>Desativar:</strong> Remova o profissional das opções para o serviço</li>
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

      {/* Personalização por Profissional */}
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
        Personalização por Profissional
      </Typography>

      <Typography variant="body1" sx={{ mb: 3 }}>
        Você pode ter preços e durações diferentes para o mesmo serviço, dependendo do profissional:
      </Typography>

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <CurrencyCircleDollar size={24} color="#4caf50" />
            <Typography variant="subtitle1" fontWeight={600}>Exemplo de Preço</Typography>
          </Box>
          <Typography variant="body2">
            O serviço "Corte Masculino" custa <strong>R$ 30,00</strong> (preço base).
            <br />
            <br />
            Mas se o corte for com <strong>João (profissional sênior)</strong>, o preço é <strong>R$ 45,00</strong>.
            <br />
            No vínculo do João com esse serviço, configure: Preço = 45,00
          </Typography>
        </CardContent>
      </Card>

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Clock size={24} color="#2196f3" />
            <Typography variant="subtitle1" fontWeight={600}>Exemplo de Duração</Typography>
          </Box>
          <Typography variant="body2">
            O serviço "Escova" tem duração padrão de <strong>60 minutos</strong>.
            <br />
            <br />
            Mas <strong>Maria</strong> é mais experiente e faz em <strong>45 minutos</strong>.
            <br />
            No vínculo da Maria com esse serviço, configure: Duração = 45
          </Typography>
        </CardContent>
      </Card>

      <Alert severity="success" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Vantagem:</strong> Profissionais mais experientes podem ter preços maiores 
          e durações menores, permitindo mais atendimentos no dia.
        </Typography>
      </Alert>

      <Divider sx={{ my: 4 }} />

      {/* Hierarquia de Configurações */}
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
        Hierarquia de Configurações
      </Typography>

      <Typography variant="body1" sx={{ mb: 2 }}>
        O sistema busca as configurações na seguinte ordem de prioridade:
      </Typography>

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            1º - Vínculo Serviço-Profissional (maior prioridade)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Se configurado no vínculo, usa esse valor.
          </Typography>

          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            2º - Cadastro do Serviço (fallback)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Se não estiver no vínculo, usa o valor padrão do serviço.
          </Typography>
        </CardContent>
      </Card>

      <Divider sx={{ my: 4 }} />

      {/* Casos de Uso */}
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
        Casos de Uso Comuns
      </Typography>

      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            🎨 Salão de Beleza
          </Typography>
          <Typography variant="body2">
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              <li>Colorista especialista: serviços de coloração com preço premium</li>
              <li>Manicure iniciante: mesmos serviços, preço promocional</li>
              <li>Cabeleireiro rápido: corte em 25 min em vez de 30</li>
            </ul>
          </Typography>
        </CardContent>
      </Card>

      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            🏥 Clínica de Estética
          </Typography>
          <Typography variant="body2">
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              <li>Esteticista sênior: procedimentos complexos</li>
              <li>Esteticista júnior: apenas procedimentos básicos</li>
              <li>Médico: procedimentos especiais com valor diferenciado</li>
            </ul>
          </Typography>
        </CardContent>
      </Card>

      <Divider sx={{ my: 4 }} />

      {/* Dicas e Avisos */}
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
        Dicas e Avisos
      </Typography>

      <Alert severity="warning" icon={<Warning size={20} />} sx={{ mb: 2 }}>
        <Typography variant="body2">
          <strong>Não é possível criar vínculos duplicados:</strong> Um mesmo serviço só pode 
          estar vinculado uma vez a cada profissional.
        </Typography>
      </Alert>

      <Alert severity="warning" icon={<Warning size={20} />} sx={{ mb: 2 }}>
        <Typography variant="body2">
          <strong>Certifique-se de que o profissional tem expediente:</strong> Mesmo com o vínculo 
          configurado, se o profissional não tem expediente, não aparecerá disponível.
        </Typography>
      </Alert>

      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2">
          Deixar os campos de duração e preço vazios significa usar os valores padrões do serviço.
        </Typography>
      </Alert>

      <Alert severity="success" sx={{ mb: 2 }}>
        <Typography variant="body2">
          <strong>Dica:</strong> Ao contratar um novo profissional, crie todos os vínculos de serviços 
          que ele realizará de uma vez. Isso facilita o gerenciamento.
        </Typography>
      </Alert>
    </Box>
  );
}
