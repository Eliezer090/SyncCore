import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET - Listar imagens de um produto
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const produtoId = searchParams.get('produto_id');

    if (!produtoId) {
      return NextResponse.json({ error: 'produto_id é obrigatório' }, { status: 400 });
    }

    const result = await pool.query(
      `SELECT * FROM produto_imagens WHERE produto_id = $1 ORDER BY ordem ASC, id ASC`,
      [produtoId]
    );

    return NextResponse.json({ data: result.rows });
  } catch (error) {
    console.error('Erro ao buscar imagens do produto:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// POST - Adicionar imagem ao produto
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { produto_id, url, ordem = 0, is_capa = false } = body;

    if (!produto_id || !url) {
      return NextResponse.json({ error: 'produto_id e url são obrigatórios' }, { status: 400 });
    }

    // Se a nova imagem for capa, remove a capa das outras
    if (is_capa) {
      await pool.query(
        `UPDATE produto_imagens SET is_capa = false WHERE produto_id = $1`,
        [produto_id]
      );
    }

    const result = await pool.query(
      `INSERT INTO produto_imagens (produto_id, url, ordem, is_capa)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [produto_id, url, ordem, is_capa]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Erro ao adicionar imagem:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
