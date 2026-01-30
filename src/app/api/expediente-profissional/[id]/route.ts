import { NextRequest, NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';
import type { ExpedienteProfissional } from '@/types/database';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const result = await query<ExpedienteProfissional & { profissional_nome?: string }>(`
      SELECT ep.*, u.nome as profissional_nome
      FROM expediente_profissional ep
      LEFT JOIN usuarios u ON ep.usuario_id = u.id
      WHERE ep.id = $1
    `, [id]);

    if (result.length === 0) {
      return NextResponse.json({ error: 'Expediente não encontrado' }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Erro ao buscar expediente:', error);
    return NextResponse.json({ error: 'Erro ao buscar expediente' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      usuario_id,
      seg_sex_manha_inicio,
      seg_sex_manha_fim,
      seg_sex_tarde_inicio,
      seg_sex_tarde_fim,
      trabalha_sabado,
      sabado_inicio,
      sabado_fim,
      trabalha_domingo,
      domingo_inicio,
      domingo_fim,
    } = body;

    const result = await query<ExpedienteProfissional>(`
      UPDATE expediente_profissional SET
        usuario_id = $1,
        seg_sex_manha_inicio = $2,
        seg_sex_manha_fim = $3,
        seg_sex_tarde_inicio = $4,
        seg_sex_tarde_fim = $5,
        trabalha_sabado = $6,
        sabado_inicio = $7,
        sabado_fim = $8,
        trabalha_domingo = $9,
        domingo_inicio = $10,
        domingo_fim = $11
      WHERE id = $12
      RETURNING *
    `, [
      usuario_id,
      seg_sex_manha_inicio || null,
      seg_sex_manha_fim || null,
      seg_sex_tarde_inicio || null,
      seg_sex_tarde_fim || null,
      trabalha_sabado || false,
      sabado_inicio || null,
      sabado_fim || null,
      trabalha_domingo || false,
      domingo_inicio || null,
      domingo_fim || null,
      id,
    ]);

    if (result.length === 0) {
      return NextResponse.json({ error: 'Expediente não encontrado' }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Erro ao atualizar expediente:', error);
    return NextResponse.json({ error: 'Erro ao atualizar expediente' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await execute('DELETE FROM expediente_profissional WHERE id = $1', [id]);
    return NextResponse.json({ message: 'Expediente excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir expediente:', error);
    return NextResponse.json({ error: 'Erro ao excluir expediente' }, { status: 500 });
  }
}
