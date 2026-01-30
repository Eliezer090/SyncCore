import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query, queryOne } from '@/lib/db';
import type { Usuario } from '@/types/database';
import { getAuthUser, getEmpresaIdParaQuery } from '@/lib/auth/middleware';
import { formatDatabaseError } from '@/lib/db-errors';

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

    let sql = `
      SELECT u.*, e.nome as empresa_nome 
      FROM usuarios u
      LEFT JOIN empresas e ON u.empresa_id = e.id
      WHERE 1=1
    `;
    const params: unknown[] = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      sql += ` AND (u.nome ILIKE $${paramCount} OR u.email ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    // Filtrar por empresa (obrigatório para não-admin_global, ou se admin selecionou uma empresa)
    if (empresaIdFiltro !== null) {
      paramCount++;
      sql += ` AND u.empresa_id = $${paramCount}`;
      params.push(empresaIdFiltro);
    }

    sql += ' ORDER BY u.criado_em DESC';
    sql += ` LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const usuarios = await query<Usuario & { empresa_nome: string }>(sql, params);

    // Conta total
    let countSql = 'SELECT COUNT(*) as total FROM usuarios WHERE 1=1';
    const countParams: unknown[] = [];
    let countParamIndex = 0;

    if (search) {
      countParamIndex++;
      countSql += ` AND (nome ILIKE $${countParamIndex} OR email ILIKE $${countParamIndex})`;
      countParams.push(`%${search}%`);
    }

    // Filtrar por empresa (obrigatório para não-admin_global, ou se admin selecionou uma empresa)
    if (empresaIdFiltro !== null) {
      countParamIndex++;
      countSql += ` AND empresa_id = $${countParamIndex}`;
      countParams.push(empresaIdFiltro);
    }

    const countResult = await queryOne<{ total: string }>(countSql, countParams);
    const total = parseInt(countResult?.total || '0');

    return NextResponse.json({ data: usuarios, total, page, limit });
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return NextResponse.json({ error: 'Erro ao buscar usuários' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { empresa_id, nome, email, senha_hash, papel, ativo } = body;

    // Criptografar a senha antes de salvar
    const senhaHashCriptografada = senha_hash ? await bcrypt.hash(senha_hash, 10) : null;

    if (!senhaHashCriptografada) {
      return NextResponse.json({ error: 'Senha é obrigatória' }, { status: 400 });
    }

    const sql = `
      INSERT INTO usuarios (empresa_id, nome, email, senha_hash, papel, ativo)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const params = [empresa_id, nome, email, senhaHashCriptografada, papel, ativo ?? true];

    const result = await queryOne<Usuario>(sql, params);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    return NextResponse.json({ error: formatDatabaseError(error) }, { status: 500 });
  }
}
