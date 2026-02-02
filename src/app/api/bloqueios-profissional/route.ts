import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { BloqueioProfissional } from '@/types/database';
import { getAuthUser, getEmpresaIdParaQuery } from '@/lib/auth/middleware';

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const { user, error } = getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: error || 'Não autorizado' }, { status: 401 });
    }

    // Obter empresa_id do token
    const empresaIdFiltro = getEmpresaIdParaQuery(user);

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '0');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = page * limit;
    const usuarioId = searchParams.get('usuario_id');

    let whereClause = ' WHERE 1=1';
    const params: (string | number)[] = [];
    let paramIndex = 1;

    // Filtrar por empresa (através do usuário)
    if (empresaIdFiltro !== null) {
      whereClause += ` AND u.empresa_id = $${paramIndex}`;
      params.push(empresaIdFiltro);
      paramIndex++;
    }

    if (usuarioId) {
      whereClause += ` AND bp.usuario_id = $${paramIndex}`;
      params.push(usuarioId);
      paramIndex++;
    }

    const countResult = await query<{ count: string }>(`
      SELECT COUNT(*) as count 
      FROM bloqueios_profissional bp 
      JOIN usuarios u ON bp.usuario_id = u.id
      ${whereClause}
    `, params);
    const total = parseInt(countResult[0].count);

    const data = await query<BloqueioProfissional & { profissional_nome?: string }>(`
      SELECT bp.*, u.nome as profissional_nome
      FROM bloqueios_profissional bp
      JOIN usuarios u ON bp.usuario_id = u.id
      ${whereClause}
      ORDER BY bp.inicio DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, [...params, limit, offset]);

    return NextResponse.json({ data, total, page, limit });
  } catch (error) {
    console.error('Erro ao buscar bloqueios:', error);
    return NextResponse.json({ error: 'Erro ao buscar bloqueios' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const { user, error } = getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: error || 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { usuario_id, inicio, fim, motivo, dia_semana_recorrente } = body;

    const result = await query<BloqueioProfissional>(`
      INSERT INTO bloqueios_profissional (usuario_id, inicio, fim, motivo, dia_semana_recorrente)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [usuario_id, inicio, fim, motivo || null, dia_semana_recorrente ?? null]);

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Erro ao criar bloqueio:', error);
    return NextResponse.json({ error: 'Erro ao criar bloqueio' }, { status: 500 });
  }
}
