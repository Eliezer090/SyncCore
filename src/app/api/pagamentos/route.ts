import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import type { Pagamento } from '@/types/database';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '0');
    const limit = parseInt(searchParams.get('limit') || '10');
    const pedidoId = searchParams.get('pedido_id');
    const status = searchParams.get('status');
    const offset = page * limit;

    let sql = `
      SELECT pg.*, p.id as pedido_numero, c.nome as cliente_nome
      FROM pagamentos pg
      LEFT JOIN pedidos p ON pg.pedido_id = p.id
      LEFT JOIN clientes c ON p.cliente_id = c.id
      WHERE 1=1
    `;
    const params: unknown[] = [];
    let paramCount = 0;

    if (pedidoId) {
      paramCount++;
      sql += ` AND pg.pedido_id = $${paramCount}`;
      params.push(pedidoId);
    }

    if (status) {
      paramCount++;
      sql += ` AND pg.status = $${paramCount}`;
      params.push(status);
    }

    sql += ' ORDER BY pg.id DESC';
    sql += ` LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const pagamentos = await query<Pagamento & { pedido_numero: number; cliente_nome: string }>(sql, params);

    let countSql = 'SELECT COUNT(*) as total FROM pagamentos WHERE 1=1';
    const countParams: unknown[] = [];
    let countParamIndex = 0;

    if (pedidoId) {
      countParamIndex++;
      countSql += ` AND pedido_id = $${countParamIndex}`;
      countParams.push(pedidoId);
    }

    if (status) {
      countParamIndex++;
      countSql += ` AND status = $${countParamIndex}`;
      countParams.push(status);
    }

    const countResult = await queryOne<{ total: string }>(countSql, countParams);
    const total = parseInt(countResult?.total || '0');

    return NextResponse.json({ data: pagamentos, total, page, limit });
  } catch (error) {
    console.error('Erro ao buscar pagamentos:', error);
    return NextResponse.json({ error: 'Erro ao buscar pagamentos' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pedido_id, metodo, valor, status, pago_em, url_comprovante } = body;

    const sql = `
      INSERT INTO pagamentos (pedido_id, metodo, valor, status, pago_em, url_comprovante)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const params = [pedido_id, metodo, valor, status || 'pendente', pago_em, url_comprovante];

    const result = await queryOne<Pagamento>(sql, params);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar pagamento:', error);
    return NextResponse.json({ error: 'Erro ao criar pagamento' }, { status: 500 });
  }
}
