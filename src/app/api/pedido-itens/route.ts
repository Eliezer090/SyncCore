import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { PedidoItem } from '@/types/database';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '0');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = page * limit;
    const pedidoId = searchParams.get('pedido_id');

    let whereClause = '';
    const params: (string | number)[] = [];
    let paramIndex = 1;

    if (pedidoId) {
      whereClause = ` WHERE pi.pedido_id = $${paramIndex}`;
      params.push(pedidoId);
      paramIndex++;
    }

    const countResult = await query<{ count: string }>(`SELECT COUNT(*) as count FROM pedido_itens pi ${whereClause}`, params);
    const total = parseInt(countResult[0].count);

    const data = await query<PedidoItem & { produto_nome?: string; servico_nome?: string }>(`
      SELECT pi.*, p.nome as produto_nome, s.nome as servico_nome
      FROM pedido_itens pi
      LEFT JOIN produtos p ON pi.produto_id = p.id
      LEFT JOIN servicos s ON pi.servico_id = s.id
      ${whereClause}
      ORDER BY pi.id ASC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, [...params, limit, offset]);

    return NextResponse.json({ data, total, page, limit });
  } catch (error) {
    console.error('Erro ao buscar itens:', error);
    return NextResponse.json({ error: 'Erro ao buscar itens' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pedido_id, produto_id, servico_id, quantidade, preco_unitario, observacoes } = body;

    const result = await query<PedidoItem>(`
      INSERT INTO pedido_itens (pedido_id, produto_id, servico_id, quantidade, preco_unitario, observacoes)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [pedido_id, produto_id || null, servico_id || null, quantidade, preco_unitario, observacoes || null]);

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Erro ao criar item:', error);
    return NextResponse.json({ error: 'Erro ao criar item' }, { status: 500 });
  }
}
