import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute } from '@/lib/db';
import type { BloqueioProfissional } from '@/types/database';
import { getAuthUser } from '@/lib/auth/middleware';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Verificar autenticação
    const { user, error } = getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: error || 'Não autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const bloqueio = await queryOne<BloqueioProfissional>(`SELECT * FROM bloqueios_profissional WHERE id = $1`, [id]);
    if (!bloqueio) return NextResponse.json({ error: 'Bloqueio não encontrado' }, { status: 404 });
    return NextResponse.json(bloqueio);
  } catch (error) {
    console.error('Erro ao buscar bloqueio:', error);
    return NextResponse.json({ error: 'Erro ao buscar bloqueio' }, { status: 500 });
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
    const { usuario_id, inicio, fim, motivo, dia_semana_recorrente } = body;

    const result = await queryOne<BloqueioProfissional>(`
      UPDATE bloqueios_profissional SET usuario_id = $1, inicio = $2, fim = $3, motivo = $4, dia_semana_recorrente = $5
      WHERE id = $6 RETURNING *
    `, [usuario_id, inicio, fim, motivo || null, dia_semana_recorrente ?? null, id]);

    if (!result) return NextResponse.json({ error: 'Bloqueio não encontrado' }, { status: 404 });
    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro ao atualizar bloqueio:', error);
    return NextResponse.json({ error: 'Erro ao atualizar bloqueio' }, { status: 500 });
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
    const rowCount = await execute('DELETE FROM bloqueios_profissional WHERE id = $1', [id]);
    if (rowCount === 0) return NextResponse.json({ error: 'Bloqueio não encontrado' }, { status: 404 });
    return NextResponse.json({ message: 'Bloqueio excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir bloqueio:', error);
    return NextResponse.json({ error: 'Erro ao excluir bloqueio' }, { status: 500 });
  }
}
