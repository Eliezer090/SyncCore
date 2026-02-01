'use client';

import * as React from 'react';
import type { NavItemConfig } from '@/types/nav';
import type { PermissaoCompleta } from '@/types/database';
import type { ModeloNegocio } from '@/types/user';
import { useUser } from './use-user';
import { paths } from '@/paths';

export interface NavGroupConfig {
  key: string;
  title: string;
  items: NavItemConfig[];
}

// Mapeamento de recurso_codigo para configuração do menu
// modeloNegocio: 'produto', 'servico', 'ambos' ou undefined (sempre visível)
const recursoToNavItem: Record<string, { 
  title: string; 
  href: string; 
  icon: string;
  grupo: string;
  subGrupo?: string;
  modeloNegocio?: 'produto' | 'servico'; // Se definido, só aparece para esse modelo (ou 'ambos')
}> = {
  'dashboard': { title: 'Dashboard', href: paths.dashboard.overview, icon: 'chart-pie', grupo: 'Geral' },
  'empresas': { title: 'Empresas', href: paths.dashboard.empresas, icon: 'buildings', grupo: 'Geral' },
  'clientes': { title: 'Clientes', href: paths.dashboard.clientes, icon: 'users-four', grupo: 'Geral' },
  'usuarios': { title: 'Usuários', href: paths.dashboard.usuarios, icon: 'user-circle', grupo: 'Geral' },
  'enderecos': { title: 'Endereços', href: paths.dashboard.enderecos, icon: 'map-pin', grupo: 'Geral' },
  'horarios-empresa': { title: 'Horários Empresa', href: paths.dashboard.horariosEmpresa, icon: 'clock', grupo: 'Geral' },
  
  // Produtos & Pedidos - Catálogo (só para modelo 'produto' ou 'ambos')
  'categorias-produto': { title: 'Categorias', href: paths.dashboard.categoriasProduto, icon: 'list-bullets', grupo: 'Produtos & Pedidos', subGrupo: 'Catálogo', modeloNegocio: 'produto' },
  'produtos': { title: 'Produtos', href: paths.dashboard.produtos, icon: 'cube', grupo: 'Produtos & Pedidos', subGrupo: 'Catálogo', modeloNegocio: 'produto' },
  'produto-variacoes': { title: 'Variações', href: paths.dashboard.produtoVariacoes, icon: 'cube', grupo: 'Produtos & Pedidos', subGrupo: 'Catálogo', modeloNegocio: 'produto' },
  'produto-adicionais': { title: 'Adicionais', href: paths.dashboard.produtoAdicionais, icon: 'cube', grupo: 'Produtos & Pedidos', subGrupo: 'Catálogo', modeloNegocio: 'produto' },
  'estoque': { title: 'Estoque', href: paths.dashboard.estoque, icon: 'warehouse', grupo: 'Produtos & Pedidos', subGrupo: 'Catálogo', modeloNegocio: 'produto' },
  
  // Produtos & Pedidos - Vendas (só para modelo 'produto' ou 'ambos')
  'pedidos': { title: 'Pedidos', href: paths.dashboard.pedidos, icon: 'shopping-cart', grupo: 'Produtos & Pedidos', subGrupo: 'Vendas', modeloNegocio: 'produto' },
  'pedido-itens': { title: 'Itens do Pedido', href: paths.dashboard.pedidoItens, icon: 'shopping-cart', grupo: 'Produtos & Pedidos', subGrupo: 'Vendas', modeloNegocio: 'produto' },
  'pedido-item-adicionais': { title: 'Adicionais Item', href: paths.dashboard.pedidoItemAdicionais, icon: 'shopping-cart', grupo: 'Produtos & Pedidos', subGrupo: 'Vendas', modeloNegocio: 'produto' },
  'pagamentos': { title: 'Pagamentos', href: paths.dashboard.pagamentos, icon: 'credit-card', grupo: 'Produtos & Pedidos', subGrupo: 'Vendas', modeloNegocio: 'produto' },
  
  // Serviços & Agenda (só para modelo 'servico' ou 'ambos')
  'servicos': { title: 'Serviços', href: paths.dashboard.servicos, icon: 'scissors', grupo: 'Serviços & Agenda', modeloNegocio: 'servico' },
  'profissionais': { title: 'Profissionais', href: paths.dashboard.profissionais, icon: 'users', grupo: 'Serviços & Agenda', subGrupo: 'Profissionais', modeloNegocio: 'servico' },
  'servicos-profissional': { title: 'Serviços do Prof.', href: paths.dashboard.servicosProfissional, icon: 'scissors', grupo: 'Serviços & Agenda', subGrupo: 'Profissionais', modeloNegocio: 'servico' },
  'expediente-profissional': { title: 'Expediente', href: paths.dashboard.expedienteProfissional, icon: 'clock', grupo: 'Serviços & Agenda', subGrupo: 'Profissionais', modeloNegocio: 'servico' },
  'bloqueios-profissional': { title: 'Bloqueios', href: paths.dashboard.bloqueiosProfissional, icon: 'prohibit', grupo: 'Serviços & Agenda', subGrupo: 'Profissionais', modeloNegocio: 'servico' },
  'agendamentos': { title: 'Agendamentos', href: paths.dashboard.agendamentos, icon: 'calendar', grupo: 'Serviços & Agenda', subGrupo: 'Agenda', modeloNegocio: 'servico' },
  'agendamento-servicos': { title: 'Serviços do Agend.', href: paths.dashboard.agendamentoServicos, icon: 'calendar', grupo: 'Serviços & Agenda', subGrupo: 'Agenda', modeloNegocio: 'servico' },
  
  // Comunicação
  'historico-conversas': { title: 'Histórico Conversas', href: paths.dashboard.historicoConversas, icon: 'chat-circle', grupo: 'Comunicação' },
  
  // Configurações
  'configuracoes': { title: 'Configurações', href: paths.dashboard.settings, icon: 'gear-six', grupo: 'Configurações' },
  'minha-conta': { title: 'Minha Conta', href: paths.dashboard.account, icon: 'user', grupo: 'Configurações' },
  'permissoes': { title: 'Permissões', href: paths.dashboard.permissoes, icon: 'shield-check', grupo: 'Configurações' },
};

// Função para verificar se um recurso deve ser visível dado o modelo de negócio
function isRecursoVisivelParaModelo(recursoConfig: typeof recursoToNavItem[string], modeloNegocio: ModeloNegocio | undefined): boolean {
  // Se o recurso não tem restrição de modelo, sempre é visível
  if (!recursoConfig.modeloNegocio) return true;
  
  // Se não há modelo definido (admin sem empresa selecionada), mostra tudo
  if (!modeloNegocio) return true;
  
  // Se a empresa trabalha com 'ambos', mostra tudo
  if (modeloNegocio === 'ambos') return true;
  
  // Caso contrário, só mostra se o modelo bate
  return recursoConfig.modeloNegocio === modeloNegocio;
}

// Ordem dos grupos
const grupoOrdem: Record<string, number> = {
  'Geral': 1,
  'Produtos & Pedidos': 2,
  'Serviços & Agenda': 3,
  'Comunicação': 4,
  'Configurações': 5,
};

// Subgrupos e seus ícones
const subGrupoConfig: Record<string, { icon: string; title: string }> = {
  'Catálogo': { icon: 'cube', title: 'Catálogo' },
  'Vendas': { icon: 'shopping-cart', title: 'Vendas' },
  'Profissionais': { icon: 'users', title: 'Profissionais' },
  'Agenda': { icon: 'calendar', title: 'Agenda' },
};

export interface UseNavItemsReturn {
  navGroups: NavGroupConfig[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useNavItems(): UseNavItemsReturn {
  const { user } = useUser();
  const [permissoes, setPermissoes] = React.useState<PermissaoCompleta[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchPermissoes = React.useCallback(async () => {
    if (!user?.papel) {
      setPermissoes([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem('custom-auth-token');
      if (!token) {
        setPermissoes([]);
        setIsLoading(false);
        return;
      }

      console.log('[useNavItems] Carregando permissões para menu, papel:', user.papel);
      const response = await fetch(`/api/permissoes?papel=${user.papel}&apenasVisualizaveis=true`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar permissões');
      }

      const data = await response.json();
      const perms = data.permissoes || [];
      console.log('[useNavItems] Permissões carregadas:', perms.length);
      setPermissoes(perms);
    } catch (err) {
      console.error('[useNavItems] Erro ao buscar permissões:', err);
      setError('Erro ao carregar menu');
      setPermissoes([]);
    } finally {
      setIsLoading(false);
    }
  }, [user?.papel]);

  React.useEffect(() => {
    fetchPermissoes();
  }, [fetchPermissoes]);

  // Gerar os grupos de navegação baseados nas permissões
  const navGroups = React.useMemo<NavGroupConfig[]>(() => {
    // Obter o modelo de negócio da empresa ativa
    const modeloNegocio = user?.empresaAtiva?.modelo_negocio || user?.empresa?.modelo_negocio;

    // Admin tem acesso a tudo (filtrado por modelo de negócio se tiver empresa selecionada)
    if (user?.papel === 'admin') {
      return gerarMenuCompleto(modeloNegocio);
    }

    if (permissoes.length === 0) {
      return [];
    }

    // Filtrar apenas permissões com pode_visualizar = true
    const permissoesVisiveis = permissoes.filter(p => p.pode_visualizar);
    
    console.log('[useNavItems] Gerando menu para', permissoesVisiveis.length, 'permissões visíveis, modelo:', modeloNegocio);

    // Agrupar por grupo
    const porGrupo: Record<string, { items: NavItemConfig[]; subGrupos: Record<string, NavItemConfig[]> }> = {};

    // Adicionar "Empresas" para gerentes (eles verão apenas sua empresa)
    if (user?.papel === 'gerente' && user?.empresa) {
      const config = recursoToNavItem['empresas'];
      if (config) {
        if (!porGrupo[config.grupo]) {
          porGrupo[config.grupo] = { items: [], subGrupos: {} };
        }
        porGrupo[config.grupo].items.push({
          key: 'empresas',
          title: 'Minha Empresa',
          href: config.href,
          icon: config.icon,
        });
      }
    }

    permissoesVisiveis.forEach(perm => {
      const config = recursoToNavItem[perm.recurso_codigo];
      if (!config) {
        console.warn('[useNavItems] Recurso não mapeado:', perm.recurso_codigo);
        return;
      }

      // Filtrar por modelo de negócio
      if (!isRecursoVisivelParaModelo(config, modeloNegocio)) {
        return;
      }

      const grupo = config.grupo;
      if (!porGrupo[grupo]) {
        porGrupo[grupo] = { items: [], subGrupos: {} };
      }

      const navItem: NavItemConfig = {
        key: perm.recurso_codigo,
        title: config.title,
        href: config.href,
        icon: config.icon,
      };

      if (config.subGrupo) {
        // Item pertence a um subgrupo
        if (!porGrupo[grupo].subGrupos[config.subGrupo]) {
          porGrupo[grupo].subGrupos[config.subGrupo] = [];
        }
        porGrupo[grupo].subGrupos[config.subGrupo].push(navItem);
      } else {
        // Item direto no grupo
        porGrupo[grupo].items.push(navItem);
      }
    });

    // Converter para NavGroupConfig[]
    const grupos: NavGroupConfig[] = Object.entries(porGrupo)
      .map(([grupoNome, grupoData]) => {
        const items: NavItemConfig[] = [...grupoData.items];

        // Adicionar subgrupos como itens colapsáveis
        Object.entries(grupoData.subGrupos).forEach(([subGrupoNome, subItems]) => {
          if (subItems.length > 0) {
            const subGrupo = subGrupoConfig[subGrupoNome];
            items.push({
              key: subGrupoNome.toLowerCase().replace(/\s+/g, '-'),
              title: subGrupo?.title || subGrupoNome,
              icon: subGrupo?.icon || 'folder',
              items: subItems,
            });
          }
        });

        return {
          key: grupoNome.toLowerCase().replace(/\s+/g, '-'),
          title: grupoNome,
          items,
        };
      })
      .filter(g => g.items.length > 0)
      .sort((a, b) => (grupoOrdem[a.title] || 99) - (grupoOrdem[b.title] || 99));

    console.log('[useNavItems] Menu gerado:', grupos.map(g => ({ title: g.title, items: g.items.length })));
    return grupos;
  }, [permissoes, user?.papel, user?.empresa?.modelo_negocio, user?.empresaAtiva?.modelo_negocio, user?.empresa]);

  return {
    navGroups,
    isLoading,
    error,
    refetch: fetchPermissoes,
  };
}

// Função para gerar menu completo (para admin)
function gerarMenuCompleto(modeloNegocio?: ModeloNegocio): NavGroupConfig[] {
  const grupos: NavGroupConfig[] = [
    {
      key: 'geral',
      title: 'Geral',
      items: [
        { key: 'dashboard', title: 'Dashboard', href: paths.dashboard.overview, icon: 'chart-pie' },
        { key: 'empresas', title: 'Empresas', href: paths.dashboard.empresas, icon: 'buildings' },
        { key: 'clientes', title: 'Clientes', href: paths.dashboard.clientes, icon: 'users-four' },
        { key: 'usuarios', title: 'Usuários', href: paths.dashboard.usuarios, icon: 'user-circle' },
        { key: 'enderecos', title: 'Endereços', href: paths.dashboard.enderecos, icon: 'map-pin' },
        { key: 'horarios-empresa', title: 'Horários Empresa', href: paths.dashboard.horariosEmpresa, icon: 'clock' },
      ],
    },
  ];

  // Adiciona Produtos & Pedidos apenas se modelo for 'produto' ou 'ambos' ou undefined (admin sem empresa)
  if (!modeloNegocio || modeloNegocio === 'produto' || modeloNegocio === 'ambos') {
    grupos.push({
      key: 'produtos-pedidos',
      title: 'Produtos & Pedidos',
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
    });
  }

  // Adiciona Serviços & Agenda apenas se modelo for 'servico' ou 'ambos' ou undefined (admin sem empresa)
  if (!modeloNegocio || modeloNegocio === 'servico' || modeloNegocio === 'ambos') {
    grupos.push({
      key: 'servicos-agenda',
      title: 'Serviços & Agenda',
      items: [
        { key: 'servicos', title: 'Serviços', href: paths.dashboard.servicos, icon: 'scissors' },
        {
          key: 'profissionais',
          title: 'Profissionais',
          icon: 'users',
          items: [
            { key: 'profissionais-lista', title: 'Lista de Profissionais', href: paths.dashboard.profissionais, icon: 'users' },
            { key: 'servicos-profissional', title: 'Serviços do Prof.', href: paths.dashboard.servicosProfissional, icon: 'scissors' },
            { key: 'expediente-profissional', title: 'Expediente', href: paths.dashboard.expedienteProfissional, icon: 'clock' },
            { key: 'bloqueios-profissional', title: 'Bloqueios', href: paths.dashboard.bloqueiosProfissional, icon: 'prohibit' },
          ],
        },
        {
          key: 'agenda',
          title: 'Agenda',
          icon: 'calendar',
          items: [
            { key: 'agendamentos', title: 'Agendamentos', href: paths.dashboard.agendamentos, icon: 'calendar' },
            { key: 'agendamento-servicos', title: 'Serviços do Agend.', href: paths.dashboard.agendamentoServicos, icon: 'calendar' },
          ],
        },
      ],
    });
  }

  grupos.push(
    {
      key: 'comunicacao',
      title: 'Comunicação',
      items: [
        { key: 'historico-conversas', title: 'Histórico Conversas', href: paths.dashboard.historicoConversas, icon: 'chat-circle' },
      ],
    },
    {
      key: 'configuracoes',
      title: 'Configurações',
      items: [
        { key: 'settings', title: 'Configurações', href: paths.dashboard.settings, icon: 'gear-six' },
        { key: 'account', title: 'Minha Conta', href: paths.dashboard.account, icon: 'user' },
        { key: 'permissoes', title: 'Permissões', href: paths.dashboard.permissoes, icon: 'shield-check' },
      ],
    }
  );

  return grupos;
}
