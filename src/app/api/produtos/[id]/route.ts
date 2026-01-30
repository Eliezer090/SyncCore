import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute, query } from '@/lib/db';
import { formatDatabaseError } from '@/lib/db-errors';
import { deleteImageByUrl } from '@/lib/imagekit';
import type { Produto } from '@/types/database';

interface ProdutoImagem {
  id: number;
  produto_id: number;
  url: string;
  ordem: number;
  is_capa: boolean;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const produto = await queryOne<Produto>(`
      SELECT p.*, e.nome as empresa_nome, c.nome as categoria_nome
      FROM produtos p
      LEFT JOIN empresas e ON p.empresa_id = e.id
      LEFT JOIN categorias_produto c ON p.categoria_id = c.id
      WHERE p.id = $1
    `, [id]);

    if (!produto) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
    }

    return NextResponse.json(produto);
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
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
    const { empresa_id, categoria_id, nome, descricao, preco, controla_estoque, ativo, url_imagem } = body;

    // Busca o produto atual para verificar se a imagem mudou
    const produtoAtual = await queryOne<Produto>('SELECT url_imagem FROM produtos WHERE id = $1', [id]);
    
    // Se a imagem mudou e havia uma imagem anterior, deletar do ImageKit
    if (produtoAtual?.url_imagem && produtoAtual.url_imagem !== url_imagem) {
      await deleteImageByUrl(produtoAtual.url_imagem);
    }

    const sql = `
      UPDATE produtos SET
        empresa_id = $1, categoria_id = $2, nome = $3, descricao = $4,
        preco = $5, controla_estoque = $6, ativo = $7, url_imagem = $8
      WHERE id = $9
      RETURNING *
    `;
    const sqlParams = [empresa_id, categoria_id, nome, descricao, preco, controla_estoque, ativo, url_imagem, id];

    const result = await queryOne<Produto>(sql, sqlParams);

    if (!result) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    return NextResponse.json({ error: formatDatabaseError(error) }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Busca o produto para deletar a imagem principal do ImageKit
    const produto = await queryOne<Produto>('SELECT url_imagem FROM produtos WHERE id = $1', [id]);
    
    // Deleta a imagem principal do ImageKit se existir
    if (produto?.url_imagem) {
      await deleteImageByUrl(produto.url_imagem);
    }
    
    // Busca e deleta todas as imagens da galeria do ImageKit
    const imagensGaleria = await query<ProdutoImagem>('SELECT url FROM produto_imagens WHERE produto_id = $1', [id]);
    for (const imagem of imagensGaleria) {
      await deleteImageByUrl(imagem.url);
    }
    
    // Deleta as imagens da galeria do banco (CASCADE pode fazer isso, mas garantimos)
    await execute('DELETE FROM produto_imagens WHERE produto_id = $1', [id]);
    
    const rowCount = await execute('DELETE FROM produtos WHERE id = $1', [id]);

    if (rowCount === 0) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Produto excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir produto:', error);
    return NextResponse.json({ error: formatDatabaseError(error) }, { status: 500 });
  }
}
