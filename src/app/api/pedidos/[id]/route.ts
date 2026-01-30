import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute } from '@/lib/db';
import { formatDatabaseError } from '@/lib/db-errors';
import type { Pedido } from '@/types/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const pedido = await queryOne<Pedido>(`
      SELECT p.*, e.nome as empresa_nome, c.nome as cliente_nome, c.telefone as cliente_telefone
      FROM pedidos p
      LEFT JOIN empresas e ON p.empresa_id = e.id
      LEFT JOIN clientes c ON p.cliente_id = c.id
      WHERE p.id = $1
    `, [id]);

    if (!pedido) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 });
    }

    return NextResponse.json(pedido);
  } catch (error) {
    console.error('Erro ao buscar pedido:', error);
    return NextResponse.json({ error: formatDatabaseError(error) }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { empresa_id, cliente_id, tipo, status, total, observacao, endereco_id, taxa_entrega } = body;

    const sql = `
      UPDATE pedidos SET
        empresa_id = $1, cliente_id = $2, tipo = $3, status = $4, total = $5, 
        observacao = $6, endereco_id = $7, taxa_entrega = $8
      WHERE id = $9
      RETURNING *
    `;
    const sqlParams = [empresa_id, cliente_id, tipo, status, total, observacao, endereco_id, taxa_entrega, id];

    const result = await queryOne<Pedido>(sql, sqlParams);

    if (!result) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro ao atualizar pedido:', error);
    return NextResponse.json({ error: formatDatabaseError(error) }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const rowCount = await execute('DELETE FROM pedidos WHERE id = $1', [id]);

    if (rowCount === 0) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Pedido excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir pedido:', error);
    return NextResponse.json({ error: formatDatabaseError(error) }, { status: 500 });
  }
}
