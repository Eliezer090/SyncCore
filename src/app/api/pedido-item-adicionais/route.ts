import { NextRequest, NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';
import type { PedidoItemAdicional } from '@/types/database';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const pedidoItemId = searchParams.get('pedido_item_id');
    const page = parseInt(searchParams.get('page') || '0');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = page * limit;

    let whereClause = '';
    const params: (string | number)[] = [];
    let paramIndex = 1;

    if (pedidoItemId) {
      whereClause = ` WHERE pia.pedido_item_id = $${paramIndex}`;
      params.push(pedidoItemId);
      paramIndex++;
    }

    // Buscar total
    const countResult = await query<{ count: string }>(`
      SELECT COUNT(*) as count FROM pedido_item_adicionais pia ${whereClause}
    `, params);
    const total = parseInt(countResult[0]?.count || '0');

    // Buscar dados com JOINs
    const data = await query<PedidoItemAdicional & { adicional_nome?: string; item_produto_nome?: string }>(`
      SELECT pia.*, pa.nome as adicional_nome, p.nome as item_produto_nome
      FROM pedido_item_adicionais pia
      LEFT JOIN produto_adicionais pa ON pia.adicional_id = pa.id
      LEFT JOIN pedido_itens pi ON pia.pedido_item_id = pi.id
      LEFT JOIN produtos p ON pi.produto_id = p.id
      ${whereClause}
      ORDER BY pia.id DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, [...params, limit, offset]);

    return NextResponse.json({ data, total });
  } catch (error) {
    console.error('Erro ao buscar adicionais do item:', error);
    return NextResponse.json({ error: 'Erro ao buscar adicionais' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pedido_item_id, adicional_id, preco } = body;

    const result = await query<PedidoItemAdicional>(`
      INSERT INTO pedido_item_adicionais (pedido_item_id, adicional_id, preco)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [pedido_item_id, adicional_id, preco]);

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Erro ao adicionar:', error);
    return NextResponse.json({ error: 'Erro ao adicionar' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const pedidoItemId = searchParams.get('pedido_item_id');
    const adicionalId = searchParams.get('adicional_id');

    if (!pedidoItemId || !adicionalId) {
      return NextResponse.json({ error: 'Parâmetros obrigatórios' }, { status: 400 });
    }

    await execute('DELETE FROM pedido_item_adicionais WHERE pedido_item_id = $1 AND adicional_id = $2', [pedidoItemId, adicionalId]);
    return NextResponse.json({ message: 'Adicional removido com sucesso' });
  } catch (error) {
    console.error('Erro ao remover adicional:', error);
    return NextResponse.json({ error: 'Erro ao remover adicional' }, { status: 500 });
  }
}
