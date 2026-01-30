import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { ServicoProfissional } from '@/types/database';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '0');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = page * limit;
    const usuarioId = searchParams.get('usuario_id');
    const servicoId = searchParams.get('servico_id');

    let whereClause = '';
    const params: (string | number)[] = [];
    let paramIndex = 1;

    if (usuarioId) {
      whereClause = ` WHERE sp.usuario_id = $${paramIndex}`;
      params.push(usuarioId);
      paramIndex++;
    }
    if (servicoId) {
      whereClause += whereClause ? ` AND sp.servico_id = $${paramIndex}` : ` WHERE sp.servico_id = $${paramIndex}`;
      params.push(servicoId);
      paramIndex++;
    }

    const countResult = await query<{ count: string }>(`SELECT COUNT(*) as count FROM servicos_profissional sp ${whereClause}`, params);
    const total = parseInt(countResult[0].count);

    const data = await query<ServicoProfissional & { profissional_nome?: string; servico_nome?: string }>(`
      SELECT sp.*, u.nome as profissional_nome, s.nome as servico_nome
      FROM servicos_profissional sp
      LEFT JOIN usuarios u ON sp.usuario_id = u.id
      LEFT JOIN servicos s ON sp.servico_id = s.id
      ${whereClause}
      ORDER BY sp.id DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, [...params, limit, offset]);

    return NextResponse.json({ data, total, page, limit });
  } catch (error) {
    console.error('Erro ao buscar serviços do profissional:', error);
    return NextResponse.json({ error: 'Erro ao buscar serviços' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { usuario_id, servico_id, duracao_minutos, preco, ativo, antecedencia_minima_minutos } = body;

    const result = await query<ServicoProfissional>(`
      INSERT INTO servicos_profissional (usuario_id, servico_id, duracao_minutos, preco, ativo, antecedencia_minima_minutos)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [usuario_id, servico_id, duracao_minutos, preco || null, ativo !== false, antecedencia_minima_minutos ?? 30]);

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Erro ao criar vínculo:', error);
    return NextResponse.json({ error: 'Erro ao criar vínculo' }, { status: 500 });
  }
}
