import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { ProdutoAdicional } from '@/types/database';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '0');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = page * limit;
    const produtoId = searchParams.get('produto_id');

    let whereClause = '';
    const params: (string | number)[] = [];
    let paramIndex = 1;

    if (produtoId) {
      whereClause = ` WHERE pa.produto_id = $${paramIndex}`;
      params.push(produtoId);
      paramIndex++;
    }

    const countResult = await query<{ count: string }>(`SELECT COUNT(*) as count FROM produto_adicionais pa ${whereClause}`, params);
    const total = parseInt(countResult[0].count);

    const data = await query<ProdutoAdicional & { produto_nome?: string }>(`
      SELECT pa.*, p.nome as produto_nome
      FROM produto_adicionais pa
      LEFT JOIN produtos p ON pa.produto_id = p.id
      ${whereClause}
      ORDER BY pa.id DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, [...params, limit, offset]);

    return NextResponse.json({ data, total, page, limit });
  } catch (error) {
    console.error('Erro ao buscar adicionais:', error);
    return NextResponse.json({ error: 'Erro ao buscar adicionais' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { produto_id, nome, preco, ativo } = body;

    const result = await query<ProdutoAdicional>(`
      INSERT INTO produto_adicionais (produto_id, nome, preco, ativo)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [produto_id, nome, preco || 0, ativo ?? true]);

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Erro ao criar adicional:', error);
    return NextResponse.json({ error: 'Erro ao criar adicional' }, { status: 500 });
  }
}
