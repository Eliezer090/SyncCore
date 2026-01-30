import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { formatDatabaseError } from '@/lib/db-errors';
import type { Pedido } from '@/types/database';
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
    const clienteId = searchParams.get('cliente_id');
    const status = searchParams.get('status');
    const offset = page * limit;

    let sql = `
      SELECT p.*, e.nome as empresa_nome, c.nome as cliente_nome, c.telefone as cliente_telefone
      FROM pedidos p
      LEFT JOIN empresas e ON p.empresa_id = e.id
      LEFT JOIN clientes c ON p.cliente_id = c.id
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

    if (clienteId) {
      paramCount++;
      sql += ` AND p.cliente_id = $${paramCount}`;
      params.push(clienteId);
    }

    if (status) {
      paramCount++;
      sql += ` AND p.status = $${paramCount}`;
      params.push(status);
    }

    sql += ' ORDER BY p.criado_em DESC';
    sql += ` LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const pedidos = await query<Pedido & { empresa_nome: string; cliente_nome: string; cliente_telefone: string }>(sql, params);

    let countSql = 'SELECT COUNT(*) as total FROM pedidos WHERE 1=1';
    const countParams: unknown[] = [];
    let countParamIndex = 0;

    // Filtrar por empresa (obrigatório para não-admin_global, ou se admin selecionou uma empresa)
    if (empresaIdFiltro !== null) {
      countParamIndex++;
      countSql += ` AND empresa_id = $${countParamIndex}`;
      countParams.push(empresaIdFiltro);
    }

    if (clienteId) {
      countParamIndex++;
      countSql += ` AND cliente_id = $${countParamIndex}`;
      countParams.push(clienteId);
    }

    if (status) {
      countParamIndex++;
      countSql += ` AND status = $${countParamIndex}`;
      countParams.push(status);
    }

    const countResult = await queryOne<{ total: string }>(countSql, countParams);
    const total = parseInt(countResult?.total || '0');

    return NextResponse.json({ data: pedidos, total, page, limit });
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    return NextResponse.json({ error: formatDatabaseError(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { empresa_id, cliente_id, tipo, status, total, observacao, endereco_id, taxa_entrega } = body;

    const sql = `
      INSERT INTO pedidos (empresa_id, cliente_id, tipo, status, total, observacao, endereco_id, taxa_entrega)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const params = [empresa_id, cliente_id, tipo, status || 'pendente', total, observacao, endereco_id, taxa_entrega || 0];

    const result = await queryOne<Pedido>(sql, params);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    return NextResponse.json({ error: formatDatabaseError(error) }, { status: 500 });
  }
}
