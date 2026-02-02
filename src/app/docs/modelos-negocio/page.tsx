import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { 
  CheckCircle,
  XCircle,
  Info,
} from '@phosphor-icons/react/dist/ssr';

export const metadata = {
  title: 'Modelos de Negócio | SyncCore Docs',
};

const modulos = [
  { nome: 'Dashboard', produto: true, servico: true },
  { nome: 'Empresas', produto: true, servico: true },
  { nome: 'Usuários', produto: true, servico: true },
  { nome: 'Clientes', produto: true, servico: true },
  { nome: 'Endereços', produto: true, servico: true },
  { nome: 'Horários da Empresa', produto: true, servico: true },
  { nome: 'Categorias de Produto', produto: true, servico: false },
  { nome: 'Produtos', produto: true, servico: false },
  { nome: 'Variações de Produto', produto: true, servico: false },
  { nome: 'Adicionais de Produto', produto: true, servico: false },
  { nome: 'Estoque', produto: true, servico: false },
  { nome: 'Pedidos', produto: true, servico: false },
  { nome: 'Pagamentos', produto: true, servico: false },
  { nome: 'Serviços', produto: false, servico: true },
  { nome: 'Profissionais', produto: false, servico: true },
  { nome: 'Serviços do Profissional', produto: false, servico: true },
  { nome: 'Expediente do Profissional', produto: false, servico: true },
  { nome: 'Bloqueios do Profissional', produto: false, servico: true },
  { nome: 'Agendamentos', produto: false, servico: true },
  { nome: 'Histórico de Conversas', produto: true, servico: true },
  { nome: 'Permissões', produto: true, servico: true },
  { nome: 'Integração WhatsApp', produto: true, servico: true },
];

function ModelCard({ 
  title, 
  emoji,
  description, 
  examples,
  color,
}: { 
  title: string;
  emoji: string;
  description: string;
  examples: string[];
  color: string;
}) {
  return (
    <Card sx={{ height: '100%', borderTop: `4px solid ${color}` }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Typography variant="h2" component="span">{emoji}</Typography>
          <Box>
            <Typography variant="h6" fontWeight={700}>{title}</Typography>
            <Chip 
              label={title.toUpperCase()} 
              size="small" 
              sx={{ bgcolor: color, color: 'white', fontWeight: 600 }}
            />
          </Box>
        </Box>
        <Typography variant="body1" sx={{ mb: 2 }}>
          {description}
        </Typography>
        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
          Exemplos de negócios:
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {examples.map((ex) => (
            <Chip key={ex} label={ex} size="small" variant="outlined" />
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}

export default function ModelosNegocioPage() {
  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Modelos de Negócio
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 800 }}>
        O SyncCore se adapta ao seu tipo de negócio. Ao cadastrar sua empresa, você escolhe 
        um modelo que define quais módulos e funcionalidades estarão disponíveis.
      </Typography>

      <Alert severity="info" icon={<Info size={20} />} sx={{ mb: 4 }}>
        <Typography variant="body2">
          <strong>Você pode alterar o modelo depois!</strong> Acesse Empresas → Editar → Modelo de Negócio.
          Porém, se reduzir o escopo (ex: de "Ambos" para "Produto"), perderá acesso aos módulos do outro tipo.
        </Typography>
      </Alert>

      {/* Cards dos modelos */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <ModelCard
            title="Produto"
            emoji="🛒"
            description="Para negócios que vendem produtos físicos. Você terá acesso a catálogo, estoque, pedidos, delivery e pagamentos."
            examples={['Restaurantes', 'Lanchonetes', 'Pizzarias', 'Lojas', 'Mercados', 'Padarias']}
            color="#2196f3"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <ModelCard
            title="Serviço"
            emoji="✂️"
            description="Para prestadores de serviço. Você terá acesso a agenda, profissionais, expedientes, bloqueios e agendamentos."
            examples={['Salões', 'Barbearias', 'Clínicas', 'Consultórios', 'Pet Shops', 'Estúdios']}
            color="#9c27b0"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <ModelCard
            title="Ambos"
            emoji="🏢"
            description="Para negócios híbridos que vendem produtos E prestam serviços. Acesso completo a todos os módulos."
            examples={['Pet Shop com banho', 'Salão com produtos', 'Clínica com farmácia', 'Academia com loja']}
            color="#ff9800"
          />
        </Grid>
      </Grid>

      {/* Tabela comparativa */}
      <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
        Comparativo de Módulos
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Veja quais módulos estão disponíveis em cada modelo de negócio:
      </Typography>

      <TableContainer component={Paper} variant="outlined" sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.50' }}>
              <TableCell sx={{ fontWeight: 700 }}>Módulo</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, color: '#2196f3' }}>
                🛒 Produto
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, color: '#9c27b0' }}>
                ✂️ Serviço
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, color: '#ff9800' }}>
                🏢 Ambos
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {modulos.map((mod) => (
              <TableRow key={mod.nome} hover>
                <TableCell>{mod.nome}</TableCell>
                <TableCell align="center">
                  {mod.produto ? (
                    <CheckCircle size={20} color="#4caf50" weight="fill" />
                  ) : (
                    <XCircle size={20} color="#f44336" weight="fill" />
                  )}
                </TableCell>
                <TableCell align="center">
                  {mod.servico ? (
                    <CheckCircle size={20} color="#4caf50" weight="fill" />
                  ) : (
                    <XCircle size={20} color="#f44336" weight="fill" />
                  )}
                </TableCell>
                <TableCell align="center">
                  <CheckCircle size={20} color="#4caf50" weight="fill" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dicas para escolha */}
      <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
        Como escolher o modelo certo?
      </Typography>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom color="primary">
                Escolha PRODUTO se:
              </Typography>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                <li>Você vende itens físicos</li>
                <li>Precisa controlar estoque</li>
                <li>Oferece delivery ou retirada</li>
                <li>Não tem serviços com agendamento</li>
                <li>Aceita pedidos com múltiplos itens</li>
              </ul>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom color="secondary">
                Escolha SERVIÇO se:
              </Typography>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                <li>Você presta serviços agendados</li>
                <li>Tem profissionais com horários</li>
                <li>Precisa de controle de agenda</li>
                <li>Não vende produtos físicos</li>
                <li>Os clientes marcam horário</li>
              </ul>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: '#ff9800' }}>
                Escolha AMBOS se:
              </Typography>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                <li>Vende produtos E presta serviços</li>
                <li>Ex: Pet shop com banho e tosa</li>
                <li>Ex: Salão que vende produtos</li>
                <li>Precisa de agenda E pedidos</li>
                <li>Quer flexibilidade total</li>
              </ul>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
