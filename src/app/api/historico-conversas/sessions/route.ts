import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthUser, getEmpresaIdParaQuery } from '@/lib/auth/middleware';

interface SessionSummary {
  session_id: string;
  total_messages: number;
  first_message_at: string;
  last_message_at: string;
  preview: string;
}

// API para buscar sessões agrupadas por session_id
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
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = page * limit;

    let whereClause = 'WHERE 1=1';
    const params: (number)[] = [];
    let paramIndex = 1;

    // Filtrar por empresa (obrigatório)
    if (empresaIdFiltro !== null) {
      whereClause += ` AND empresa_id = $${paramIndex}`;
      params.push(empresaIdFiltro);
      paramIndex++;
    }

    // Conta total de sessões distintas
    const countResult = await query<{ count: string }>(`
      SELECT COUNT(DISTINCT session_id) as count FROM historico_conversas ${whereClause}
    `, params);
    const total = parseInt(countResult[0].count);

    // Busca sessões agrupadas com informações resumidas
    const data = await query<SessionSummary>(`
      SELECT 
        h.session_id,
        COUNT(*) as total_messages,
        MIN(h.id) as first_message_id,
        MAX(h.id) as last_message_id,
        (SELECT message->>'content' FROM historico_conversas WHERE session_id = h.session_id ${empresaIdFiltro !== null ? `AND empresa_id = ${empresaIdFiltro}` : ''} ORDER BY id DESC LIMIT 1) as preview
      FROM historico_conversas h
      ${whereClause}
      GROUP BY h.session_id
      ORDER BY MAX(h.id) DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, [...params, limit, offset]);

    // Formata os dados para retorno
    const sessions = data.map(row => ({
      session_id: row.session_id,
      total_messages: Number(row.total_messages),
      preview: row.preview || 'Sem preview disponível',
    }));

    return NextResponse.json({ data: sessions, total, page, limit });
  } catch (error) {
    console.error('Erro ao buscar sessões:', error);
    return NextResponse.json({ error: 'Erro ao buscar sessões' }, { status: 500 });
  }
}
