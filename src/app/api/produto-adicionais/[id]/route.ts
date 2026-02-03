import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute } from '@/lib/db';
import type { ProdutoAdicional } from '@/types/database';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const adicional = await queryOne<ProdutoAdicional>(`SELECT * FROM produto_adicionais WHERE id = $1`, [id]);
    if (!adicional) return NextResponse.json({ error: 'Adicional não encontrado' }, { status: 404 });
    return NextResponse.json(adicional);
  } catch (error) {
    console.error('Erro ao buscar adicional:', error);
    return NextResponse.json({ error: 'Erro ao buscar adicional' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { produto_id, nome, preco } = body;

    const result = await queryOne<ProdutoAdicional>(`
      UPDATE produto_adicionais SET produto_id = $1, nome = $2, preco = $3
      WHERE id = $4 RETURNING *
    `, [produto_id, nome, preco || 0, id]);

    if (!result) return NextResponse.json({ error: 'Adicional não encontrado' }, { status: 404 });
    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro ao atualizar adicional:', error);
    return NextResponse.json({ error: 'Erro ao atualizar adicional' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const rowCount = await execute('DELETE FROM produto_adicionais WHERE id = $1', [id]);
    if (rowCount === 0) return NextResponse.json({ error: 'Adicional não encontrado' }, { status: 404 });
    return NextResponse.json({ message: 'Adicional excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir adicional:', error);
    return NextResponse.json({ error: 'Erro ao excluir adicional' }, { status: 500 });
  }
}
