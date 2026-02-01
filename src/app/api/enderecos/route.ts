import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { Endereco } from '@/types/database';
import { getAuthUser, getEmpresaIdParaQuery } from '@/lib/auth/middleware';

// DDL: id, cliente_id, empresa_id, logradouro, numero, bairro, cidade, cep, referencia, tipo, criado_em
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
    const clienteId = searchParams.get('cliente_id');
    const empresaIdParam = searchParams.get('empresa_id');

    let whereClause = '';
    const params: (string | number)[] = [];
    let paramIndex = 1;

    if (clienteId) {
      whereClause += ` WHERE e.cliente_id = $${paramIndex}`;
      params.push(clienteId);
      paramIndex++;
    }
    
    // Filtrar por empresa_id específico (ex: buscar endereço de uma empresa)
    if (empresaIdParam) {
      whereClause += whereClause ? ` AND e.empresa_id = $${paramIndex}` : ` WHERE e.empresa_id = $${paramIndex}`;
      params.push(empresaIdParam);
      paramIndex++;
    }
    // Ou filtrar por empresa do usuário (obrigatório para não-admin_global)
    else if (empresaIdFiltro !== null) {
      whereClause += whereClause ? ` AND e.empresa_id = $${paramIndex}` : ` WHERE e.empresa_id = $${paramIndex}`;
      params.push(empresaIdFiltro);
      paramIndex++;
    }

    const countResult = await query<{ count: string }>(`SELECT COUNT(*) as count FROM enderecos e ${whereClause}`, params);
    const total = parseInt(countResult[0].count);

    const data = await query<Endereco & { cliente_nome?: string; empresa_nome?: string }>(`
      SELECT e.*, c.nome as cliente_nome, emp.nome as empresa_nome
      FROM enderecos e
      LEFT JOIN clientes c ON e.cliente_id = c.id
      LEFT JOIN empresas emp ON e.empresa_id = emp.id
      ${whereClause}
      ORDER BY e.id DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, [...params, limit, offset]);

    return NextResponse.json({ data, total, page, limit });
  } catch (error) {
    console.error('Erro ao buscar endereços:', error);
    return NextResponse.json({ error: 'Erro ao buscar endereços' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cliente_id, empresa_id, logradouro, numero, bairro, cidade, cep, referencia, tipo } = body;

    const result = await query<Endereco>(`
      INSERT INTO enderecos (cliente_id, empresa_id, logradouro, numero, bairro, cidade, cep, referencia, tipo)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [cliente_id || null, empresa_id || null, logradouro, numero || null, bairro || null, cidade || null, cep || null, referencia || null, tipo || 'residencial']);

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Erro ao criar endereço:', error);
    return NextResponse.json({ error: 'Erro ao criar endereço' }, { status: 500 });
  }
}
