import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute } from '@/lib/db';
import type { PedidoItem } from '@/types/database';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const item = await queryOne<PedidoItem>(`SELECT * FROM pedido_itens WHERE id = $1`, [id]);
    if (!item) return NextResponse.json({ error: 'Item não encontrado' }, { status: 404 });
    return NextResponse.json(item);
  } catch (error) {
    console.error('Erro ao buscar item:', error);
    return NextResponse.json({ error: 'Erro ao buscar item' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { pedido_id, produto_id, servico_id, quantidade, preco_unitario, observacoes } = body;

    const result = await queryOne<PedidoItem>(`
      UPDATE pedido_itens SET pedido_id = $1, produto_id = $2, servico_id = $3, quantidade = $4, preco_unitario = $5, observacoes = $6
      WHERE id = $7 RETURNING *
    `, [pedido_id, produto_id || null, servico_id || null, quantidade, preco_unitario, observacoes || null, id]);

    if (!result) return NextResponse.json({ error: 'Item não encontrado' }, { status: 404 });
    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro ao atualizar item:', error);
    return NextResponse.json({ error: 'Erro ao atualizar item' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const rowCount = await execute('DELETE FROM pedido_itens WHERE id = $1', [id]);
    if (rowCount === 0) return NextResponse.json({ error: 'Item não encontrado' }, { status: 404 });
    return NextResponse.json({ message: 'Item excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir item:', error);
    return NextResponse.json({ error: 'Erro ao excluir item' }, { status: 500 });
  }
}
