import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { formatDatabaseError } from '@/lib/db-errors';
import type { Usuario } from '@/types/database';
import { getAuthUser, getEmpresaIdParaQuery } from '@/lib/auth/middleware';

// Profissionais agora são usuários com papel = 'profissional'
// A tabela profissionais foi removida e unificada com usuarios

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const { user, error } = getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: error || 'Não autorizado' }, { status: 401 });
    }

    // Obter empresa_id do token (não do parâmetro, por segurança)
    const empresaIdFiltro = getEmpresaIdParaQuery(user);

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '0');
    const limit = parseInt(searchParams.get('limit') || '10');
    const apenasAtivos = searchParams.get('apenas_ativos') !== 'false'; // default true
    const offset = page * limit;

    let sql = `
      SELECT u.id, u.empresa_id, u.nome, u.email, u.papel, u.ativo, u.criado_em, u.url_foto,
             e.nome as empresa_nome
      FROM usuarios u
      LEFT JOIN empresas e ON u.empresa_id = e.id
      WHERE u.papel = 'profissional'
    `;
    const params: unknown[] = [];
    let paramCount = 0;

    // Filtrar por empresa (obrigatório para não-admin_global, ou se admin selecionou uma empresa)
    if (empresaIdFiltro !== null) {
      paramCount++;
      sql += ` AND u.empresa_id = $${paramCount}`;
      params.push(empresaIdFiltro);
    }

    // Filtrar apenas ativos por padrão
    if (apenasAtivos) {
      sql += ` AND u.ativo = true`;
    }

    sql += ' ORDER BY u.nome';
    sql += ` LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const profissionais = await query<Usuario & { empresa_nome: string }>(sql, params);

    let countSql = `SELECT COUNT(*) as total FROM usuarios WHERE papel = 'profissional'`;
    const countParams: unknown[] = [];
    let countParamIndex = 0;
    
    // Filtrar por empresa
    if (empresaIdFiltro !== null) {
      countParamIndex++;
      countSql += ` AND empresa_id = $${countParamIndex}`;
      countParams.push(empresaIdFiltro);
    }

    if (apenasAtivos) {
      countSql += ` AND ativo = true`;
    }

    const countResult = await queryOne<{ total: string }>(countSql, countParams);
    const total = parseInt(countResult?.total || '0');

    return NextResponse.json({ data: profissionais, total, page, limit });
  } catch (error) {
    console.error('Erro ao buscar profissionais:', error);
    return NextResponse.json({ error: formatDatabaseError(error) }, { status: 500 });
  }
}

// POST não é mais necessário aqui - use /api/usuarios com papel = 'profissional'
// Mantido apenas para compatibilidade
export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'Para criar profissionais, use POST /api/usuarios com papel="profissional"' },
    { status: 400 }
  );
}
