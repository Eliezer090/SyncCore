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
    const variacaoId = searchParams.get('variacao_id');
    const adicionalId = searchParams.get('adicional_id');
    const tipo = searchParams.get('tipo');
    const offset = page * limit;

    let sql = `
      SELECT em.*, 
             p.nome as produto_nome, 
             e.nome as empresa_nome,
             pv.nome as variacao_nome,
             pa.nome as adicional_nome
      FROM estoque_movimentacoes em
      LEFT JOIN produtos p ON em.produto_id = p.id
      LEFT JOIN empresas e ON p.empresa_id = e.id
      LEFT JOIN produto_variacoes pv ON em.variacao_id = pv.id
      LEFT JOIN produto_adicionais pa ON em.adicional_id = pa.id
      WHERE 1=1
    `;
    const params: unknown[] = [];
    let paramCount = 0;

    if (produtoId) {
      paramCount++;
      sql += ` AND em.produto_id = $${paramCount}`;
      params.push(produtoId);
    }

    if (variacaoId) {
      paramCount++;
      sql += ` AND em.variacao_id = $${paramCount}`;
      params.push(variacaoId);
    }

    if (adicionalId) {
      paramCount++;
      sql += ` AND em.adicional_id = $${paramCount}`;
      params.push(adicionalId);
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

    const movimentacoes = await query<EstoqueMovimentacao & { 
      produto_nome: string; 
      empresa_nome: string;
      variacao_nome: string | null;
      adicional_nome: string | null;
    }>(sql, params);

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

    if (variacaoId) {
      countParamIndex++;
      countSql += ` AND em.variacao_id = $${countParamIndex}`;
      countParams.push(variacaoId);
    }

    if (adicionalId) {
      countParamIndex++;
      countSql += ` AND em.adicional_id = $${countParamIndex}`;
      countParams.push(adicionalId);
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
    const { produto_id, variacao_id, adicional_id, tipo, quantidade, motivo } = body;

    // Validações básicas
    if (!produto_id && !variacao_id && !adicional_id) {
      return NextResponse.json({ error: 'Informe produto, variação ou adicional' }, { status: 400 });
    }

    if (!tipo || !['entrada', 'saida'].includes(tipo)) {
      return NextResponse.json({ error: 'Tipo deve ser "entrada" ou "saida"' }, { status: 400 });
    }

    if (!quantidade || quantidade <= 0) {
      return NextResponse.json({ error: 'Quantidade deve ser maior que zero' }, { status: 400 });
    }

    const sql = `
      INSERT INTO estoque_movimentacoes (produto_id, variacao_id, adicional_id, tipo, quantidade, motivo)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const params = [produto_id || null, variacao_id || null, adicional_id || null, tipo, quantidade, motivo || null];

    const result = await queryOne<EstoqueMovimentacao>(sql, params);

    // Atualizar estoque atual se for variação ou adicional
    if (variacao_id) {
      const ajuste = tipo === 'entrada' ? quantidade : -quantidade;
      await query(`
        UPDATE produto_variacoes 
        SET estoque_atual = COALESCE(estoque_atual, 0) + $1 
        WHERE id = $2
      `, [ajuste, variacao_id]);
    }

    if (adicional_id) {
      const ajuste = tipo === 'entrada' ? quantidade : -quantidade;
      await query(`
        UPDATE produto_adicionais 
        SET estoque_atual = COALESCE(estoque_atual, 0) + $1 
        WHERE id = $2
      `, [ajuste, adicional_id]);
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar movimentação:', error);
    return NextResponse.json({ error: 'Erro ao criar movimentação' }, { status: 500 });
  }
}
