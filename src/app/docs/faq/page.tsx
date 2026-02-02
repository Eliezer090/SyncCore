import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import { CaretDown, Question, Package, Calendar, Users, Gear, WhatsappLogo } from '@phosphor-icons/react/dist/ssr';

export const metadata = {
  title: 'Perguntas Frequentes | SyncCore Docs',
};

const faqGeral = [
  {
    pergunta: 'Qual a diferença entre os modelos de negócio (Produto, Serviço, Ambos)?',
    resposta: `O modelo de negócio define quais funcionalidades estão disponíveis:

• **Produto**: Para empresas que vendem produtos (lanchonetes, lojas, e-commerce). Disponibiliza: Categorias, Produtos, Variações, Adicionais, Estoque, Pedidos, Pagamentos.

• **Serviço**: Para empresas que prestam serviços com agendamento (salões, clínicas, consultórios). Disponibiliza: Serviços, Profissionais, Expediente, Bloqueios, Agendamentos.

• **Ambos**: Combina todas as funcionalidades de Produto e Serviço. Ideal para negócios híbridos como salões que vendem produtos.`,
  },
  {
    pergunta: 'Posso mudar o modelo de negócio depois de cadastrar?',
    resposta: `Sim, você pode alterar o modelo de negócio a qualquer momento em Empresas → Editar Empresa. 

Ao mudar para um modelo mais completo (ex: Produto para Ambos), novos menus são liberados imediatamente.

Ao mudar para um modelo mais restrito (ex: Ambos para Produto), os menus de serviços serão ocultados, mas os dados não são excluídos. Se voltar ao modelo anterior, os dados estarão lá.`,
  },
  {
    pergunta: 'Como faço para excluir dados que não consigo apagar?',
    resposta: `Muitos registros não podem ser excluídos para preservar o histórico:

• **Clientes** com pedidos/agendamentos: Desative o cliente
• **Produtos** com pedidos: Desative o produto
• **Serviços** com agendamentos: Desative o serviço
• **Profissionais** com agendamentos: Desative o profissional
• **Pedidos/Agendamentos**: Use status "Cancelado"

Registros desativados não aparecem para novos cadastros mas mantêm o histórico.`,
  },
  {
    pergunta: 'O sistema funciona offline?',
    resposta: `Não, o SyncCore é um sistema web que requer conexão com internet. 

Recomendamos uma conexão estável para garantir que pedidos e agendamentos sejam registrados em tempo real, especialmente se usar a integração com WhatsApp.`,
  },
];

const faqProdutos = [
  {
    pergunta: 'Qual a diferença entre Variação e Adicional?',
    resposta: `**Variação** é uma versão diferente do mesmo produto que o cliente DEVE escolher:
- Tamanho: P, M, G
- Sabor: Chocolate, Morango
- Cor: Preto, Branco

O cliente escolhe UMA variação.

**Adicional** é um extra OPCIONAL que o cliente pode incluir:
- +Bacon (R$ 5)
- +Queijo extra (R$ 3)
- +Borda recheada (R$ 8)

O cliente pode escolher vários adicionais (ou nenhum).`,
  },
  {
    pergunta: 'Como funciona o controle de estoque?',
    resposta: `O controle de estoque é opcional por produto:

1. No cadastro do produto, ative "Controla Estoque"
2. Defina o estoque mínimo para alertas
3. Registre entradas de compras no módulo Estoque
4. O sistema desconta automaticamente nas vendas

Se "Controla Estoque" está desativado, o produto sempre aparece como disponível (útil para alimentos preparados na hora).`,
  },
  {
    pergunta: 'Produto sem estoque pode ser vendido?',
    resposta: `Se o produto tem controle de estoque ativo e chegou a zero:

• Não aparece como disponível para clientes via WhatsApp
• No sistema, aparece com alerta de "Sem estoque"
• Você pode forçar a venda manualmente, mas receberá um aviso

Para evitar problemas, mantenha o estoque atualizado e configure alertas de estoque mínimo.`,
  },
];

const faqServicos = [
  {
    pergunta: 'Por que meu profissional não aparece disponível para agendamento?',
    resposta: `Para um profissional aparecer disponível, ele precisa:

1. ✅ Estar cadastrado como usuário com papel "Profissional"
2. ✅ Estar com status "Ativo"
3. ✅ Ter expediente configurado (dias e horários de trabalho)
4. ✅ Ter pelo menos um serviço vinculado

Verifique cada item. O mais comum é esquecer de configurar o expediente.`,
  },
  {
    pergunta: 'Como faço para o profissional tirar férias?',
    resposta: `Use o módulo de Bloqueios:

1. Acesse Serviços & Agenda → Profissionais → Bloqueios
2. Crie um novo bloqueio
3. Selecione o profissional
4. Defina data/hora de início e fim das férias
5. Adicione o motivo "Férias"

O sistema impedirá novos agendamentos no período. Agendamentos já existentes precisam ser remarcados manualmente.`,
  },
  {
    pergunta: 'Posso ter preços diferentes para o mesmo serviço?',
    resposta: `Sim! Use o módulo "Serviços do Profissional":

1. Cadastre o serviço com preço base
2. Ao vincular a um profissional, configure preço específico
3. Cada profissional pode ter seu próprio valor

Exemplo: "Corte" custa R$ 30, mas com o profissional sênior custa R$ 45.

O mesmo vale para duração - um profissional mais rápido pode ter duração menor.`,
  },
  {
    pergunta: 'Cliente pode cancelar agendamento?',
    resposta: `Depende da configuração de "Tempo Limite de Cancelamento" da empresa:

• Se configurado como 120 minutos (2 horas), o cliente pode cancelar até 2 horas antes
• Após esse prazo, recomenda-se registrar como "No-Show"

Via WhatsApp, a IA informa ao cliente se ele pode ou não cancelar baseado nessa configuração.`,
  },
];

const faqWhatsApp = [
  {
    pergunta: 'O que preciso para ativar a integração com WhatsApp?',
    resposta: `A integração usa a Evolution API:

1. Ter uma instância da Evolution API configurada
2. Conectar o número de WhatsApp via QR Code
3. Configurar o webhook apontando para o SyncCore
4. Preencher a descrição da empresa (usado pela IA)

O administrador do sistema faz essa configuração. Após ativado, o sistema começa a responder automaticamente.`,
  },
  {
    pergunta: 'A IA pode errar nas respostas?',
    resposta: `A IA é muito precisa, mas depende dos dados cadastrados:

• Se preços estão desatualizados, a IA informará preços errados
• Se a descrição da empresa é vaga, as respostas podem ser incompletas
• Se produtos/serviços não têm descrição, a IA não sabe explicá-los

Mantenha seus dados atualizados e detalhados para melhores respostas.`,
  },
  {
    pergunta: 'Clientes cadastrados via WhatsApp aparecem onde?',
    resposta: `Clientes que interagem pelo WhatsApp são cadastrados automaticamente:

1. Aparecem no módulo Clientes
2. O telefone é preenchido automaticamente
3. O nome vem do perfil do WhatsApp (quando disponível)
4. Você pode completar o cadastro depois (e-mail, CPF, etc.)

O histórico de conversas fica em Geral → Histórico de Conversas.`,
  },
];

const faqUsuarios = [
  {
    pergunta: 'Esqueci minha senha. Como recupero?',
    resposta: `Na tela de login, clique em "Esqueci minha senha":

1. Informe seu e-mail cadastrado
2. Você receberá um link para redefinição
3. Clique no link e defina uma nova senha

O link expira em 1 hora. Se não receber o e-mail, verifique a caixa de spam.`,
  },
  {
    pergunta: 'Como dou acesso para um novo funcionário?',
    resposta: `Acesse Configurações → Usuários:

1. Clique em "Novo Usuário"
2. Preencha nome, e-mail e senha temporária
3. Selecione a empresa
4. Escolha o papel (Admin, Gerente, Atendente, Profissional)
5. O funcionário pode trocar a senha depois

Se for profissional que atende clientes, lembre-se de configurar também o expediente e vincular serviços.`,
  },
  {
    pergunta: 'Posso limitar o que cada usuário vê?',
    resposta: `Sim, através do módulo de Permissões:

1. Acesse Configurações → Permissões
2. Selecione o papel que deseja configurar
3. Marque/desmarque permissões por recurso e ação

Exemplo: Um "Atendente" pode visualizar/criar pedidos, mas não pode excluir nem acessar configurações.

Papéis personalizados podem ser criados em Papéis da Empresa.`,
  },
];

export default function FAQPage() {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Question size={32} color="#667eea" />
        <Typography variant="h4" fontWeight={700}>
          Perguntas Frequentes (FAQ)
        </Typography>
      </Box>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 800 }}>
        Encontre respostas para as dúvidas mais comuns sobre o SyncCore.
      </Typography>

      {/* Geral */}
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Gear size={24} />
        Geral
      </Typography>
      {faqGeral.map((item, index) => (
        <Accordion key={index} variant="outlined" sx={{ mb: 1 }}>
          <AccordionSummary expandIcon={<CaretDown />}>
            <Typography fontWeight={500}>{item.pergunta}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
              {item.resposta}
            </Typography>
          </AccordionDetails>
        </Accordion>
      ))}

      <Divider sx={{ my: 4 }} />

      {/* Produtos */}
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Package size={24} />
        Produtos & Pedidos
        <Chip label="PRODUTO" size="small" sx={{ bgcolor: '#667eea', color: 'white' }} />
      </Typography>
      {faqProdutos.map((item, index) => (
        <Accordion key={index} variant="outlined" sx={{ mb: 1 }}>
          <AccordionSummary expandIcon={<CaretDown />}>
            <Typography fontWeight={500}>{item.pergunta}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
              {item.resposta}
            </Typography>
          </AccordionDetails>
        </Accordion>
      ))}

      <Divider sx={{ my: 4 }} />

      {/* Serviços */}
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Calendar size={24} />
        Serviços & Agenda
        <Chip label="SERVIÇO" size="small" sx={{ bgcolor: '#9c27b0', color: 'white' }} />
      </Typography>
      {faqServicos.map((item, index) => (
        <Accordion key={index} variant="outlined" sx={{ mb: 1 }}>
          <AccordionSummary expandIcon={<CaretDown />}>
            <Typography fontWeight={500}>{item.pergunta}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
              {item.resposta}
            </Typography>
          </AccordionDetails>
        </Accordion>
      ))}

      <Divider sx={{ my: 4 }} />

      {/* WhatsApp */}
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <WhatsappLogo size={24} color="#25d366" />
        Integração WhatsApp
      </Typography>
      {faqWhatsApp.map((item, index) => (
        <Accordion key={index} variant="outlined" sx={{ mb: 1 }}>
          <AccordionSummary expandIcon={<CaretDown />}>
            <Typography fontWeight={500}>{item.pergunta}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
              {item.resposta}
            </Typography>
          </AccordionDetails>
        </Accordion>
      ))}

      <Divider sx={{ my: 4 }} />

      {/* Usuários */}
      <Typography variant="h5" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Users size={24} />
        Usuários & Permissões
      </Typography>
      {faqUsuarios.map((item, index) => (
        <Accordion key={index} variant="outlined" sx={{ mb: 1 }}>
          <AccordionSummary expandIcon={<CaretDown />}>
            <Typography fontWeight={500}>{item.pergunta}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
              {item.resposta}
            </Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
}
