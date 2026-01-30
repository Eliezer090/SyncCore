import { NextRequest, NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';
import type { AgendamentoServico } from '@/types/database';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const agendamentoId = searchParams.get('agendamento_id');
    const page = parseInt(searchParams.get('page') || '0');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = page * limit;

    let whereClause = '';
    const params: (string | number)[] = [];
    let paramIndex = 1;

    if (agendamentoId) {
      whereClause = ` WHERE ags.agendamento_id = $${paramIndex}`;
      params.push(agendamentoId);
      paramIndex++;
    }

    // Buscar total
    const countResult = await query<{ count: string }>(`
      SELECT COUNT(*) as count FROM agendamento_servicos ags ${whereClause}
    `, params);
    const total = parseInt(countResult[0]?.count || '0');

    // Buscar dados com JOINs
    const data = await query<AgendamentoServico & { servico_nome?: string; agendamento_cliente?: string }>(`
      SELECT ags.*, s.nome as servico_nome, c.nome as agendamento_cliente
      FROM agendamento_servicos ags
      LEFT JOIN servicos s ON ags.servico_id = s.id
      LEFT JOIN agendamentos a ON ags.agendamento_id = a.id
      LEFT JOIN clientes c ON a.cliente_id = c.id
      ${whereClause}
      ORDER BY ags.id DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, [...params, limit, offset]);

    return NextResponse.json({ data, total });
  } catch (error) {
    console.error('Erro ao buscar serviços do agendamento:', error);
    return NextResponse.json({ error: 'Erro ao buscar serviços' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agendamento_id, servico_id, duracao_minutos, preco } = body;

    const result = await query<AgendamentoServico>(`
      INSERT INTO agendamento_servicos (agendamento_id, servico_id, duracao_minutos, preco)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [agendamento_id, servico_id, duracao_minutos, preco]);

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Erro ao vincular serviço:', error);
    return NextResponse.json({ error: 'Erro ao vincular serviço' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const agendamentoId = searchParams.get('agendamento_id');
    const servicoId = searchParams.get('servico_id');

    if (!agendamentoId || !servicoId) {
      return NextResponse.json({ error: 'Parâmetros obrigatórios' }, { status: 400 });
    }

    await execute('DELETE FROM agendamento_servicos WHERE agendamento_id = $1 AND servico_id = $2', [agendamentoId, servicoId]);
    return NextResponse.json({ message: 'Serviço removido com sucesso' });
  } catch (error) {
    console.error('Erro ao remover serviço:', error);
    return NextResponse.json({ error: 'Erro ao remover serviço' }, { status: 500 });
  }
}
