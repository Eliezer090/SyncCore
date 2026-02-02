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
import { Scissors, Info, Warning, Image, Clock } from '@phosphor-icons/react/dist/ssr';

export const metadata = {
  title: 'Serviços | SyncCore Docs',
};

const campos = [
  {
    campo: 'Nome',
    tipo: 'Texto',
    obrigatorio: true,
    descricao: 'Nome do serviço que será exibido para clientes. Ex: "Corte Masculino", "Manicure".',
  },
  {
    campo: 'Descrição',
    tipo: 'Texto longo',
    obrigatorio: false,
    descricao: 'Descrição detalhada do que está incluído no serviço. Ajuda o cliente a entender.',
  },
  {
    campo: 'Preço Base',
    tipo: 'Valor (R$)',
    obrigatorio: true,
    descricao: 'Valor padrão do serviço. Pode ser alterado por profissional no vínculo.',
  },
  {
    campo: 'Duração',
    tipo: 'Número (minutos)',
    obrigatorio: true,
    descricao: 'Tempo estimado para realização. Usado para calcular horários disponíveis.',
  },
  {
    campo: 'Antecedência Mínima',
    tipo: 'Número (minutos)',
    obrigatorio: false,
    descricao: 'Tempo mínimo antes do horário para permitir agendamento. Ex: 60 = 1 hora antes.',
  },
  {
    campo: 'Imagens',
    tipo: 'Arquivos',
    obrigatorio: false,
    descricao: 'Fotos ilustrativas do serviço. Ajudam o cliente a visualizar o resultado.',
  },
  {
    campo: 'Ativo',
    tipo: 'Sim/Não',
    obrigatorio: true,
    descricao: 'Serviços inativos não aparecem para agendamento mas mantêm o histórico.',
  },
];

export default function ServicosPage() {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Scissors size={32} color="#9c27b0" />
        <Typography variant="h4" fontWeight={700}>
          Serviços
        </Typography>
        <Chip label="SERVIÇO" size="small" sx={{ bgcolor: '#9c27b0', color: 'white' }} />
        <Chip label="AMBOS" size="small" sx={{ bgcolor: '#ed6c02', color: 'white' }} />
      </Box>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 800 }}>
        O módulo de Serviços permite cadastrar todos os serviços oferecidos pela sua empresa. 
        Cada serviço tem preço, duração e pode ser vinculado a profissionais específicos.
      </Typography>

      {/* Acesso */}
      <Card variant="outlined" sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            📍 Como Acessar
          </Typography>
          <Typography variant="body1">
            Menu lateral → <strong>Serviços & Agenda</strong> → <strong>Serviços</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            <strong>Disponível em:</strong> Empresas com modelo "Serviço" ou "Ambos".
          </Typography>
        </CardContent>
      </Card>

      {/* Grid/Lista */}
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
        Tela Principal (Lista)
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 2 }}>
        A tela mostra todos os serviços cadastrados. Funcionalidades:
      </Typography>

      <Box component="ul" sx={{ mb: 3 }}>
        <li><strong>Buscar:</strong> Filtre por nome do serviço</li>
        <li><strong>Filtrar por status:</strong> Ativos ou inativos</li>
        <li><strong>Ver detalhes:</strong> Clique para ver informações completas</li>
        <li><strong>Editar:</strong> Altere preço, duração e outras configurações</li>
        <li><strong>Gerenciar imagens:</strong> Adicione ou remova fotos do serviço</li>
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

      {/* Duração */}
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Clock size={24} />
        Duração do Serviço
      </Typography>

      <Typography variant="body1" sx={{ mb: 2 }}>
        A duração é fundamental para o sistema de agendamentos:
      </Typography>

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
            <li>Define o tempo de bloqueio na agenda do profissional</li>
            <li>Calcula automaticamente os horários disponíveis</li>
            <li>Evita sobreposição de agendamentos</li>
            <li>Pode ser diferente por profissional (no vínculo)</li>
          </Box>
        </CardContent>
      </Card>

      <Alert severity="info" icon={<Info size={20} />} sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Exemplo:</strong> Um serviço de "Corte + Barba" com duração de 45 minutos 
          ocupará esse tempo na agenda. Se o profissional tem outro cliente às 10:00, 
          o próximo horário disponível será às 10:45.
        </Typography>
      </Alert>

      <Divider sx={{ my: 4 }} />

      {/* Imagens */}
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Image size={24} />
        Imagens do Serviço
      </Typography>

      <Typography variant="body1" sx={{ mb: 2 }}>
        Adicione fotos para ilustrar o serviço:
      </Typography>

      <Box component="ul" sx={{ mb: 3 }}>
        <li>Até 5 imagens por serviço</li>
        <li>Formatos aceitos: JPG, PNG, WebP</li>
        <li>Tamanho máximo: 5MB por imagem</li>
        <li>As imagens são comprimidas automaticamente</li>
        <li>A primeira imagem é usada como capa</li>
      </Box>

      <Alert severity="success" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Dica:</strong> Fotos de antes/depois são ótimas para mostrar o resultado 
          do serviço e ajudam o cliente a decidir.
        </Typography>
      </Alert>

      <Divider sx={{ my: 4 }} />

      {/* Antecedência */}
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
        Antecedência Mínima
      </Typography>

      <Typography variant="body1" sx={{ mb: 2 }}>
        Define com quanto tempo de antecedência o cliente pode agendar:
      </Typography>

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            <strong>Exemplo:</strong> Se configurado como 60 minutos (1 hora):
          </Typography>
          <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
            <li>São 14:00 agora</li>
            <li>Cliente não pode agendar para 14:30 (menos de 1 hora)</li>
            <li>O primeiro horário disponível seria a partir de 15:00</li>
          </Box>
        </CardContent>
      </Card>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          Se não configurado, usa o valor definido no vínculo serviço-profissional 
          ou permite agendamento a qualquer momento que tenha disponibilidade.
        </Typography>
      </Alert>

      <Divider sx={{ my: 4 }} />

      {/* Fluxo Completo */}
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
        Fluxo Completo de Configuração
      </Typography>

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            Após cadastrar um serviço:
          </Typography>
          <Box component="ol" sx={{ m: 0, pl: 2.5 }}>
            <li>Cadastre os profissionais que realizam o serviço</li>
            <li>Configure o expediente de cada profissional</li>
            <li>Vincule o serviço aos profissionais (Serviços do Prof.)</li>
            <li>Opcionalmente, configure duração/preço específico por profissional</li>
            <li>O serviço estará disponível para agendamento!</li>
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
          <strong>Não é possível excluir</strong> um serviço que já tem agendamentos. 
          Neste caso, desative-o para preservar o histórico.
        </Typography>
      </Alert>

      <Alert severity="warning" icon={<Warning size={20} />} sx={{ mb: 2 }}>
        <Typography variant="body2">
          <strong>Alterar a duração</strong> não afeta agendamentos já realizados, 
          apenas novos agendamentos usarão o novo tempo.
        </Typography>
      </Alert>

      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2">
          Um serviço precisa estar vinculado a pelo menos um profissional 
          com expediente configurado para aparecer como disponível.
        </Typography>
      </Alert>

      <Alert severity="success" sx={{ mb: 2 }}>
        <Typography variant="body2">
          <strong>Dica:</strong> Seja específico nos nomes. Em vez de "Corte", 
          use "Corte Masculino" e "Corte Feminino" se os preços forem diferentes.
        </Typography>
      </Alert>
    </Box>
  );
}
