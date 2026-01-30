import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute } from '@/lib/db';
import type { EstoqueMovimentacao } from '@/types/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const movimentacao = await queryOne<EstoqueMovimentacao>(`
      SELECT em.*, p.nome as produto_nome
      FROM estoque_movimentacoes em
      LEFT JOIN produtos p ON em.produto_id = p.id
      WHERE em.id = $1
    `, [id]);

    if (!movimentacao) {
      return NextResponse.json({ error: 'Movimentação não encontrada' }, { status: 404 });
    }

    return NextResponse.json(movimentacao);
  } catch (error) {
    console.error('Erro ao buscar movimentação:', error);
    return NextResponse.json({ error: 'Erro ao buscar movimentação' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const rowCount = await execute('DELETE FROM estoque_movimentacoes WHERE id = $1', [id]);

    if (rowCount === 0) {
      return NextResponse.json({ error: 'Movimentação não encontrada' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Movimentação excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir movimentação:', error);
    return NextResponse.json({ error: 'Erro ao excluir movimentação' }, { status: 500 });
  }
}
