import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import type { EstoqueMovimentacao } from '@/types/database';
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
    const produtoId = searchParams.get('produto_id');
    const tipo = searchParams.get('tipo');
    const offset = page * limit;

    let sql = `
      SELECT em.*, p.nome as produto_nome, e.nome as empresa_nome
      FROM estoque_movimentacoes em
      LEFT JOIN produtos p ON em.produto_id = p.id
      LEFT JOIN empresas e ON p.empresa_id = e.id
      WHERE 1=1
    `;
    const params: unknown[] = [];
    let paramCount = 0;

    if (produtoId) {
      paramCount++;
      sql += ` AND em.produto_id = $${paramCount}`;
      params.push(produtoId);
    }

    // Filtrar por empresa (obrigatório para não-admin_global, ou se admin selecionou uma empresa)
    if (empresaIdFiltro !== null) {
      paramCount++;
      sql += ` AND p.empresa_id = $${paramCount}`;
      params.push(empresaIdFiltro);
    }

    if (tipo) {
      paramCount++;
      sql += ` AND em.tipo = $${paramCount}`;
      params.push(tipo);
    }

    sql += ' ORDER BY em.criado_em DESC';
    sql += ` LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const movimentacoes = await query<EstoqueMovimentacao & { produto_nome: string; empresa_nome: string }>(sql, params);

    let countSql = `
      SELECT COUNT(*) as total 
      FROM estoque_movimentacoes em
      LEFT JOIN produtos p ON em.produto_id = p.id
      WHERE 1=1
    `;
    const countParams: unknown[] = [];
    let countParamIndex = 0;

    if (produtoId) {
      countParamIndex++;
      countSql += ` AND em.produto_id = $${countParamIndex}`;
      countParams.push(produtoId);
    }

    // Filtrar por empresa (obrigatório para não-admin_global, ou se admin selecionou uma empresa)
    if (empresaIdFiltro !== null) {
      countParamIndex++;
      countSql += ` AND p.empresa_id = $${countParamIndex}`;
      countParams.push(empresaIdFiltro);
    }

    if (tipo) {
      countParamIndex++;
      countSql += ` AND em.tipo = $${countParamIndex}`;
      countParams.push(tipo);
    }

    const countResult = await queryOne<{ total: string }>(countSql, countParams);
    const total = parseInt(countResult?.total || '0');

    return NextResponse.json({ data: movimentacoes, total, page, limit });
  } catch (error) {
    console.error('Erro ao buscar movimentações:', error);
    return NextResponse.json({ error: 'Erro ao buscar movimentações' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { produto_id, tipo, quantidade, motivo } = body;

    const sql = `
      INSERT INTO estoque_movimentacoes (produto_id, tipo, quantidade, motivo)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const params = [produto_id, tipo, quantidade, motivo];

    const result = await queryOne<EstoqueMovimentacao>(sql, params);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar movimentação:', error);
    return NextResponse.json({ error: 'Erro ao criar movimentação' }, { status: 500 });
  }
}
