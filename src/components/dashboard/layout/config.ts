import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';
import type { User, ModeloNegocio, UserPapel } from '@/types/user';

export interface NavGroupConfig {
  key: string;
  title: string;
  items: NavItemConfig[];
  // Restrições de visibilidade
  roles?: UserPapel[];           // Papéis que podem ver (undefined = todos)
  modeloNegocio?: ModeloNegocio[]; // Tipos de empresa que podem ver (undefined = todos)
}

// Definição base dos grupos de navegação
const navGroupsBase: NavGroupConfig[] = [
  // ================ ÁREA COMUM ================
  {
    key: 'comum',
    title: 'Geral',
    items: [
      { key: 'overview', title: 'Dashboard', href: paths.dashboard.overview, icon: 'chart-pie' },
      { key: 'empresas', title: 'Empresas', href: paths.dashboard.empresas, icon: 'buildings' },
      { key: 'clientes', title: 'Clientes', href: paths.dashboard.clientes, icon: 'users-four' },
      { key: 'usuarios', title: 'Usuários', href: paths.dashboard.usuarios, icon: 'user-circle' },
      { key: 'enderecos', title: 'Endereços', href: paths.dashboard.enderecos, icon: 'map-pin' },
      { key: 'horarios-empresa', title: 'Horários Empresa', href: paths.dashboard.horariosEmpresa, icon: 'clock' },
    ],
  },

  // ================ PRODUTOS E PEDIDOS ================
  {
    key: 'produtos-pedidos',
    title: 'Produtos & Pedidos',
    modeloNegocio: ['produto', 'ambos'], // Só aparece para empresas de produto ou ambos
    items: [
      {
        key: 'catalogo',
        title: 'Catálogo',
        icon: 'cube',
        items: [
          { key: 'categorias-produto', title: 'Categorias', href: paths.dashboard.categoriasProduto, icon: 'list-bullets' },
          { key: 'produtos', title: 'Produtos', href: paths.dashboard.produtos, icon: 'cube' },
          { key: 'produto-variacoes', title: 'Variações', href: paths.dashboard.produtoVariacoes, icon: 'cube' },
          { key: 'produto-adicionais', title: 'Adicionais', href: paths.dashboard.produtoAdicionais, icon: 'cube' },
          { key: 'estoque', title: 'Estoque', href: paths.dashboard.estoque, icon: 'warehouse' },
        ],
      },
      {
        key: 'vendas',
        title: 'Vendas',
        icon: 'shopping-cart',
        items: [
          { key: 'pedidos', title: 'Pedidos', href: paths.dashboard.pedidos, icon: 'shopping-cart' },
          { key: 'pedido-itens', title: 'Itens do Pedido', href: paths.dashboard.pedidoItens, icon: 'shopping-cart' },
          { key: 'pedido-item-adicionais', title: 'Adicionais Item', href: paths.dashboard.pedidoItemAdicionais, icon: 'shopping-cart' },
          { key: 'pagamentos', title: 'Pagamentos', href: paths.dashboard.pagamentos, icon: 'credit-card' },
        ],
      },
    ],
  },

  // ================ SERVIÇOS E PROFISSIONAIS ================
  {
    key: 'servicos-profissionais',
    title: 'Serviços & Agenda',
    modeloNegocio: ['servico', 'ambos'], // Só aparece para empresas de serviço ou ambos
    items: [
      { key: 'servicos', title: 'Serviços', href: paths.dashboard.servicos, icon: 'scissors' },
      {
        key: 'profissionais-grupo',
        title: 'Profissionais',
        icon: 'users',
        href: paths.dashboard.profissionais,
        items: [
          { key: 'profissionais', title: 'Lista de Profissionais', href: paths.dashboard.profissionais, icon: 'users' },
          { key: 'servicos-profissional', title: 'Serviços do Prof.', href: paths.dashboard.servicosProfissional, icon: 'scissors' },
          { key: 'expediente-profissional', title: 'Expediente', href: paths.dashboard.expedienteProfissional, icon: 'clock' },
          { key: 'bloqueios-profissional', title: 'Bloqueios', href: paths.dashboard.bloqueiosProfissional, icon: 'prohibit' },
        ],
      },
      {
        key: 'agenda',
        title: 'Agenda',
        icon: 'calendar',
        href: paths.dashboard.agendamentos,
        items: [
          { key: 'agendamentos', title: 'Agendamentos', href: paths.dashboard.agendamentos, icon: 'calendar' },
          { key: 'agendamento-servicos', title: 'Serviços do Agend.', href: paths.dashboard.agendamentoServicos, icon: 'calendar' },
        ],
      },
    ],
  },

  // ================ COMUNICAÇÃO ================
  {
    key: 'comunicacao',
    title: 'Comunicação',
    items: [
      { key: 'chat', title: 'Chat WhatsApp', href: paths.dashboard.chat, icon: 'whatsapp-logo' },
    ],
  },

  // ================ CONFIGURAÇÕES ================
  {
    key: 'configuracoes',
    title: 'Configurações',
    items: [
      { key: 'settings', title: 'Configurações', href: paths.dashboard.settings, icon: 'gear-six' },
      { key: 'account', title: 'Minha Conta', href: paths.dashboard.account, icon: 'user' },
      { key: 'permissoes', title: 'Permissões', href: paths.dashboard.permissoes, icon: 'shield-check' },
    ],
    roles: ['admin', 'gerente'], // Admin e gerente vêem configurações
  },
];

// Função para filtrar menus baseado no usuário
export function getNavGroupsForUser(user: User | null): NavGroupConfig[] {
  if (!user) return [];

  const empresa = user.empresaAtiva || user.empresa;
  const modeloNegocio = empresa?.modelo_negocio;
  const papel = user.papel;

  // Profissional - menu reduzido
  if (papel === 'profissional') {
    return [
      {
        key: 'profissional',
        title: 'Minha Área',
        items: [
          { key: 'overview', title: 'Meu Dashboard', href: paths.dashboard.profissional, icon: 'chart-pie' },
          { key: 'minha-agenda', title: 'Minha Agenda', href: paths.dashboard.agendamentos, icon: 'calendar' },
          { key: 'servicos', title: 'Meus Serviços', href: paths.dashboard.servicosProfissional, icon: 'scissors' },
          { key: 'account', title: 'Minha Conta', href: paths.dashboard.account, icon: 'user' },
        ],
      },
    ];
  }

  // Admin sem empresa selecionada - mostra tudo
  if (papel === 'admin' && !empresa) {
    return navGroupsBase;
  }

  // Filtrar grupos baseado no modelo de negócio
  return navGroupsBase.filter((group) => {
    // Verificar restrição de papel
    if (group.roles && !group.roles.includes(papel)) {
      return false;
    }

    // Verificar restrição de modelo de negócio
    if (group.modeloNegocio && modeloNegocio) {
      return group.modeloNegocio.includes(modeloNegocio);
    }

    return true;
  }).map((group) => {
    // Filtrar item "Empresas" se não for admin
    if (group.key === 'comum' && papel !== 'admin') {
      return {
        ...group,
        items: group.items.filter((item) => item.key !== 'empresas'),
      };
    }
    // Filtrar item "Permissões" - só admin e gerente podem ver
    if (group.key === 'configuracoes' && !['admin', 'gerente'].includes(papel)) {
      return {
        ...group,
        items: group.items.filter((item) => item.key !== 'permissoes'),
      };
    }
    return group;
  });
}

// Exportar grupos base para compatibilidade
export const navGroups = navGroupsBase;

// Manter compatibilidade com código legado
export const navItems = navGroupsBase.flatMap(group => group.items) satisfies NavItemConfig[];

