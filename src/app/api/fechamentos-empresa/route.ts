import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { FechamentoEmpresa } from '@/types/database';
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
    const empresaId = searchParams.get('empresa_id');

    let whereClause = ' WHERE 1=1';
    const params: (string | number)[] = [];
    let paramIndex = 1;

    // Filtrar por empresa
    if (empresaIdFiltro !== null) {
      whereClause += ` AND f.empresa_id = $${paramIndex}`;
      params.push(empresaIdFiltro);
      paramIndex++;
    } else if (empresaId) {
      whereClause += ` AND f.empresa_id = $${paramIndex}`;
      params.push(empresaId);
      paramIndex++;
    }

    const countResult = await query<{ count: string }>(`
      SELECT COUNT(*) as count 
      FROM fechamentos_empresa f
      ${whereClause}
    `, params);
    const total = parseInt(countResult[0].count);

    const data = await query<FechamentoEmpresa & { empresa_nome?: string }>(`
      SELECT f.*, e.nome as empresa_nome
      FROM fechamentos_empresa f
      JOIN empresas e ON f.empresa_id = e.id
      ${whereClause}
      ORDER BY f.data_inicio DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, [...params, limit, offset]);

    return NextResponse.json({ data, total, page, limit });
  } catch (error) {
    console.error('Erro ao buscar fechamentos:', error);
    return NextResponse.json({ error: 'Erro ao buscar fechamentos' }, { status: 500 });
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
    const { empresa_id, data_inicio, data_fim, tipo, abre, fecha, motivo } = body;

    if (!empresa_id || !data_inicio || !data_fim) {
      return NextResponse.json({ error: 'empresa_id, data_inicio e data_fim são obrigatórios' }, { status: 400 });
    }

    if (tipo === 'horario_especial' && (!abre || !fecha)) {
      return NextResponse.json({ error: 'Para horário especial, abre e fecha são obrigatórios' }, { status: 400 });
    }

    const result = await query<FechamentoEmpresa>(`
      INSERT INTO fechamentos_empresa (empresa_id, data_inicio, data_fim, tipo, abre, fecha, motivo)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [
      empresa_id,
      data_inicio,
      data_fim,
      tipo || 'fechado',
      tipo === 'horario_especial' ? abre : null,
      tipo === 'horario_especial' ? fecha : null,
      motivo || null,
    ]);

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Erro ao criar fechamento:', error);
    return NextResponse.json({ error: 'Erro ao criar fechamento' }, { status: 500 });
  }
}
