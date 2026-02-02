import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { ExpedienteProfissional } from '@/types/database';
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
    const usuarioId = searchParams.get('usuario_id');
    const page = parseInt(searchParams.get('page') || '0');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = page * limit;

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
      whereClause += ` AND ep.usuario_id = $${paramIndex}`;
      params.push(usuarioId);
      paramIndex++;
    }

    const countResult = await query<{ count: string }>(`
      SELECT COUNT(*) as count 
      FROM expediente_profissional ep 
      JOIN usuarios u ON ep.usuario_id = u.id
      ${whereClause}
    `, params);
    const total = parseInt(countResult[0].count);

    const data = await query<ExpedienteProfissional & { profissional_nome?: string }>(`
      SELECT ep.*, u.nome as profissional_nome
      FROM expediente_profissional ep
      JOIN usuarios u ON ep.usuario_id = u.id
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
    // Verificar autenticação
    const { user, error } = getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: error || 'Não autorizado' }, { status: 401 });
    }

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
      INSERT INTO expediente_profissional (
        usuario_id, seg_sex_manha_inicio, seg_sex_manha_fim, 
        seg_sex_tarde_inicio, seg_sex_tarde_fim,
        trabalha_sabado, sabado_manha_inicio, sabado_manha_fim, sabado_tarde_inicio, sabado_tarde_fim,
        trabalha_domingo, domingo_manha_inicio, domingo_manha_fim, domingo_tarde_inicio, domingo_tarde_fim
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
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
    ]);

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Erro ao criar expediente:', error);
    return NextResponse.json({ error: 'Erro ao criar expediente' }, { status: 500 });
  }
}
