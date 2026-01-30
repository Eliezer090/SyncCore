import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute } from '@/lib/db';
import { formatDatabaseError } from '@/lib/db-errors';
import type { Agendamento } from '@/types/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const agendamento = await queryOne<Agendamento>(`
      SELECT a.*, e.nome as empresa_nome, c.nome as cliente_nome, c.telefone as cliente_telefone, u.nome as profissional_nome
      FROM agendamentos a
      LEFT JOIN empresas e ON a.empresa_id = e.id
      LEFT JOIN clientes c ON a.cliente_id = c.id
      LEFT JOIN usuarios u ON a.usuario_id = u.id
      WHERE a.id = $1
    `, [id]);

    if (!agendamento) {
      return NextResponse.json({ error: 'Agendamento não encontrado' }, { status: 404 });
    }

    return NextResponse.json(agendamento);
  } catch (error) {
    console.error('Erro ao buscar agendamento:', error);
    return NextResponse.json({ error: formatDatabaseError(error) }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { empresa_id, cliente_id, usuario_id, inicio, fim, status, observacao, duracao_total_minutos, cancelado_por } = body;

    const sql = `
      UPDATE agendamentos SET
        empresa_id = $1, cliente_id = $2, usuario_id = $3, inicio = $4, fim = $5, status = $6, observacao = $7, duracao_total_minutos = $8, cancelado_por = $9
      WHERE id = $10
      RETURNING *
    `;
    const sqlParams = [empresa_id, cliente_id, usuario_id, inicio, fim, status, observacao, duracao_total_minutos || null, cancelado_por || null, id];

    const result = await queryOne<Agendamento>(sql, sqlParams);

    if (!result) {
      return NextResponse.json({ error: 'Agendamento não encontrado' }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro ao atualizar agendamento:', error);
    return NextResponse.json({ error: formatDatabaseError(error) }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const rowCount = await execute('DELETE FROM agendamentos WHERE id = $1', [id]);

    if (rowCount === 0) {
      return NextResponse.json({ error: 'Agendamento não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Agendamento excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir agendamento:', error);
    return NextResponse.json({ error: formatDatabaseError(error) }, { status: 500 });
  }
}
