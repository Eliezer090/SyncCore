import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { formatDatabaseError } from '@/lib/db-errors';
import type { Produto } from '@/types/database';
import { getAuthUser, getEmpresaIdParaQuery } from '@/lib/auth/middleware';

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const { user, error } = getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: error || 'Não autorizado' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '0');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const categoriaId = searchParams.get('categoria_id');
    const offset = page * limit;

    // Obter empresa_id do token (não do parâmetro, por segurança)
    const empresaIdFiltro = getEmpresaIdParaQuery(user);

    let sql = `
      SELECT p.*, e.nome as empresa_nome, c.nome as categoria_nome
      FROM produtos p
      LEFT JOIN empresas e ON p.empresa_id = e.id
      LEFT JOIN categorias_produto c ON p.categoria_id = c.id
      WHERE 1=1
    `;
    const params: unknown[] = [];
    let paramCount = 0;

    // Filtrar por empresa (obrigatório para não-admin_global, ou se admin selecionou uma empresa)
    if (empresaIdFiltro !== null) {
      paramCount++;
      sql += ` AND p.empresa_id = $${paramCount}`;
      params.push(empresaIdFiltro);
    }

    if (search) {
      paramCount++;
      sql += ` AND (p.nome ILIKE $${paramCount} OR p.descricao ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    if (categoriaId) {
      paramCount++;
      sql += ` AND p.categoria_id = $${paramCount}`;
      params.push(categoriaId);
    }

    sql += ' ORDER BY p.nome';
    sql += ` LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const produtos = await query<Produto & { empresa_nome: string; categoria_nome: string }>(sql, params);

    // Conta total
    let countSql = 'SELECT COUNT(*) as total FROM produtos WHERE 1=1';
    const countParams: unknown[] = [];
    let countParamIndex = 0;

    if (empresaIdFiltro !== null) {
      countParamIndex++;
      countSql += ` AND empresa_id = $${countParamIndex}`;
      countParams.push(empresaIdFiltro);
    }

    if (search) {
      countParamIndex++;
      countSql += ` AND (nome ILIKE $${countParamIndex} OR descricao ILIKE $${countParamIndex})`;
      countParams.push(`%${search}%`);
    }

    if (categoriaId) {
      countParamIndex++;
      countSql += ` AND categoria_id = $${countParamIndex}`;
      countParams.push(categoriaId);
    }

    const countResult = await queryOne<{ total: string }>(countSql, countParams);
    const total = parseInt(countResult?.total || '0');

    return NextResponse.json({ data: produtos, total, page, limit });
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    return NextResponse.json({ error: formatDatabaseError(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { empresa_id, categoria_id, nome, descricao, preco, controla_estoque, ativo, url_imagem } = body;

    const sql = `
      INSERT INTO produtos (empresa_id, categoria_id, nome, descricao, preco, controla_estoque, ativo, url_imagem)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const params = [empresa_id, categoria_id, nome, descricao, preco, controla_estoque ?? true, ativo ?? true, url_imagem];

    const result = await queryOne<Produto>(sql, params);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    return NextResponse.json({ error: formatDatabaseError(error) }, { status: 500 });
  }
}
