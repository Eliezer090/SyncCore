import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, execute } from '@/lib/db';
import { formatDatabaseError } from '@/lib/db-errors';
import type { Empresa } from '@/types/database';
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
    const search = searchParams.get('search') || '';
    const offset = page * limit;

    let sql = 'SELECT * FROM empresas WHERE 1=1';
    const params: unknown[] = [];
    let paramCount = 0;

    // Filtrar por empresa (obrigatório para não-admin_global, ou se admin selecionou uma empresa)
    if (empresaIdFiltro !== null) {
      paramCount++;
      sql += ` AND id = $${paramCount}`;
      params.push(empresaIdFiltro);
    }

    if (search) {
      paramCount++;
      sql += ` AND (nome ILIKE $${paramCount} OR tipo_negocio ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    sql += ' ORDER BY criado_em DESC';
    sql += ` LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const empresas = await query<Empresa>(sql, params);

    // Conta total
    let countSql = 'SELECT COUNT(*) as total FROM empresas WHERE 1=1';
    const countParams: unknown[] = [];
    let countParamIndex = 0;

    // Filtrar por empresa (obrigatório para não-admin_global, ou se admin selecionou uma empresa)
    if (empresaIdFiltro !== null) {
      countParamIndex++;
      countSql += ` AND id = $${countParamIndex}`;
      countParams.push(empresaIdFiltro);
    }

    if (search) {
      countParamIndex++;
      countSql += ` AND (nome ILIKE $${countParamIndex} OR tipo_negocio ILIKE $${countParamIndex})`;
      countParams.push(`%${search}%`);
    }
    const countResult = await queryOne<{ total: string }>(countSql, countParams);
    const total = parseInt(countResult?.total || '0');

    return NextResponse.json({ data: empresas, total, page, limit });
  } catch (error) {
    console.error('Erro ao buscar empresas:', error);
    return NextResponse.json({ error: formatDatabaseError(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nome, tipo_negocio, ativo, whatsapp_vinculado, nome_agente, modelo_negocio, oferece_delivery, taxa_entrega_padrao, valor_minimo_entrega_gratis, tempo_cancelamento_minutos, url_logo, descricao_negocio } = body;

    // Converter strings vazias para null (evita erro de unique constraint)
    const whatsappNormalizado = whatsapp_vinculado?.trim() || null;
    const nomeAgenteNormalizado = nome_agente?.trim() || null;

    const sql = `
      INSERT INTO empresas (nome, tipo_negocio, ativo, whatsapp_vinculado, nome_agente, modelo_negocio, oferece_delivery, taxa_entrega_padrao, valor_minimo_entrega_gratis, tempo_cancelamento_minutos, url_logo, descricao_negocio)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;
    const params = [nome, tipo_negocio, ativo ?? true, whatsappNormalizado, nomeAgenteNormalizado, modelo_negocio || 'ambos', oferece_delivery ?? false, taxa_entrega_padrao ?? 0, valor_minimo_entrega_gratis, tempo_cancelamento_minutos ?? 60, url_logo, descricao_negocio];

    const result = await queryOne<Empresa>(sql, params);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar empresa:', error);
    return NextResponse.json({ error: formatDatabaseError(error) }, { status: 500 });
  }
}
