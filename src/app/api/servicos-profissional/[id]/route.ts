import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute } from '@/lib/db';
import type { ServicoProfissional } from '@/types/database';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const vinculo = await queryOne<ServicoProfissional>(`SELECT * FROM servicos_profissional WHERE id = $1`, [id]);
    if (!vinculo) return NextResponse.json({ error: 'Vínculo não encontrado' }, { status: 404 });
    return NextResponse.json(vinculo);
  } catch (error) {
    console.error('Erro ao buscar vínculo:', error);
    return NextResponse.json({ error: 'Erro ao buscar vínculo' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { usuario_id, servico_id, duracao_minutos, preco, ativo, antecedencia_minima_minutos } = body;

    const result = await queryOne<ServicoProfissional>(`
      UPDATE servicos_profissional SET usuario_id = $1, servico_id = $2, duracao_minutos = $3, preco = $4, ativo = $5, antecedencia_minima_minutos = $6
      WHERE id = $7 RETURNING *
    `, [usuario_id, servico_id, duracao_minutos, preco || null, ativo !== false, antecedencia_minima_minutos, id]);

    if (!result) return NextResponse.json({ error: 'Vínculo não encontrado' }, { status: 404 });
    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro ao atualizar vínculo:', error);
    return NextResponse.json({ error: 'Erro ao atualizar vínculo' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const rowCount = await execute('DELETE FROM servicos_profissional WHERE id = $1', [id]);
    if (rowCount === 0) return NextResponse.json({ error: 'Vínculo não encontrado' }, { status: 404 });
    return NextResponse.json({ message: 'Vínculo excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir vínculo:', error);
    return NextResponse.json({ error: 'Erro ao excluir vínculo' }, { status: 500 });
  }
}
