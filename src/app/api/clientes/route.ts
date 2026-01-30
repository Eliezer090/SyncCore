import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { formatDatabaseError } from '@/lib/db-errors';
import type { Cliente } from '@/types/database';
import { getAuthUser, getEmpresaIdParaQuery } from '@/lib/auth/middleware';

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const { user, error } = getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: error || 'Não autorizado' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '0');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const offset = page * limit;

    // Obter empresa_id do token
    const empresaIdFiltro = getEmpresaIdParaQuery(user);

    let sql: string;
    let countSql: string;
    const params: unknown[] = [];
    const countParams: unknown[] = [];
    let paramCount = 0;
    let countParamIndex = 0;

    // Se tem filtro de empresa, buscar via tabela de relacionamento
    if (empresaIdFiltro !== null) {
      sql = `
        SELECT DISTINCT c.* 
        FROM clientes c
        INNER JOIN clientes_empresas ce ON c.id = ce.cliente_id
        WHERE ce.empresa_id = $1
      `;
      params.push(empresaIdFiltro);
      paramCount = 1;

      countSql = `
        SELECT COUNT(DISTINCT c.id) as total 
        FROM clientes c
        INNER JOIN clientes_empresas ce ON c.id = ce.cliente_id
        WHERE ce.empresa_id = $1
      `;
      countParams.push(empresaIdFiltro);
      countParamIndex = 1;

      if (search) {
        paramCount++;
        sql += ` AND (c.nome ILIKE $${paramCount} OR c.telefone ILIKE $${paramCount})`;
        params.push(`%${search}%`);
        
        countParamIndex++;
        countSql += ` AND (c.nome ILIKE $${countParamIndex} OR c.telefone ILIKE $${countParamIndex})`;
        countParams.push(`%${search}%`);
      }
    } else {
      // Admin global sem empresa selecionada - ver todos
      sql = 'SELECT * FROM clientes WHERE 1=1';
      countSql = 'SELECT COUNT(*) as total FROM clientes WHERE 1=1';

      if (search) {
        paramCount++;
        sql += ` AND (nome ILIKE $${paramCount} OR telefone ILIKE $${paramCount})`;
        params.push(`%${search}%`);
        
        countParamIndex++;
        countSql += ` AND (nome ILIKE $${countParamIndex} OR telefone ILIKE $${countParamIndex})`;
        countParams.push(`%${search}%`);
      }
    }

    // ORDER BY depende se está usando alias 'c' ou não
    const orderByField = empresaIdFiltro !== null ? 'c.criado_em' : 'criado_em';
    sql += ` ORDER BY ${orderByField} DESC`;
    sql += ` LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const clientes = await query<Cliente>(sql, params);
    const countResult = await queryOne<{ total: string }>(countSql, countParams);
    const total = parseInt(countResult?.total || '0');

    return NextResponse.json({ data: clientes, total, page, limit });
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    return NextResponse.json({ error: formatDatabaseError(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const { user, error } = getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: error || 'Não autorizado' }, { status: 401 });
    }

    const empresaIdFiltro = getEmpresaIdParaQuery(user);

    const body = await request.json();
    const { nome, telefone, url_foto } = body;

    // Criar cliente
    const sql = `
      INSERT INTO clientes (nome, telefone, url_foto)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const params = [nome, telefone, url_foto];
    const result = await queryOne<Cliente>(sql, params);

    // Se tem empresa, criar vínculo
    if (result && empresaIdFiltro) {
      await query(
        'INSERT INTO clientes_empresas (cliente_id, empresa_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [result.id, empresaIdFiltro]
      );
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    return NextResponse.json({ error: formatDatabaseError(error) }, { status: 500 });
  }
}
