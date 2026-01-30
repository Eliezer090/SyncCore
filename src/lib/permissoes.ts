import { query, queryOne } from '@/lib/db';
import jwt from 'jsonwebtoken';
import type { PermissaoCompleta } from '@/types/database';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

interface TokenPayload {
  userId: number;
  empresaId: number | null;
  empresaAtivaId?: number | null;
  email: string;
  papel: string;
  // profissionalId removido - profissional é identificado pelo userId + papel
  papelEmpresaId?: number | null;
}

export interface PermissaoVerificada {
  temAcesso: boolean;
  podeVisualizar: boolean;
  podeCriar: boolean;
  podeEditar: boolean;
  podeExcluir: boolean;
}

/**
 * Extrai dados do token JWT de uma requisição
 */
export function getAuthUser(authHeader: string | null): TokenPayload | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

/**
 * Verifica permissão de um usuário para um recurso específico
 */
export async function verificarPermissao(
  papel: string,
  recursoCodigo: string,
  empresaId?: number | null,
  papelEmpresaId?: number | null
): Promise<PermissaoVerificada> {
  // Admin sempre tem acesso total
  if (papel === 'admin') {
    return {
      temAcesso: true,
      podeVisualizar: true,
      podeCriar: true,
      podeEditar: true,
      podeExcluir: true,
    };
  }

  // Usar a função do banco que considera hierarquia de permissões
  const permissao = await queryOne<PermissaoCompleta>(
    `SELECT * FROM get_permissoes_usuario($1, $2, $3) WHERE recurso_codigo = $4`,
    [papel, empresaId, papelEmpresaId, recursoCodigo]
  );

  if (!permissao) {
    return {
      temAcesso: false,
      podeVisualizar: false,
      podeCriar: false,
      podeEditar: false,
      podeExcluir: false,
    };
  }

  return {
    temAcesso: permissao.pode_visualizar,
    podeVisualizar: permissao.pode_visualizar,
    podeCriar: permissao.pode_criar,
    podeEditar: permissao.pode_editar,
    podeExcluir: permissao.pode_excluir,
  };
}

/**
 * Busca todas as permissões de um papel
 */
export async function getPermissoesPorPapel(
  papel: string,
  empresaId?: number | null,
  papelEmpresaId?: number | null
): Promise<PermissaoCompleta[]> {
  // Admin tem todas as permissões
  if (papel === 'admin') {
    const recursos = await query<PermissaoCompleta>(
      `SELECT 
        0 as id,
        'admin' as papel,
        NULL::INTEGER as empresa_id,
        NULL::INTEGER as papel_empresa_id,
        codigo as recurso_codigo,
        nome as recurso_nome,
        grupo as recurso_grupo,
        icone as recurso_icone,
        rota as recurso_rota,
        ordem,
        true as pode_visualizar,
        true as pode_criar,
        true as pode_editar,
        true as pode_excluir
       FROM recursos WHERE ativo = true ORDER BY ordem`
    );
    return recursos;
  }

  // Usar a função do banco que considera hierarquia de permissões
  return query<PermissaoCompleta>(
    'SELECT * FROM get_permissoes_usuario($1, $2, $3) WHERE pode_visualizar = true ORDER BY ordem',
    [papel, empresaId, papelEmpresaId]
  );
}

/**
 * Busca recursos que o usuário pode visualizar (para montar o menu)
 */
export async function getMenuPermitido(
  papel: string,
  empresaId?: number | null,
  papelEmpresaId?: number | null
): Promise<PermissaoCompleta[]> {
  return getPermissoesPorPapel(papel, empresaId, papelEmpresaId);
}

/**
 * Determina o empresaId a ser usado nas queries baseado no papel e empresa ativa
 */
export function getEmpresaIdParaQuery(decoded: TokenPayload): number | null {
  // Admin pode ter selecionado uma empresa específica
  if (decoded.papel === 'admin') {
    return decoded.empresaAtivaId || null; // null = todas empresas
  }
  
  // Outros usuários sempre filtram pela sua empresa
  return decoded.empresaId;
}

/**
 * Middleware helper para verificar permissão em uma API
 * Retorna null se permitido, ou NextResponse com erro se negado
 */
export async function checkApiPermission(
  authHeader: string | null,
  recursoCodigo: string,
  acao: 'visualizar' | 'criar' | 'editar' | 'excluir'
): Promise<{ error: { message: string; status: number } } | { user: TokenPayload; permissao: PermissaoVerificada }> {
  const user = getAuthUser(authHeader);
  
  if (!user) {
    return { error: { message: 'Token não fornecido ou inválido', status: 401 } };
  }

  const permissao = await verificarPermissao(
    user.papel, 
    recursoCodigo,
    user.empresaId,
    user.papelEmpresaId
  );
  
  const acaoPermitida = {
    visualizar: permissao.podeVisualizar,
    criar: permissao.podeCriar,
    editar: permissao.podeEditar,
    excluir: permissao.podeExcluir,
  }[acao];

  if (!acaoPermitida) {
    return { error: { message: `Sem permissão para ${acao} ${recursoCodigo}`, status: 403 } };
  }

  return { user, permissao };
}
