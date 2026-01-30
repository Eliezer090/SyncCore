import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export type UserPapel = 'admin' | 'gerente' | 'profissional' | 'atendente';

export interface AuthUser {
  userId: number;
  empresaId: number | null;      // null = admin global
  empresaAtivaId?: number | null; // empresa selecionada pelo admin
  email: string;
  papel: UserPapel;
  // profissionalId removido - agora o profissional É o próprio usuario (userId)
}

export interface AuthResult {
  user: AuthUser | null;
  error?: string;
}

/**
 * Extrai e valida o usuário autenticado do token JWT
 */
export function getAuthUser(request: NextRequest): AuthResult {
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { user: null, error: 'Token não fornecido' };
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    return { user: decoded };
  } catch {
    return { user: null, error: 'Token inválido ou expirado' };
  }
}

/**
 * Retorna o empresa_id para usar nas queries
 * - Admin global: usa empresaAtivaId se selecionado, null se "todas"
 * - Outros usuários: sempre usa empresaId fixo
 */
export function getEmpresaIdParaQuery(user: AuthUser): number | null {
  if (user.papel === 'admin') {
    return user.empresaAtivaId || null; // null = todas empresas
  }
  return user.empresaId;
}

/**
 * Verifica se o usuário pode acessar uma empresa específica
 */
export function podeAcessarEmpresa(user: AuthUser, empresaId: number): boolean {
  if (user.papel === 'admin') return true;
  return user.empresaId === empresaId;
}

/**
 * Gera a cláusula WHERE para filtrar por empresa
 * @param user - Usuário autenticado
 * @param aliasTabela - Alias da tabela (ex: 'p' para produtos)
 * @returns Cláusula WHERE ou '1=1' se não precisar filtrar
 */
export function buildWhereEmpresa(
  user: AuthUser,
  aliasTabela: string = ''
): { sql: string; param: number | null } {
  const prefix = aliasTabela ? `${aliasTabela}.` : '';
  const empresaId = getEmpresaIdParaQuery(user);

  if (empresaId === null && user.papel === 'admin') {
    return { sql: '1=1', param: null }; // Sem filtro - todas empresas
  }

  if (empresaId === null) {
    // Usuário normal sem empresa - não deveria acontecer
    return { sql: '1=0', param: null }; // Bloqueia tudo
  }

  return { sql: `${prefix}empresa_id = ?`, param: empresaId };
}

/**
 * Gera filtro adicional para profissionais (só veem seus próprios dados)
 * Agora usa usuario_id diretamente, pois profissional = usuário com papel 'profissional'
 */
export function buildWhereProfissional(
  user: AuthUser,
  aliasTabela: string = ''
): { sql: string; param: number | null } {
  const prefix = aliasTabela ? `${aliasTabela}.` : '';

  if (user.papel === 'profissional') {
    return { sql: `${prefix}usuario_id = ?`, param: user.userId };
  }

  return { sql: '1=1', param: null };
}

/**
 * Middleware helper para rotas protegidas
 */
export function withAuth(
  handler: (request: NextRequest, user: AuthUser) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const { user, error } = getAuthUser(request);

    if (!user) {
      return NextResponse.json(
        { error: error || 'Não autorizado' },
        { status: 401 }
      );
    }

    return handler(request, user);
  };
}

/**
 * Middleware para verificar papel específico
 */
export function withRole(
  roles: UserPapel[],
  handler: (request: NextRequest, user: AuthUser) => Promise<NextResponse>
) {
  return withAuth(async (request, user) => {
    if (!roles.includes(user.papel)) {
      return NextResponse.json(
        { error: 'Acesso negado. Papel insuficiente.' },
        { status: 403 }
      );
    }

    return handler(request, user);
  });
}

/**
 * Valida se a rota é compatível com o tipo de empresa
 * Rotas de produto não devem ser acessadas por empresa de serviço e vice-versa
 */
export function validarRotaPorTipoEmpresa(
  rota: string,
  modeloNegocio: 'produto' | 'servico' | 'ambos'
): boolean {
  const rotasProduto = [
    '/produtos',
    '/categorias-produto',
    '/estoque',
    '/pedidos',
    '/pedido-itens',
    '/produto-variacoes',
    '/produto-adicionais',
  ];

  const rotasServico = [
    '/servicos',
    '/agendamentos',
    '/profissionais',
    '/servicos-profissional',
    '/expediente-profissional',
    '/bloqueios-profissional',
    '/agendamento-servicos',
  ];

  // Verificar se é rota de produto em empresa de serviço
  if (modeloNegocio === 'servico') {
    for (const rotaProduto of rotasProduto) {
      if (rota.includes(rotaProduto)) {
        return false;
      }
    }
  }

  // Verificar se é rota de serviço em empresa de produto
  if (modeloNegocio === 'produto') {
    for (const rotaServico of rotasServico) {
      if (rota.includes(rotaServico)) {
        return false;
      }
    }
  }

  return true;
}
