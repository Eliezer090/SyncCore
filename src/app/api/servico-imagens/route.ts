import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET - Listar imagens de um serviço
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const servicoId = searchParams.get('servico_id');

    if (!servicoId) {
      return NextResponse.json({ error: 'servico_id é obrigatório' }, { status: 400 });
    }

    const result = await pool.query(
      `SELECT * FROM servico_imagens WHERE servico_id = $1 ORDER BY ordem ASC, id ASC`,
      [servicoId]
    );

    return NextResponse.json({ data: result.rows });
  } catch (error) {
    console.error('Erro ao buscar imagens do serviço:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// POST - Adicionar imagem ao serviço
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { servico_id, url, ordem = 0, is_capa = false } = body;

    if (!servico_id || !url) {
      return NextResponse.json({ error: 'servico_id e url são obrigatórios' }, { status: 400 });
    }

    // Se a nova imagem for capa, remove a capa das outras
    if (is_capa) {
      await pool.query(
        `UPDATE servico_imagens SET is_capa = false WHERE servico_id = $1`,
        [servico_id]
      );
    }

    const result = await pool.query(
      `INSERT INTO servico_imagens (servico_id, url, ordem, is_capa)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [servico_id, url, ordem, is_capa]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Erro ao adicionar imagem:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
