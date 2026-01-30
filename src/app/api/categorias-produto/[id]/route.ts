import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute } from '@/lib/db';
import { formatDatabaseError } from '@/lib/db-errors';
import { deleteImageByUrl } from '@/lib/imagekit';
import type { CategoriaProduto } from '@/types/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const categoria = await queryOne<CategoriaProduto>('SELECT * FROM categorias_produto WHERE id = $1', [id]);

    if (!categoria) {
      return NextResponse.json({ error: 'Categoria não encontrada' }, { status: 404 });
    }

    return NextResponse.json(categoria);
  } catch (error) {
    console.error('Erro ao buscar categoria:', error);
    return NextResponse.json({ error: formatDatabaseError(error) }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { empresa_id, nome, descricao, ativo, url_imagem } = body;

    // Busca a categoria atual para verificar se a imagem mudou
    const categoriaAtual = await queryOne<CategoriaProduto>('SELECT url_imagem FROM categorias_produto WHERE id = $1', [id]);
    
    // Se a imagem mudou e havia uma imagem anterior, deletar do ImageKit
    if (categoriaAtual?.url_imagem && categoriaAtual.url_imagem !== url_imagem) {
      await deleteImageByUrl(categoriaAtual.url_imagem);
    }

    const sql = `
      UPDATE categorias_produto SET
        empresa_id = $1, nome = $2, descricao = $3, ativo = $4, url_imagem = $5
      WHERE id = $6
      RETURNING *
    `;
    const sqlParams = [empresa_id, nome, descricao, ativo, url_imagem, id];

    const result = await queryOne<CategoriaProduto>(sql, sqlParams);

    if (!result) {
      return NextResponse.json({ error: 'Categoria não encontrada' }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro ao atualizar categoria:', error);
    return NextResponse.json({ error: formatDatabaseError(error) }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Busca a categoria para deletar a imagem do ImageKit
    const categoria = await queryOne<CategoriaProduto>('SELECT url_imagem FROM categorias_produto WHERE id = $1', [id]);
    
    // Deleta a imagem do ImageKit se existir
    if (categoria?.url_imagem) {
      await deleteImageByUrl(categoria.url_imagem);
    }
    
    const rowCount = await execute('DELETE FROM categorias_produto WHERE id = $1', [id]);

    if (rowCount === 0) {
      return NextResponse.json({ error: 'Categoria não encontrada' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Categoria excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir categoria:', error);
    return NextResponse.json({ error: formatDatabaseError(error) }, { status: 500 });
  }
}
