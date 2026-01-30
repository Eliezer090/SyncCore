import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { ExpedienteProfissional } from '@/types/database';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const usuarioId = searchParams.get('usuario_id');
    const page = parseInt(searchParams.get('page') || '0');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = page * limit;

    let whereClause = '';
    const params: (string | number)[] = [];
    let paramIndex = 1;

    if (usuarioId) {
      whereClause = ` WHERE ep.usuario_id = $${paramIndex}`;
      params.push(usuarioId);
      paramIndex++;
    }

    const countResult = await query<{ count: string }>(`SELECT COUNT(*) as count FROM expediente_profissional ep ${whereClause}`, params);
    const total = parseInt(countResult[0].count);

    const data = await query<ExpedienteProfissional & { profissional_nome?: string }>(`
      SELECT ep.*, u.nome as profissional_nome
      FROM expediente_profissional ep
      LEFT JOIN usuarios u ON ep.usuario_id = u.id
      ${whereClause}
      ORDER BY ep.usuario_id
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, [...params, limit, offset]);

    return NextResponse.json({ data, total, page, limit });
  } catch (error) {
    console.error('Erro ao buscar expediente:', error);
    return NextResponse.json({ error: 'Erro ao buscar expediente' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
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
      INSERT INTO expediente_profissional (
        usuario_id, seg_sex_manha_inicio, seg_sex_manha_fim, 
        seg_sex_tarde_inicio, seg_sex_tarde_fim,
        trabalha_sabado, sabado_inicio, sabado_fim,
        trabalha_domingo, domingo_inicio, domingo_fim
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
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
    ]);

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Erro ao criar expediente:', error);
    return NextResponse.json({ error: 'Erro ao criar expediente' }, { status: 500 });
  }
}
