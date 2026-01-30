import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { formatDatabaseError } from '@/lib/db-errors';
import type { CategoriaProduto } from '@/types/database';
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
    const offset = page * limit;

    let sql = `
      SELECT c.*, e.nome as empresa_nome 
      FROM categorias_produto c
      LEFT JOIN empresas e ON c.empresa_id = e.id
      WHERE 1=1
    `;
    const params: unknown[] = [];
    let paramCount = 0;

    // Filtrar por empresa (obrigatório para não-admin_global, ou se admin selecionou uma empresa)
    if (empresaIdFiltro !== null) {
      paramCount++;
      sql += ` AND c.empresa_id = $${paramCount}`;
      params.push(empresaIdFiltro);
    }

    sql += ' ORDER BY c.nome';
    sql += ` LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const categorias = await query<CategoriaProduto & { empresa_nome: string }>(sql, params);

    let countSql = 'SELECT COUNT(*) as total FROM categorias_produto WHERE 1=1';
    const countParams: unknown[] = [];
    let countParamIndex = 0;
    
    // Filtrar por empresa (obrigatório para não-admin_global, ou se admin selecionou uma empresa)
    if (empresaIdFiltro !== null) {
      countParamIndex++;
      countSql += ` AND empresa_id = $${countParamIndex}`;
      countParams.push(empresaIdFiltro);
    }
    const countResult = await queryOne<{ total: string }>(countSql, countParams);
    const total = parseInt(countResult?.total || '0');

    return NextResponse.json({ data: categorias, total, page, limit });
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    return NextResponse.json({ error: formatDatabaseError(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { empresa_id, nome, descricao, ativo, url_imagem } = body;

    const sql = `
      INSERT INTO categorias_produto (empresa_id, nome, descricao, ativo, url_imagem)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const params = [empresa_id, nome, descricao, ativo ?? true, url_imagem];

    const result = await queryOne<CategoriaProduto>(sql, params);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    return NextResponse.json({ error: formatDatabaseError(error) }, { status: 500 });
  }
}
