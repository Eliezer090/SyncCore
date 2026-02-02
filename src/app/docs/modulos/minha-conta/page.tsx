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
  UserCircle,
  User,
  Lock,
  Camera,
  Envelope,
  Phone,
  Buildings,
  CheckCircle,
  Info,
  Warning,
  Lightbulb,
  Key,
  ShieldCheck,
  Eye,
  EyeSlash,
  ArrowsClockwise,
} from '@phosphor-icons/react';

interface CampoInfo {
  nome: string;
  tipo: string;
  obrigatorio: boolean;
  descricao: string;
}

const camposPerfil: CampoInfo[] = [
  { nome: 'Nome', tipo: 'Texto', obrigatorio: true, descricao: 'Nome completo do usuário. Exibido no sistema e em comunicações' },
  { nome: 'E-mail', tipo: 'E-mail', obrigatorio: true, descricao: 'E-mail de acesso ao sistema. Também usado para recuperação de senha' },
  { nome: 'Telefone', tipo: 'Telefone', obrigatorio: false, descricao: 'Número de telefone para contato. Formato: (99) 99999-9999' },
  { nome: 'Foto de Perfil', tipo: 'Imagem', obrigatorio: false, descricao: 'Foto exibida no avatar do usuário. Formatos aceitos: JPG, PNG' },
];

const camposSenha: CampoInfo[] = [
  { nome: 'Senha Atual', tipo: 'Senha', obrigatorio: true, descricao: 'Sua senha atual. Necessária para confirmar a alteração' },
  { nome: 'Nova Senha', tipo: 'Senha', obrigatorio: true, descricao: 'Nova senha desejada. Mínimo 8 caracteres, com letras e números' },
  { nome: 'Confirmar Senha', tipo: 'Senha', obrigatorio: true, descricao: 'Repetição da nova senha para evitar erros de digitação' },
];

const requisitosSeguranca = [
  { requisito: 'Mínimo de 8 caracteres', descricao: 'A senha deve ter pelo menos 8 caracteres' },
  { requisito: 'Letras maiúsculas', descricao: 'Inclua pelo menos uma letra maiúscula (A-Z)' },
  { requisito: 'Letras minúsculas', descricao: 'Inclua pelo menos uma letra minúscula (a-z)' },
  { requisito: 'Números', descricao: 'Inclua pelo menos um número (0-9)' },
  { requisito: 'Caracteres especiais', descricao: 'Recomendado incluir caracteres como @, #, $, %, etc.' },
];

export default function MinhaContaPage() {
  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <UserCircle size={40} weight="duotone" color="#667eea" />
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Minha Conta
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Gerenciamento do perfil pessoal e configurações de segurança
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
            👤 Visão Geral
          </Typography>
          <Typography paragraph>
            A página <strong>Minha Conta</strong> é o espaço pessoal de cada usuário do sistema. 
            Aqui você pode atualizar suas informações de perfil, alterar a senha de acesso e 
            gerenciar configurações pessoais.
          </Typography>
          <Typography paragraph>
            Esta área é <strong>individual para cada usuário</strong> - as alterações feitas aqui 
            afetam apenas a sua conta e não impactam outros usuários ou configurações da empresa.
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
            A página Minha Conta pode ser acessada de duas formas:
          </Typography>
          <Box sx={{ 
            bgcolor: 'grey.100', 
            p: 2, 
            borderRadius: 1, 
            fontFamily: 'monospace',
            mb: 2
          }}>
            Menu lateral → Minha Conta
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Ou clicando no seu avatar/nome no canto superior direito:
          </Typography>
          <Box sx={{ 
            bgcolor: 'grey.100', 
            p: 2, 
            borderRadius: 1, 
            fontFamily: 'monospace'
          }}>
            Avatar (canto superior direito) → Minha Conta
          </Box>
        </CardContent>
      </Card>

      {/* Dados do Perfil */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            <User size={24} style={{ verticalAlign: 'middle', marginRight: 8 }} />
            Dados do Perfil
          </Typography>
          <Typography paragraph>
            Mantenha seus dados sempre atualizados:
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
                {camposPerfil.map((campo) => (
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

      {/* Foto de Perfil */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            <Camera size={24} style={{ verticalAlign: 'middle', marginRight: 8 }} />
            Foto de Perfil
          </Typography>
          <Typography paragraph>
            A foto de perfil é exibida em diversos locais do sistema:
          </Typography>
          
          <Box sx={{ pl: 2, mb: 2 }}>
            <ul style={{ margin: 0, paddingLeft: 16 }}>
              <li><Typography variant="body2">No menu lateral (quando expandido)</Typography></li>
              <li><Typography variant="body2">No canto superior direito da tela</Typography></li>
              <li><Typography variant="body2">Em registros de atividade (quem criou/editou)</Typography></li>
              <li><Typography variant="body2">Na listagem de usuários (para administradores)</Typography></li>
            </ul>
          </Box>

          <Stack spacing={2}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="primary">
                Para alterar a foto:
              </Typography>
              <ol style={{ margin: 0, paddingLeft: 20 }}>
                <li><Typography variant="body2">Clique no avatar atual ou no botão "Alterar foto"</Typography></li>
                <li><Typography variant="body2">Selecione uma imagem do seu computador</Typography></li>
                <li><Typography variant="body2">Ajuste o recorte se necessário</Typography></li>
                <li><Typography variant="body2">Clique em "Salvar"</Typography></li>
              </ol>
            </Paper>
          </Stack>

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Formatos aceitos:</strong> JPG, PNG, GIF. Tamanho máximo: 5MB. 
              Recomendamos imagens quadradas para melhor exibição.
            </Typography>
          </Alert>
        </CardContent>
      </Card>

      {/* Alteração de Senha */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            <Lock size={24} style={{ verticalAlign: 'middle', marginRight: 8 }} />
            Alteração de Senha
          </Typography>
          <Typography paragraph>
            Para sua segurança, recomendamos alterar a senha periodicamente:
          </Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
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
                {camposSenha.map((campo) => (
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

          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            <ShieldCheck size={20} style={{ verticalAlign: 'middle', marginRight: 8 }} />
            Requisitos de Segurança da Senha:
          </Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mt: 2 }}>
            {requisitosSeguranca.map((req) => (
              <Paper 
                key={req.requisito} 
                variant="outlined" 
                sx={{ 
                  p: 2, 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: 1.5,
                }}
              >
                <CheckCircle size={18} color="#22c55e" weight="fill" style={{ marginTop: 2 }} />
                <Box>
                  <Typography variant="body2" fontWeight="medium">{req.requisito}</Typography>
                  <Typography variant="caption" color="text.secondary">{req.descricao}</Typography>
                </Box>
              </Paper>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Visualização de Senha */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            <Eye size={24} style={{ verticalAlign: 'middle', marginRight: 8 }} />
            Visualização de Senha
          </Typography>
          <Typography paragraph>
            Os campos de senha possuem um botão para alternar entre exibir e ocultar os caracteres:
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
            <Paper variant="outlined" sx={{ p: 2, flex: 1 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <EyeSlash size={20} color="#6b7280" />
                <Typography variant="body2">
                  <strong>Oculto:</strong> ••••••••
                </Typography>
              </Stack>
              <Typography variant="caption" color="text.secondary">
                Padrão - caracteres mascarados
              </Typography>
            </Paper>
            
            <Paper variant="outlined" sx={{ p: 2, flex: 1 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Eye size={20} color="#667eea" />
                <Typography variant="body2">
                  <strong>Visível:</strong> minhaSenha123
                </Typography>
              </Stack>
              <Typography variant="caption" color="text.secondary">
                Clique no ícone para revelar
              </Typography>
            </Paper>
          </Box>

          <Alert severity="warning">
            <Typography variant="body2">
              Cuidado ao exibir a senha em locais públicos ou com outras pessoas por perto.
            </Typography>
          </Alert>
        </CardContent>
      </Card>

      {/* Informações da Conta */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            <Buildings size={24} style={{ verticalAlign: 'middle', marginRight: 8 }} />
            Informações da Conta
          </Typography>
          <Typography paragraph>
            A página Minha Conta também exibe informações sobre seu acesso:
          </Typography>
          
          <Stack spacing={2}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                Empresa Ativa
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Se você tem acesso a múltiplas empresas, mostra qual empresa está selecionada atualmente. 
                Use o seletor de empresa no topo da tela para alternar.
              </Typography>
            </Paper>
            
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                Papel/Função
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Exibe seu papel na empresa atual (ex: Administrador, Vendedor, Atendente). 
                O papel determina quais funcionalidades você pode acessar.
              </Typography>
            </Paper>
            
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                Último Acesso
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Data e hora do seu último login no sistema. Útil para identificar acessos indevidos.
              </Typography>
            </Paper>
          </Stack>
        </CardContent>
      </Card>

      {/* Recuperação de Senha */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            <Key size={24} style={{ verticalAlign: 'middle', marginRight: 8 }} />
            Esqueci Minha Senha
          </Typography>
          <Typography paragraph>
            Se você esqueceu sua senha e não consegue acessar o sistema:
          </Typography>
          
          <Box sx={{ pl: 2 }}>
            <ol style={{ margin: 0, paddingLeft: 16 }}>
              <li><Typography variant="body2" sx={{ mb: 1 }}>Na tela de login, clique em "Esqueci minha senha"</Typography></li>
              <li><Typography variant="body2" sx={{ mb: 1 }}>Informe o e-mail cadastrado na sua conta</Typography></li>
              <li><Typography variant="body2" sx={{ mb: 1 }}>Você receberá um e-mail com um link de recuperação</Typography></li>
              <li><Typography variant="body2" sx={{ mb: 1 }}>Clique no link e defina uma nova senha</Typography></li>
              <li><Typography variant="body2" sx={{ mb: 1 }}>Use a nova senha para acessar o sistema</Typography></li>
            </ol>
          </Box>

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              O link de recuperação expira em <strong>24 horas</strong>. Se não receber o e-mail, 
              verifique a pasta de spam ou solicite novamente.
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
                <strong>E-mail atualizado:</strong> Mantenha seu e-mail sempre atualizado. 
                Ele é usado para recuperação de senha e comunicações importantes.
              </Typography>
            </Alert>
            
            <Alert severity="info" icon={<Info size={20} />}>
              <Typography variant="body2">
                <strong>Senha forte:</strong> Use uma combinação única de letras, números e símbolos. 
                Evite datas de nascimento, nomes ou sequências óbvias.
              </Typography>
            </Alert>
            
            <Alert severity="warning" icon={<Warning size={20} />}>
              <Typography variant="body2">
                <strong>Não compartilhe:</strong> Nunca compartilhe sua senha com outras pessoas. 
                Cada usuário deve ter seu próprio acesso no sistema.
              </Typography>
            </Alert>
            
            <Alert severity="info" icon={<Info size={20} />}>
              <Typography variant="body2">
                <strong>Sessão segura:</strong> Ao usar computadores compartilhados, sempre faça 
                logout ao terminar. Use a opção "Sair" no menu do usuário.
              </Typography>
            </Alert>
            
            <Alert severity="success" icon={<Lightbulb size={20} />}>
              <Typography variant="body2">
                <strong>Foto profissional:</strong> Use uma foto clara e profissional. 
                Isso ajuda outros usuários a identificá-lo em ambientes compartilhados.
              </Typography>
            </Alert>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
