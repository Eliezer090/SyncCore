import { NextRequest, NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';
import type { Notificacao } from '@/types/database';

// GET - Buscar uma notificação específica
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const result = await query<Notificacao>(`
      SELECT 
        n.*,
        c.nome as cliente_nome,
        c.telefone as cliente_telefone,
        e.nome as empresa_nome
      FROM notificacoes n
      LEFT JOIN clientes c ON n.cliente_id = c.id
      LEFT JOIN empresas e ON n.empresa_id = e.id
      WHERE n.id = $1
    `, [id]);

    if (result.length === 0) {
      return NextResponse.json({ error: 'Notificação não encontrada' }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Erro ao buscar notificação:', error);
    return NextResponse.json({ error: 'Erro ao buscar notificação' }, { status: 500 });
  }
}

// PUT - Marcar como lida/não lida
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { lida } = body;

    if (typeof lida !== 'boolean') {
      return NextResponse.json({ error: 'Campo lida é obrigatório (boolean)' }, { status: 400 });
    }

    const result = await query<Notificacao>(`
      UPDATE notificacoes 
      SET lida = $1
      WHERE id = $2
      RETURNING *
    `, [lida, id]);

    if (result.length === 0) {
      return NextResponse.json({ error: 'Notificação não encontrada' }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Erro ao atualizar notificação:', error);
    return NextResponse.json({ error: 'Erro ao atualizar notificação' }, { status: 500 });
  }
}

// DELETE - Excluir notificação
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const rowsAffected = await execute('DELETE FROM notificacoes WHERE id = $1', [id]);

    if (rowsAffected === 0) {
      return NextResponse.json({ error: 'Notificação não encontrada' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Notificação excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir notificação:', error);
    return NextResponse.json({ error: 'Erro ao excluir notificação' }, { status: 500 });
  }
}
