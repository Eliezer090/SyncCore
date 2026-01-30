import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { formatDatabaseError } from '@/lib/db-errors';
import type { Agendamento } from '@/types/database';
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
    const usuarioId = searchParams.get('usuario_id');
    const status = searchParams.get('status');
    const offset = page * limit;

    let sql = `
      SELECT a.*, e.nome as empresa_nome, c.nome as cliente_nome, c.telefone as cliente_telefone, u.nome as profissional_nome
      FROM agendamentos a
      LEFT JOIN empresas e ON a.empresa_id = e.id
      LEFT JOIN clientes c ON a.cliente_id = c.id
      LEFT JOIN usuarios u ON a.usuario_id = u.id
      WHERE 1=1
    `;
    const params: unknown[] = [];
    let paramCount = 0;

    // Filtrar por empresa (obrigatório para não-admin_global, ou se admin selecionou uma empresa)
    if (empresaIdFiltro !== null) {
      paramCount++;
      sql += ` AND a.empresa_id = $${paramCount}`;
      params.push(empresaIdFiltro);
    }

    if (usuarioId) {
      paramCount++;
      sql += ` AND a.usuario_id = $${paramCount}`;
      params.push(usuarioId);
    }

    if (status) {
      paramCount++;
      sql += ` AND a.status = $${paramCount}`;
      params.push(status);
    }

    sql += ' ORDER BY a.inicio DESC';
    sql += ` LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const agendamentos = await query<Agendamento & { empresa_nome: string; cliente_nome: string; cliente_telefone: string; profissional_nome: string }>(sql, params);

    let countSql = 'SELECT COUNT(*) as total FROM agendamentos WHERE 1=1';
    const countParams: unknown[] = [];
    let countParamIndex = 0;

    // Filtrar por empresa (obrigatório para não-admin_global, ou se admin selecionou uma empresa)
    if (empresaIdFiltro !== null) {
      countParamIndex++;
      countSql += ` AND empresa_id = $${countParamIndex}`;
      countParams.push(empresaIdFiltro);
    }

    if (usuarioId) {
      countParamIndex++;
      countSql += ` AND usuario_id = $${countParamIndex}`;
      countParams.push(usuarioId);
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
    console.error('Erro ao buscar agendamentos:', error);
    return NextResponse.json({ error: formatDatabaseError(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { empresa_id, cliente_id, usuario_id, inicio, fim, status, observacao, duracao_total_minutos, cancelado_por } = body;

    const sql = `
      INSERT INTO agendamentos (empresa_id, cliente_id, usuario_id, inicio, fim, status, observacao, duracao_total_minutos, cancelado_por)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const params = [empresa_id, cliente_id, usuario_id, inicio, fim, status || 'agendado', observacao, duracao_total_minutos || null, cancelado_por || null];

    const result = await queryOne<Agendamento>(sql, params);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    return NextResponse.json({ error: formatDatabaseError(error) }, { status: 500 });
  }
}
