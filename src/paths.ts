export const paths = {
  home: '/',
  auth: { signIn: '/auth/sign-in', signUp: '/auth/sign-up', resetPassword: '/auth/reset-password' },
  dashboard: {
    overview: '/dashboard',
    profissional: '/dashboard/profissional',
    account: '/dashboard/account',
    // Entidades Base
    empresas: '/dashboard/empresas',
    clientes: '/dashboard/clientes',
    usuarios: '/dashboard/usuarios',
    // Catálogo
    categoriasProduto: '/dashboard/categorias-produto',
    produtos: '/dashboard/produtos',
    produtoVariacoes: '/dashboard/produto-variacoes',
    produtoAdicionais: '/dashboard/produto-adicionais',
    servicos: '/dashboard/servicos',
    estoque: '/dashboard/estoque',
    // Profissionais
    profissionais: '/dashboard/profissionais',
    servicosProfissional: '/dashboard/servicos-profissional',
    expedienteProfissional: '/dashboard/expediente-profissional',
    bloqueiosProfissional: '/dashboard/bloqueios-profissional',
    // Pedidos
    pedidos: '/dashboard/pedidos',
    pedidoItens: '/dashboard/pedido-itens',
    pedidoItemAdicionais: '/dashboard/pedido-item-adicionais',
    pagamentos: '/dashboard/pagamentos',
    // Agendamentos
    agendamentos: '/dashboard/agendamentos',
    agendamentoServicos: '/dashboard/agendamento-servicos',
    // Endereços e Horários
    enderecos: '/dashboard/enderecos',
    horariosEmpresa: '/dashboard/horarios-empresa',
    fechamentosEmpresa: '/dashboard/fechamentos-empresa',
    // Comunicação
    historicoConversas: '/dashboard/historico-conversas',
    chat: '/dashboard/chat',
    // Relatórios
    relatorios: '/dashboard/relatorios',
    // Configurações
    permissoes: '/dashboard/permissoes',
    // Manter compatibilidade
    customers: '/dashboard/clientes',
    integrations: '/dashboard/integrations',
    settings: '/dashboard/settings',
  },
  errors: { notFound: '/errors/not-found' },
} as const;
