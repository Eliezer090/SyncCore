import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute } from '@/lib/db';
import type { FechamentoEmpresa } from '@/types/database';
import { getAuthUser } from '@/lib/auth/middleware';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Verificar autenticação
    const { user, error } = getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: error || 'Não autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const fechamento = await queryOne<FechamentoEmpresa>(`SELECT * FROM fechamentos_empresa WHERE id = $1`, [id]);
    if (!fechamento) return NextResponse.json({ error: 'Fechamento não encontrado' }, { status: 404 });
    return NextResponse.json(fechamento);
  } catch (error) {
    console.error('Erro ao buscar fechamento:', error);
    return NextResponse.json({ error: 'Erro ao buscar fechamento' }, { status: 500 });
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
    const { empresa_id, data_inicio, data_fim, tipo, abre, fecha, motivo } = body;

    if (tipo === 'horario_especial' && (!abre || !fecha)) {
      return NextResponse.json({ error: 'Para horário especial, abre e fecha são obrigatórios' }, { status: 400 });
    }

    const result = await queryOne<FechamentoEmpresa>(`
      UPDATE fechamentos_empresa 
      SET empresa_id = $1, data_inicio = $2, data_fim = $3, tipo = $4, abre = $5, fecha = $6, motivo = $7
      WHERE id = $8 RETURNING *
    `, [
      empresa_id,
      data_inicio,
      data_fim,
      tipo || 'fechado',
      tipo === 'horario_especial' ? abre : null,
      tipo === 'horario_especial' ? fecha : null,
      motivo || null,
      id,
    ]);

    if (!result) return NextResponse.json({ error: 'Fechamento não encontrado' }, { status: 404 });
    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro ao atualizar fechamento:', error);
    return NextResponse.json({ error: 'Erro ao atualizar fechamento' }, { status: 500 });
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
    const rowCount = await execute('DELETE FROM fechamentos_empresa WHERE id = $1', [id]);
    if (rowCount === 0) return NextResponse.json({ error: 'Fechamento não encontrado' }, { status: 404 });
    return NextResponse.json({ message: 'Fechamento excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir fechamento:', error);
    return NextResponse.json({ error: 'Erro ao excluir fechamento' }, { status: 500 });
  }
}
