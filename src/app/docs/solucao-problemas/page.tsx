'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import { 
  Wrench,
  CaretDown,
  Warning,
  Bug,
  Lock,
  Calendar,
  ShoppingCart,
  Gear,
  WifiSlash,
  Database,
  Lightning,
  CheckCircle,
  ArrowRight,
  Info,
  Lightbulb,
  ArrowsClockwise,
} from '@phosphor-icons/react';

interface Problema {
  titulo: string;
  sintomas: string[];
  causas: string[];
  solucoes: string[];
}

const problemasComuns: { categoria: string; icone: React.ReactNode; cor: string; problemas: Problema[] }[] = [
  {
    categoria: 'Problemas de Login e Acesso',
    icone: <Lock size={24} />,
    cor: '#ef4444',
    problemas: [
      {
        titulo: 'Não consigo fazer login',
        sintomas: [
          'Mensagem "Credenciais inválidas"',
          'Senha não aceita após trocar',
          'Tela de login não carrega',
        ],
        causas: [
          'Senha digitada incorretamente (verifique Caps Lock)',
          'E-mail cadastrado com erro de digitação',
          'Cookie de sessão expirado ou corrompido',
        ],
        solucoes: [
          'Verifique se o Caps Lock está desligado',
          'Use a opção "Esqueci minha senha" para redefinir',
          'Limpe os cookies do navegador e tente novamente',
          'Tente em uma janela anônima/privada',
        ],
      },
      {
        titulo: 'Acesso bloqueado após várias tentativas',
        sintomas: [
          'Mensagem "Conta temporariamente bloqueada"',
          'Não aceita a senha mesmo estando correta',
        ],
        causas: [
          'Excesso de tentativas de login com senha errada',
          'Possível tentativa de acesso não autorizado',
        ],
        solucoes: [
          'Aguarde 15 minutos e tente novamente',
          'Use "Esqueci minha senha" para redefinir',
          'Contate o administrador do sistema se persistir',
        ],
      },
      {
        titulo: 'Não recebo o e-mail de recuperação de senha',
        sintomas: [
          'E-mail não chega após solicitar recuperação',
          'Já verificou spam e não encontrou',
        ],
        causas: [
          'E-mail cadastrado incorretamente',
          'Bloqueio pelo provedor de e-mail',
          'Caixa de entrada cheia',
        ],
        solucoes: [
          'Verifique a pasta de spam/lixo eletrônico',
          'Adicione nosso domínio à lista de remetentes confiáveis',
          'Tente com outro e-mail se possível',
          'Contate o suporte informando o problema',
        ],
      },
    ],
  },
  {
    categoria: 'Problemas com Agendamentos',
    icone: <Calendar size={24} />,
    cor: '#9c27b0',
    problemas: [
      {
        titulo: 'Horários não aparecem para agendamento',
        sintomas: [
          'Nenhum horário disponível no calendário',
          'Todos os horários aparecem como ocupados',
          'Profissional não aparece na lista',
        ],
        causas: [
          'Expediente do profissional não configurado',
          'Profissional não vinculado aos serviços',
          'Bloqueio cadastrado no período',
          'Horários da empresa não definidos',
        ],
        solucoes: [
          'Configure o expediente do profissional (dias e horários)',
          'Vincule o profissional aos serviços desejados',
          'Verifique se há bloqueios cadastrados no período',
          'Confirme que os horários da empresa estão definidos',
        ],
      },
      {
        titulo: 'Erro ao confirmar agendamento',
        sintomas: [
          'Mensagem de erro ao salvar',
          'Agendamento não aparece após confirmar',
        ],
        causas: [
          'Conflito de horário com outro agendamento',
          'Campos obrigatórios não preenchidos',
          'Problema de conexão durante o salvamento',
        ],
        solucoes: [
          'Verifique se o horário já não está ocupado',
          'Preencha todos os campos obrigatórios',
          'Verifique sua conexão e tente novamente',
          'Atualize a página e refaça o agendamento',
        ],
      },
      {
        titulo: 'Agendamento sumiu do calendário',
        sintomas: [
          'Agendamento não aparece mais no sistema',
          'Cliente diz que agendou mas não consta',
        ],
        causas: [
          'Agendamento pode ter sido cancelado',
          'Filtro de visualização incorreto',
          'Empresa ou profissional incorretos selecionados',
        ],
        solucoes: [
          'Verifique os agendamentos cancelados',
          'Limpe os filtros de data e status',
          'Confirme se está na empresa correta',
          'Busque pelo nome do cliente na listagem',
        ],
      },
    ],
  },
  {
    categoria: 'Problemas com Pedidos',
    icone: <ShoppingCart size={24} />,
    cor: '#667eea',
    problemas: [
      {
        titulo: 'Não consigo adicionar itens ao pedido',
        sintomas: [
          'Botão de adicionar não funciona',
          'Produto não aparece na lista',
          'Erro ao selecionar variação',
        ],
        causas: [
          'Produto desativado ou sem estoque',
          'Variação obrigatória não selecionada',
          'Problema de carregamento da página',
        ],
        solucoes: [
          'Verifique se o produto está ativo e com estoque',
          'Selecione uma variação se o produto exigir',
          'Atualize a página (F5) e tente novamente',
          'Limpe o cache do navegador',
        ],
      },
      {
        titulo: 'Preço do pedido está incorreto',
        sintomas: [
          'Total não confere com a soma dos itens',
          'Desconto não foi aplicado',
          'Adicional não somou no preço',
        ],
        causas: [
          'Preço do produto foi alterado recentemente',
          'Condições do desconto não atendidas',
          'Erro no cálculo de adicionais',
        ],
        solucoes: [
          'Verifique o preço atual do produto',
          'Confirme as condições para aplicar desconto',
          'Revise os adicionais selecionados e seus preços',
          'Recrie o pedido se necessário',
        ],
      },
      {
        titulo: 'Não consigo alterar o status do pedido',
        sintomas: [
          'Botões de status desabilitados',
          'Erro ao tentar mudar para próximo status',
        ],
        causas: [
          'Usuário sem permissão para alterar status',
          'Pedido já finalizado ou cancelado',
          'Fluxo de status não permite a mudança',
        ],
        solucoes: [
          'Verifique suas permissões com o administrador',
          'Confirme que o pedido não está finalizado',
          'Siga o fluxo correto de status (não pule etapas)',
        ],
      },
    ],
  },
  {
    categoria: 'Problemas de Desempenho',
    icone: <Lightning size={24} />,
    cor: '#f59e0b',
    problemas: [
      {
        titulo: 'Sistema muito lento',
        sintomas: [
          'Páginas demoram para carregar',
          'Ações levam muito tempo',
          'Sistema "trava" durante o uso',
        ],
        causas: [
          'Conexão de internet instável ou lenta',
          'Muitas abas do navegador abertas',
          'Cache do navegador muito grande',
          'Computador com pouca memória',
        ],
        solucoes: [
          'Teste sua conexão de internet',
          'Feche abas desnecessárias do navegador',
          'Limpe o cache do navegador',
          'Reinicie o navegador ou computador',
          'Use o Chrome ou Firefox (navegadores recomendados)',
        ],
      },
      {
        titulo: 'Imagens não carregam',
        sintomas: [
          'Fotos de produtos aparecem quebradas',
          'Avatar dos usuários não aparece',
          'Ícone de imagem não encontrada',
        ],
        causas: [
          'Problema de conexão com o servidor de imagens',
          'Imagem foi excluída ou movida',
          'Bloqueio por firewall ou antivírus',
        ],
        solucoes: [
          'Atualize a página (F5 ou Ctrl+F5)',
          'Verifique se o problema é em todas as imagens',
          'Teste em outro navegador',
          'Desabilite extensões de bloqueio temporariamente',
        ],
      },
    ],
  },
  {
    categoria: 'Problemas de Permissões',
    icone: <Gear size={24} />,
    cor: '#6b7280',
    problemas: [
      {
        titulo: 'Menu ou funcionalidade não aparece',
        sintomas: [
          'Item do menu lateral não está visível',
          'Botão de ação não aparece na tela',
          'Mensagem "Acesso negado"',
        ],
        causas: [
          'Seu papel não tem permissão para esta função',
          'Funcionalidade não está habilitada para sua empresa',
          'Permissão foi removida recentemente',
        ],
        solucoes: [
          'Verifique com o administrador quais são suas permissões',
          'Solicite a permissão necessária se precisar do acesso',
          'Confirme que está logado na empresa correta',
        ],
      },
      {
        titulo: 'Não consigo editar um registro',
        sintomas: [
          'Campos aparecem desabilitados',
          'Botão "Salvar" não está disponível',
          'Erro de permissão ao salvar',
        ],
        causas: [
          'Permissão apenas para visualização',
          'Registro bloqueado para edição',
          'Período de edição expirado',
        ],
        solucoes: [
          'Solicite permissão de edição ao administrador',
          'Verifique se o registro está bloqueado',
          'Alguns registros não podem ser editados após certo tempo',
        ],
      },
    ],
  },
  {
    categoria: 'Problemas de Conexão',
    icone: <WifiSlash size={24} />,
    cor: '#dc2626',
    problemas: [
      {
        titulo: 'Erro de conexão com o servidor',
        sintomas: [
          'Mensagem "Não foi possível conectar"',
          'Erro 500 ou 503',
          'Página em branco',
        ],
        causas: [
          'Servidor temporariamente indisponível',
          'Manutenção programada em andamento',
          'Problema de infraestrutura',
        ],
        solucoes: [
          'Aguarde alguns minutos e tente novamente',
          'Verifique se há avisos de manutenção',
          'Teste o acesso em outro dispositivo',
          'Contate o suporte se persistir por muito tempo',
        ],
      },
      {
        titulo: 'Sessão expira frequentemente',
        sintomas: [
          'Sistema pede login várias vezes ao dia',
          'Perde as alterações não salvas',
        ],
        causas: [
          'Configuração de timeout da sessão',
          'Cookies sendo bloqueados ou limpos',
          'Múltiplos dispositivos usando a mesma conta',
        ],
        solucoes: [
          'Salve seu trabalho frequentemente',
          'Permita cookies do sistema no navegador',
          'Evite usar a mesma conta em vários dispositivos',
          'Faça login novamente quando solicitado',
        ],
      },
    ],
  },
];

export default function SolucaoProblemasPage() {
  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Wrench size={40} weight="duotone" color="#667eea" />
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Solução de Problemas
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Guia para resolver os problemas mais comuns do sistema
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Divider sx={{ mb: 4 }} />

      {/* Introdução */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            🔧 Sobre Este Guia
          </Typography>
          <Typography paragraph>
            Este guia reúne os problemas mais frequentes relatados pelos usuários do SyncCore, 
            junto com suas possíveis causas e soluções. Antes de contatar o suporte, 
            tente as soluções aqui descritas.
          </Typography>
          <Alert severity="info">
            <Typography variant="body2">
              <strong>Dica:</strong> Use <strong>Ctrl+F</strong> (ou Cmd+F no Mac) para buscar 
              palavras-chave relacionadas ao seu problema nesta página.
            </Typography>
          </Alert>
        </CardContent>
      </Card>

      {/* Passos Básicos */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            ⚡ Passos Básicos (Tente Primeiro!)
          </Typography>
          <Typography paragraph>
            Antes de investigar problemas específicos, tente estas soluções universais:
          </Typography>
          
          <Stack spacing={2}>
            <Paper variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
              <ArrowsClockwise size={24} color="#667eea" />
              <Box>
                <Typography variant="subtitle2" fontWeight="bold">1. Atualize a página</Typography>
                <Typography variant="body2" color="text.secondary">
                  Pressione F5 ou Ctrl+F5 para forçar o recarregamento completo
                </Typography>
              </Box>
            </Paper>
            
            <Paper variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Bug size={24} color="#667eea" />
              <Box>
                <Typography variant="subtitle2" fontWeight="bold">2. Limpe o cache do navegador</Typography>
                <Typography variant="body2" color="text.secondary">
                  Ctrl+Shift+Delete → Selecione "Arquivos em cache" → Limpar
                </Typography>
              </Box>
            </Paper>
            
            <Paper variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Lock size={24} color="#667eea" />
              <Box>
                <Typography variant="subtitle2" fontWeight="bold">3. Faça logout e login novamente</Typography>
                <Typography variant="body2" color="text.secondary">
                  Saia do sistema e entre novamente para renovar a sessão
                </Typography>
              </Box>
            </Paper>
            
            <Paper variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
              <WifiSlash size={24} color="#667eea" />
              <Box>
                <Typography variant="subtitle2" fontWeight="bold">4. Verifique sua conexão</Typography>
                <Typography variant="body2" color="text.secondary">
                  Teste se outros sites funcionam normalmente
                </Typography>
              </Box>
            </Paper>
          </Stack>
        </CardContent>
      </Card>

      {/* Problemas por Categoria */}
      {problemasComuns.map((categoria) => (
        <Card key={categoria.categoria} sx={{ mb: 4 }}>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
              <Box sx={{ color: categoria.cor }}>{categoria.icone}</Box>
              <Typography variant="h6" fontWeight="bold">
                {categoria.categoria}
              </Typography>
            </Stack>
            
            {categoria.problemas.map((problema, index) => (
              <Accordion key={index} sx={{ mb: 1 }}>
                <AccordionSummary expandIcon={<CaretDown />}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Warning size={18} color={categoria.cor} />
                    <Typography fontWeight="medium">{problema.titulo}</Typography>
                  </Stack>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ pl: 2 }}>
                    {/* Sintomas */}
                    <Typography variant="subtitle2" fontWeight="bold" color="error.main" gutterBottom>
                      Sintomas:
                    </Typography>
                    <Box sx={{ pl: 2, mb: 2 }}>
                      {problema.sintomas.map((sintoma, i) => (
                        <Stack key={i} direction="row" spacing={1} alignItems="flex-start" sx={{ mb: 0.5 }}>
                          <Bug size={14} style={{ marginTop: 4 }} />
                          <Typography variant="body2">{sintoma}</Typography>
                        </Stack>
                      ))}
                    </Box>
                    
                    {/* Possíveis Causas */}
                    <Typography variant="subtitle2" fontWeight="bold" color="warning.main" gutterBottom>
                      Possíveis Causas:
                    </Typography>
                    <Box sx={{ pl: 2, mb: 2 }}>
                      {problema.causas.map((causa, i) => (
                        <Stack key={i} direction="row" spacing={1} alignItems="flex-start" sx={{ mb: 0.5 }}>
                          <Info size={14} style={{ marginTop: 4 }} />
                          <Typography variant="body2">{causa}</Typography>
                        </Stack>
                      ))}
                    </Box>
                    
                    {/* Soluções */}
                    <Typography variant="subtitle2" fontWeight="bold" color="success.main" gutterBottom>
                      Soluções:
                    </Typography>
                    <Box sx={{ pl: 2 }}>
                      {problema.solucoes.map((solucao, i) => (
                        <Stack key={i} direction="row" spacing={1} alignItems="flex-start" sx={{ mb: 0.5 }}>
                          <CheckCircle size={14} color="#22c55e" weight="fill" style={{ marginTop: 4 }} />
                          <Typography variant="body2">{solucao}</Typography>
                        </Stack>
                      ))}
                    </Box>
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}
          </CardContent>
        </Card>
      ))}

      {/* Ainda com problemas? */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            🆘 Ainda com Problemas?
          </Typography>
          <Typography paragraph>
            Se você tentou as soluções acima e o problema persiste, entre em contato com o suporte:
          </Typography>
          
          <Stack spacing={2}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                Informações para o Suporte
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Ao contatar o suporte, tenha em mãos:
              </Typography>
              <Box sx={{ pl: 2, mt: 1 }}>
                <ul style={{ margin: 0, paddingLeft: 16 }}>
                  <li><Typography variant="body2">Descrição detalhada do problema</Typography></li>
                  <li><Typography variant="body2">Passos para reproduzir o erro</Typography></li>
                  <li><Typography variant="body2">Mensagem de erro exibida (se houver)</Typography></li>
                  <li><Typography variant="body2">Navegador e versão utilizados</Typography></li>
                  <li><Typography variant="body2">Print da tela (se possível)</Typography></li>
                </ul>
              </Box>
            </Paper>
            
            <Alert severity="success" icon={<Lightbulb size={20} />}>
              <Typography variant="body2">
                <strong>Dica:</strong> Quanto mais detalhes você fornecer, mais rápido conseguiremos 
                identificar e resolver seu problema!
              </Typography>
            </Alert>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
