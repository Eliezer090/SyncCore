import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import type { Agendamento } from '@/types/database';
import { getAuthUser } from '@/lib/auth/middleware';
import { formatDatabaseError } from '@/lib/db-errors';

export async function GET(request: NextRequest) {
  try {
    const { user, error } = getAuthUser(request);
    
    if (!user || error) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '0');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const offset = page * limit;

    let sql = `
      SELECT a.*, c.nome as cliente_nome, u.nome as profissional_nome, STRING_AGG(s.nome, ', ') as servico_nome, e.nome as empresa_nome
      FROM agendamentos a
      LEFT JOIN clientes c ON a.cliente_id = c.id
      LEFT JOIN usuarios u ON a.usuario_id = u.id
      LEFT JOIN agendamento_servicos ags ON a.id = ags.agendamento_id
      LEFT JOIN servicos s ON ags.servico_id = s.id
      LEFT JOIN empresas e ON a.empresa_id = e.id
      WHERE 1=1
    `;
    const params: unknown[] = [];
    let paramCount = 0;

    // Se for profissional, filtrar pelo próprio usuario_id
    if (user.papel === 'profissional') {
      paramCount++;
      sql += ` AND a.usuario_id = $${paramCount}`;
      params.push(user.userId);
    } else {
      // Para outros papéis, filtrar por empresa
      paramCount++;
      sql += ` AND a.empresa_id = $${paramCount}`;
      params.push(user.empresaAtivaId || user.empresaId);
    }

    // Filtrar por status se fornecido
    if (status) {
      paramCount++;
      sql += ` AND a.status = $${paramCount}`;
      params.push(status);
    }

    sql += ' GROUP BY a.id, c.id, u.id, e.id';
    sql += ' ORDER BY a.inicio DESC';
    sql += ` LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const agendamentos = await query<
      Agendamento & {
        cliente_nome: string;
        profissional_nome: string;
        servico_nome: string;
        empresa_nome: string;
      }
    >(sql, params);

    // Contar total
    let countSql = 'SELECT COUNT(*) as total FROM agendamentos WHERE 1=1';
    const countParams: unknown[] = [];
    let countParamIndex = 0;

    if (user.papel === 'profissional') {
      countParamIndex++;
      countSql += ` AND usuario_id = $${countParamIndex}`;
      countParams.push(user.userId);
    } else {
      countParamIndex++;
      countSql += ` AND empresa_id = $${countParamIndex}`;
      countParams.push(user.empresaAtivaId || user.empresaId);
    }

    if (status) {
      countParamIndex++;
      countSql += ` AND status = $${countParamIndex}`;
      countParams.push(status);
    }

    const countResult = await queryOne<{ total: string }>(countSql, countParams);
    const total = parseInt(countResult?.total || '0');

    return NextResponse.json({ data: agendamentos, total, page, limit });
  } catch (error) {
    console.error('Erro ao buscar agendamentos do profissional:', error);
    return NextResponse.json({ error: formatDatabaseError(error) }, { status: 500 });
  }
}
