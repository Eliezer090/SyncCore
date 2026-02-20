import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute, query } from '@/lib/db';
import { formatDatabaseError } from '@/lib/db-errors';
import { deleteImageByUrl } from '@/lib/imagekit';
import type { Servico } from '@/types/database';

interface ServicoImagem {
  id: number;
  servico_id: number;
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
    const servico = await queryOne<Servico>(`
      SELECT s.*, e.nome as empresa_nome
      FROM servicos s
      LEFT JOIN empresas e ON s.empresa_id = e.id
      WHERE s.id = $1
    `, [id]);

    if (!servico) {
      return NextResponse.json({ error: 'Serviço não encontrado' }, { status: 404 });
    }

    return NextResponse.json(servico);
  } catch (error) {
    console.error('Erro ao buscar serviço:', error);
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
    const { empresa_id, nome, descricao, ativo, url_imagem, preco, duracao_minutos, antecedencia_minima_minutos } = body;

    // Busca o serviço atual para verificar se a imagem mudou
    const servicoAtual = await queryOne<Servico>('SELECT url_imagem FROM servicos WHERE id = $1', [id]);
    
    // Se a imagem mudou e havia uma imagem anterior, deletar do ImageKit
    if (servicoAtual?.url_imagem && servicoAtual.url_imagem !== url_imagem) {
      await deleteImageByUrl(servicoAtual.url_imagem);
    }

    const sql = `
      UPDATE servicos SET
        empresa_id = $1, nome = $2, descricao = $3, ativo = $4, url_imagem = $5,
        preco = $6, duracao_minutos = $7, antecedencia_minima_minutos = $8
      WHERE id = $9
      RETURNING *
    `;
    const sqlParams = [empresa_id, nome, descricao, ativo, url_imagem, preco ?? 0, duracao_minutos ?? 30, antecedencia_minima_minutos ?? null, id];

    const result = await queryOne<Servico>(sql, sqlParams);

    if (!result) {
      return NextResponse.json({ error: 'Serviço não encontrado' }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro ao atualizar serviço:', error);
    return NextResponse.json({ error: formatDatabaseError(error) }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Busca o serviço para deletar a imagem principal do ImageKit
    const servico = await queryOne<Servico>('SELECT url_imagem FROM servicos WHERE id = $1', [id]);
    
    // Deleta a imagem principal do ImageKit se existir
    if (servico?.url_imagem) {
      await deleteImageByUrl(servico.url_imagem);
    }
    
    // Busca e deleta todas as imagens da galeria do ImageKit
    const imagensGaleria = await query<ServicoImagem>('SELECT url FROM servico_imagens WHERE servico_id = $1', [id]);
    for (const imagem of imagensGaleria) {
      await deleteImageByUrl(imagem.url);
    }
    
    // Deleta as imagens da galeria do banco (CASCADE pode fazer isso, mas garantimos)
    await execute('DELETE FROM servico_imagens WHERE servico_id = $1', [id]);
    
    const rowCount = await execute('DELETE FROM servicos WHERE id = $1', [id]);

    if (rowCount === 0) {
      return NextResponse.json({ error: 'Serviço não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Serviço excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir serviço:', error);
    return NextResponse.json({ error: formatDatabaseError(error) }, { status: 500 });
  }
}
