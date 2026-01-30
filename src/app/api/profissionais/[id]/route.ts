import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute } from '@/lib/db';
import { formatDatabaseError } from '@/lib/db-errors';
import { deleteImageByUrl } from '@/lib/imagekit';
import type { Usuario } from '@/types/database';

// Profissionais agora são usuários com papel = 'profissional'
// A tabela profissionais foi removida e unificada com usuarios

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const profissional = await queryOne<Usuario & { empresa_nome: string }>(`
      SELECT u.id, u.empresa_id, u.nome, u.email, u.papel, u.ativo, u.criado_em, u.url_foto,
             e.nome as empresa_nome
      FROM usuarios u
      LEFT JOIN empresas e ON u.empresa_id = e.id
      WHERE u.id = $1 AND u.papel = 'profissional'
    `, [id]);

    if (!profissional) {
      return NextResponse.json({ error: 'Profissional não encontrado' }, { status: 404 });
    }

    return NextResponse.json(profissional);
  } catch (error) {
    console.error('Erro ao buscar profissional:', error);
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
    const { nome, ativo, url_foto } = body;

    // Busca o usuário atual para verificar se a imagem mudou
    const usuarioAtual = await queryOne<Usuario>('SELECT url_foto FROM usuarios WHERE id = $1 AND papel = $2', [id, 'profissional']);
    
    if (!usuarioAtual) {
      return NextResponse.json({ error: 'Profissional não encontrado' }, { status: 404 });
    }

    // Se a imagem mudou e havia uma imagem anterior, deletar do ImageKit
    if (usuarioAtual?.url_foto && usuarioAtual.url_foto !== url_foto) {
      await deleteImageByUrl(usuarioAtual.url_foto);
    }

    const sql = `
      UPDATE usuarios SET
        nome = $1, ativo = $2, url_foto = $3
      WHERE id = $4 AND papel = 'profissional'
      RETURNING id, empresa_id, nome, email, papel, ativo, criado_em, url_foto
    `;
    const sqlParams = [nome, ativo, url_foto, id];

    const result = await queryOne<Usuario>(sql, sqlParams);

    if (!result) {
      return NextResponse.json({ error: 'Profissional não encontrado' }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro ao atualizar profissional:', error);
    return NextResponse.json({ error: formatDatabaseError(error) }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Busca o usuário para deletar a imagem do ImageKit
    const usuario = await queryOne<Usuario>('SELECT url_foto FROM usuarios WHERE id = $1 AND papel = $2', [id, 'profissional']);
    
    if (!usuario) {
      return NextResponse.json({ error: 'Profissional não encontrado' }, { status: 404 });
    }

    // Deleta a imagem do ImageKit se existir
    if (usuario?.url_foto) {
      await deleteImageByUrl(usuario.url_foto);
    }
    
    // Ao invés de deletar, apenas desativa o usuário e muda o papel
    // Isso preserva o histórico e evita problemas com CASCADE
    const rowCount = await execute(
      'UPDATE usuarios SET ativo = false WHERE id = $1 AND papel = $2',
      [id, 'profissional']
    );

    if (rowCount === 0) {
      return NextResponse.json({ error: 'Profissional não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Profissional desativado com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir profissional:', error);
    return NextResponse.json({ error: formatDatabaseError(error) }, { status: 500 });
  }
}
