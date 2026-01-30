import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { formatDatabaseError } from '@/lib/db-errors';
import type { Servico } from '@/types/database';
import { getAuthUser, getEmpresaIdParaQuery } from '@/lib/auth/middleware';

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
    const search = searchParams.get('search') || '';
    const offset = page * limit;

    let sql = `
      SELECT s.*, e.nome as empresa_nome
      FROM servicos s
      LEFT JOIN empresas e ON s.empresa_id = e.id
      WHERE 1=1
    `;
    const params: unknown[] = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      sql += ` AND (s.nome ILIKE $${paramCount} OR s.descricao ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    // Filtrar por empresa (obrigatório para não-admin_global, ou se admin selecionou uma empresa)
    if (empresaIdFiltro !== null) {
      paramCount++;
      sql += ` AND s.empresa_id = $${paramCount}`;
      params.push(empresaIdFiltro);
    }

    sql += ' ORDER BY s.nome';
    sql += ` LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const servicos = await query<Servico & { empresa_nome: string }>(sql, params);

    let countSql = 'SELECT COUNT(*) as total FROM servicos WHERE 1=1';
    const countParams: unknown[] = [];
    let countParamIndex = 0;

    if (search) {
      countParamIndex++;
      countSql += ` AND (nome ILIKE $${countParamIndex} OR descricao ILIKE $${countParamIndex})`;
      countParams.push(`%${search}%`);
    }

    // Filtrar por empresa (obrigatório para não-admin_global, ou se admin selecionou uma empresa)
    if (empresaIdFiltro !== null) {
      countParamIndex++;
      countSql += ` AND empresa_id = $${countParamIndex}`;
      countParams.push(empresaIdFiltro);
    }

    const countResult = await queryOne<{ total: string }>(countSql, countParams);
    const total = parseInt(countResult?.total || '0');

    return NextResponse.json({ data: servicos, total, page, limit });
  } catch (error) {
    console.error('Erro ao buscar serviços:', error);
    return NextResponse.json({ error: formatDatabaseError(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { empresa_id, nome, descricao, ativo, url_imagem } = body;

    const sql = `
      INSERT INTO servicos (empresa_id, nome, descricao, ativo, url_imagem)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const params = [empresa_id, nome, descricao, ativo ?? true, url_imagem];

    const result = await queryOne<Servico>(sql, params);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar serviço:', error);
    return NextResponse.json({ error: formatDatabaseError(error) }, { status: 500 });
  }
}
