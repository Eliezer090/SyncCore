import { NextRequest, NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';
import type { ExpedienteProfissional } from '@/types/database';
import { getAuthUser } from '@/lib/auth/middleware';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Verificar autenticação
    const { user, error } = getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: error || 'Não autorizado' }, { status: 401 });
    }

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
    // Verificar autenticação
    const { user, error } = getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: error || 'Não autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const {
      usuario_id,
      seg_sex_manha_inicio,
      seg_sex_manha_fim,
      seg_sex_tarde_inicio,
      seg_sex_tarde_fim,
      trabalha_sabado,
      sabado_manha_inicio,
      sabado_manha_fim,
      sabado_tarde_inicio,
      sabado_tarde_fim,
      trabalha_domingo,
      domingo_manha_inicio,
      domingo_manha_fim,
      domingo_tarde_inicio,
      domingo_tarde_fim,
    } = body;

    const result = await query<ExpedienteProfissional>(`
      UPDATE expediente_profissional SET
        usuario_id = $1,
        seg_sex_manha_inicio = $2,
        seg_sex_manha_fim = $3,
        seg_sex_tarde_inicio = $4,
        seg_sex_tarde_fim = $5,
        trabalha_sabado = $6,
        sabado_manha_inicio = $7,
        sabado_manha_fim = $8,
        sabado_tarde_inicio = $9,
        sabado_tarde_fim = $10,
        trabalha_domingo = $11,
        domingo_manha_inicio = $12,
        domingo_manha_fim = $13,
        domingo_tarde_inicio = $14,
        domingo_tarde_fim = $15
      WHERE id = $16
      RETURNING *
    `, [
      usuario_id,
      seg_sex_manha_inicio || null,
      seg_sex_manha_fim || null,
      seg_sex_tarde_inicio || null,
      seg_sex_tarde_fim || null,
      trabalha_sabado || false,
      sabado_manha_inicio || null,
      sabado_manha_fim || null,
      sabado_tarde_inicio || null,
      sabado_tarde_fim || null,
      trabalha_domingo || false,
      domingo_manha_inicio || null,
      domingo_manha_fim || null,
      domingo_tarde_inicio || null,
      domingo_tarde_fim || null,
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
    // Verificar autenticação
    const { user, error } = getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: error || 'Não autorizado' }, { status: 401 });
    }

    const { id } = await params;
    await execute('DELETE FROM expediente_profissional WHERE id = $1', [id]);
    return NextResponse.json({ message: 'Expediente excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir expediente:', error);
    return NextResponse.json({ error: 'Erro ao excluir expediente' }, { status: 500 });
  }
}
