import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute, query } from '@/lib/db';
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { produto_id, variacao_id, adicional_id, tipo, quantidade, motivo } = body;

    // Buscar movimentação atual para reverter o estoque
    const movimentacaoAtual = await queryOne<EstoqueMovimentacao>(`
      SELECT * FROM estoque_movimentacoes WHERE id = $1
    `, [id]);

    if (!movimentacaoAtual) {
      return NextResponse.json({ error: 'Movimentação não encontrada' }, { status: 404 });
    }

    // Reverter estoque da variação anterior
    if (movimentacaoAtual.variacao_id) {
      const ajusteReverso = movimentacaoAtual.tipo === 'entrada' ? -movimentacaoAtual.quantidade : movimentacaoAtual.quantidade;
      await query(`
        UPDATE produto_variacoes 
        SET estoque_atual = COALESCE(estoque_atual, 0) + $1 
        WHERE id = $2
      `, [ajusteReverso, movimentacaoAtual.variacao_id]);
    }

    // Reverter estoque do adicional anterior
    if (movimentacaoAtual.adicional_id) {
      const ajusteReverso = movimentacaoAtual.tipo === 'entrada' ? -movimentacaoAtual.quantidade : movimentacaoAtual.quantidade;
      await query(`
        UPDATE produto_adicionais 
        SET estoque_atual = COALESCE(estoque_atual, 0) + $1 
        WHERE id = $2
      `, [ajusteReverso, movimentacaoAtual.adicional_id]);
    }

    // Atualizar a movimentação
    const result = await queryOne<EstoqueMovimentacao>(`
      UPDATE estoque_movimentacoes 
      SET produto_id = $1, variacao_id = $2, adicional_id = $3, tipo = $4, quantidade = $5, motivo = $6
      WHERE id = $7
      RETURNING *
    `, [produto_id, variacao_id || null, adicional_id || null, tipo, quantidade, motivo || null, id]);

    // Aplicar novo estoque na variação
    if (variacao_id) {
      const ajuste = tipo === 'entrada' ? quantidade : -quantidade;
      await query(`
        UPDATE produto_variacoes 
        SET estoque_atual = COALESCE(estoque_atual, 0) + $1 
        WHERE id = $2
      `, [ajuste, variacao_id]);
    }

    // Aplicar novo estoque no adicional
    if (adicional_id) {
      const ajuste = tipo === 'entrada' ? quantidade : -quantidade;
      await query(`
        UPDATE produto_adicionais 
        SET estoque_atual = COALESCE(estoque_atual, 0) + $1 
        WHERE id = $2
      `, [ajuste, adicional_id]);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro ao atualizar movimentação:', error);
    return NextResponse.json({ error: 'Erro ao atualizar movimentação' }, { status: 500 });
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
