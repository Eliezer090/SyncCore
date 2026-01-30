import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { deleteImageByUrl } from '@/lib/imagekit';

// PUT - Atualizar imagem (ordem, is_capa)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { ordem, is_capa } = body;

    // Busca a imagem atual para pegar o produto_id
    const currentImage = await pool.query(
      `SELECT * FROM produto_imagens WHERE id = $1`,
      [id]
    );

    if (currentImage.rows.length === 0) {
      return NextResponse.json({ error: 'Imagem não encontrada' }, { status: 404 });
    }

    const produtoId = currentImage.rows[0].produto_id;

    // Se está marcando como capa, remove a capa das outras
    if (is_capa) {
      await pool.query(
        `UPDATE produto_imagens SET is_capa = false WHERE produto_id = $1`,
        [produtoId]
      );
    }

    const result = await pool.query(
      `UPDATE produto_imagens
       SET ordem = COALESCE($1, ordem), is_capa = COALESCE($2, is_capa)
       WHERE id = $3
       RETURNING *`,
      [ordem, is_capa, id]
    );

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar imagem:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// DELETE - Remover imagem
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Primeiro busca a imagem para pegar a URL
    const imageResult = await pool.query(
      `SELECT url FROM produto_imagens WHERE id = $1`,
      [id]
    );

    if (imageResult.rows.length === 0) {
      return NextResponse.json({ error: 'Imagem não encontrada' }, { status: 404 });
    }

    const imageUrl = imageResult.rows[0].url;

    // Deleta do ImageKit (não bloqueia se falhar)
    if (imageUrl) {
      deleteImageByUrl(imageUrl).catch(err => 
        console.error('Erro ao deletar do ImageKit:', err)
      );
    }

    // Deleta do banco de dados
    const result = await pool.query(
      `DELETE FROM produto_imagens WHERE id = $1 RETURNING *`,
      [id]
    );

    return NextResponse.json({ message: 'Imagem removida com sucesso' });
  } catch (error) {
    console.error('Erro ao remover imagem:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
