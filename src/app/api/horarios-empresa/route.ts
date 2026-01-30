import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { HorarioEmpresa } from '@/types/database';
import { getAuthUser, getEmpresaIdParaQuery } from '@/lib/auth/middleware';

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const { user, error } = getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: error || 'Não autorizado' }, { status: 401 });
    }

    // Obter empresa_id do token (não do parâmetro, por segurança)
    const empresaIdFiltro = getEmpresaIdParaQuery(user);

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '0');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = page * limit;

    let whereClause = '';
    const params: (string | number)[] = [];
    let paramIndex = 1;

    // Filtrar por empresa (obrigatório para não-admin_global, ou se admin selecionou uma empresa)
    if (empresaIdFiltro !== null) {
      whereClause = ` WHERE h.empresa_id = $${paramIndex}`;
      params.push(empresaIdFiltro);
      paramIndex++;
    }

    const countResult = await query<{ count: string }>(`SELECT COUNT(*) as count FROM horarios_empresa h ${whereClause}`, params);
    const total = parseInt(countResult[0].count);

    const data = await query<HorarioEmpresa & { empresa_nome?: string }>(`
      SELECT h.*, e.nome as empresa_nome
      FROM horarios_empresa h
      LEFT JOIN empresas e ON h.empresa_id = e.id
      ${whereClause}
      ORDER BY h.empresa_id, h.dia_semana, h.abre
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, [...params, limit, offset]);

    return NextResponse.json({ data, total, page, limit });
  } catch (error) {
    console.error('Erro ao buscar horários:', error);
    return NextResponse.json({ error: 'Erro ao buscar horários' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { empresa_id, dia_semana, abre, fecha } = body;

    const result = await query<HorarioEmpresa>(`
      INSERT INTO horarios_empresa (empresa_id, dia_semana, abre, fecha)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [empresa_id, dia_semana, abre, fecha]);

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Erro ao criar horário:', error);
    return NextResponse.json({ error: 'Erro ao criar horário' }, { status: 500 });
  }
}
