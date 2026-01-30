import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute } from '@/lib/db';
import type { HorarioEmpresa } from '@/types/database';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const horario = await queryOne<HorarioEmpresa & { empresa_nome?: string }>(`
      SELECT h.*, e.nome as empresa_nome
      FROM horarios_empresa h
      LEFT JOIN empresas e ON h.empresa_id = e.id
      WHERE h.id = $1
    `, [id]);

    if (!horario) {
      return NextResponse.json({ error: 'Horário não encontrado' }, { status: 404 });
    }
    return NextResponse.json(horario);
  } catch (error) {
    console.error('Erro ao buscar horário:', error);
    return NextResponse.json({ error: 'Erro ao buscar horário' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { empresa_id, dia_semana, abre, fecha } = body;

    const result = await queryOne<HorarioEmpresa>(`
      UPDATE horarios_empresa SET empresa_id = $1, dia_semana = $2, abre = $3, fecha = $4
      WHERE id = $5 RETURNING *
    `, [empresa_id, dia_semana, abre, fecha, id]);

    if (!result) {
      return NextResponse.json({ error: 'Horário não encontrado' }, { status: 404 });
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro ao atualizar horário:', error);
    return NextResponse.json({ error: 'Erro ao atualizar horário' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const rowCount = await execute('DELETE FROM horarios_empresa WHERE id = $1', [id]);

    if (rowCount === 0) {
      return NextResponse.json({ error: 'Horário não encontrado' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Horário excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir horário:', error);
    return NextResponse.json({ error: 'Erro ao excluir horário' }, { status: 500 });
  }
}
