import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute } from '@/lib/db';
import { formatDatabaseError } from '@/lib/db-errors';
import { deleteImageByUrl } from '@/lib/imagekit';
import type { Cliente } from '@/types/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cliente = await queryOne<Cliente>('SELECT * FROM clientes WHERE id = $1', [id]);

    if (!cliente) {
      return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 });
    }

    return NextResponse.json(cliente);
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
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
    const { nome, telefone, url_foto } = body;

    // Busca o cliente atual para verificar se a imagem mudou
    const clienteAtual = await queryOne<Cliente>('SELECT url_foto FROM clientes WHERE id = $1', [id]);
    
    // Se a imagem mudou e havia uma imagem anterior, deletar do ImageKit
    if (clienteAtual?.url_foto && clienteAtual.url_foto !== url_foto) {
      await deleteImageByUrl(clienteAtual.url_foto);
    }

    const sql = `
      UPDATE clientes SET nome = $1, telefone = $2, url_foto = $3
      WHERE id = $4
      RETURNING *
    `;
    const sqlParams = [nome, telefone, url_foto, id];

    const result = await queryOne<Cliente>(sql, sqlParams);

    if (!result) {
      return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    return NextResponse.json({ error: formatDatabaseError(error) }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Busca o cliente para deletar a imagem do ImageKit
    const cliente = await queryOne<Cliente>('SELECT url_foto FROM clientes WHERE id = $1', [id]);
    
    // Deleta a imagem do ImageKit se existir
    if (cliente?.url_foto) {
      await deleteImageByUrl(cliente.url_foto);
    }
    
    const rowCount = await execute('DELETE FROM clientes WHERE id = $1', [id]);

    if (rowCount === 0) {
      return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Cliente excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir cliente:', error);
    return NextResponse.json({ error: formatDatabaseError(error) }, { status: 500 });
  }
}
