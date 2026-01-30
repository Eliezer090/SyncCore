import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute } from '@/lib/db';
import type { ProdutoVariacao } from '@/types/database';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const variacao = await queryOne<ProdutoVariacao>(`SELECT * FROM produto_variacoes WHERE id = $1`, [id]);
    if (!variacao) return NextResponse.json({ error: 'Variação não encontrada' }, { status: 404 });
    return NextResponse.json(variacao);
  } catch (error) {
    console.error('Erro ao buscar variação:', error);
    return NextResponse.json({ error: 'Erro ao buscar variação' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { produto_id, nome, preco_adicional, ativo } = body;

    const result = await queryOne<ProdutoVariacao>(`
      UPDATE produto_variacoes SET produto_id = $1, nome = $2, preco_adicional = $3, ativo = $4
      WHERE id = $5 RETURNING *
    `, [produto_id, nome, preco_adicional || 0, ativo ?? true, id]);

    if (!result) return NextResponse.json({ error: 'Variação não encontrada' }, { status: 404 });
    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro ao atualizar variação:', error);
    return NextResponse.json({ error: 'Erro ao atualizar variação' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const rowCount = await execute('DELETE FROM produto_variacoes WHERE id = $1', [id]);
    if (rowCount === 0) return NextResponse.json({ error: 'Variação não encontrada' }, { status: 404 });
    return NextResponse.json({ message: 'Variação excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir variação:', error);
    return NextResponse.json({ error: 'Erro ao excluir variação' }, { status: 500 });
  }
}
