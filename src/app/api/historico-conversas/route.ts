import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { HistoricoConversa } from '@/types/database';
import { getAuthUser, getEmpresaIdParaQuery } from '@/lib/auth/middleware';

// DDL: id, session_id, message (jsonb), empresa_id
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const { user, error } = getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: error || 'Não autorizado' }, { status: 401 });
    }

    // Obter empresa_id para filtro
    const empresaIdFiltro = getEmpresaIdParaQuery(user);

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '0');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = page * limit;
    const sessionId = searchParams.get('session_id');

    let whereClause = 'WHERE 1=1';
    const params: (string | number)[] = [];
    let paramIndex = 1;

    // Filtrar por empresa (obrigatório)
    if (empresaIdFiltro !== null) {
      whereClause += ` AND h.empresa_id = $${paramIndex}`;
      params.push(empresaIdFiltro);
      paramIndex++;
    }

    if (sessionId) {
      whereClause += ` AND h.session_id = $${paramIndex}`;
      params.push(sessionId);
      paramIndex++;
    }

    const countResult = await query<{ count: string }>(`SELECT COUNT(*) as count FROM historico_conversas h ${whereClause}`, params);
    const total = parseInt(countResult[0].count);

    const data = await query<HistoricoConversa>(`
      SELECT h.*
      FROM historico_conversas h
      ${whereClause}
      ORDER BY h.id DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, [...params, limit, offset]);

    return NextResponse.json({ data, total, page, limit });
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    return NextResponse.json({ error: 'Erro ao buscar histórico' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const { user, error } = getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: error || 'Não autorizado' }, { status: 401 });
    }

    // Obter empresa_id do usuário
    const empresaId = user.empresaId;
    if (!empresaId) {
      return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 400 });
    }

    const body = await request.json();
    const { session_id, message } = body;

    const result = await query<HistoricoConversa>(`
      INSERT INTO historico_conversas (session_id, message, empresa_id)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [session_id, JSON.stringify(message), empresaId]);

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Erro ao criar histórico:', error);
    return NextResponse.json({ error: 'Erro ao criar histórico' }, { status: 500 });
  }
}
