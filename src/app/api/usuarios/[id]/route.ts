import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { queryOne, execute } from '@/lib/db';
import type { Usuario } from '@/types/database';
import { formatDatabaseError } from '@/lib/db-errors';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const usuario = await queryOne<Usuario>(`
      SELECT u.*, e.nome as empresa_nome 
      FROM usuarios u
      LEFT JOIN empresas e ON u.empresa_id = e.id
      WHERE u.id = $1
    `, [id]);

    if (!usuario) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    return NextResponse.json(usuario);
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
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
    const { empresa_id, nome, email, senha_hash, papel, ativo } = body;

    let sql: string;
    let sqlParams: unknown[];

    if (senha_hash) {
      // Criptografar a nova senha antes de salvar
      const senhaHashCriptografada = await bcrypt.hash(senha_hash, 10);
      
      sql = `
        UPDATE usuarios SET
          empresa_id = $1, nome = $2, email = $3, senha_hash = $4, papel = $5, ativo = $6
        WHERE id = $7
        RETURNING *
      `;
      sqlParams = [empresa_id, nome, email, senhaHashCriptografada, papel, ativo, id];
    } else {
      sql = `
        UPDATE usuarios SET
          empresa_id = $1, nome = $2, email = $3, papel = $4, ativo = $5
        WHERE id = $6
        RETURNING *
      `;
      sqlParams = [empresa_id, nome, email, papel, ativo, id];
    }

    const result = await queryOne<Usuario>(sql, sqlParams);

    if (!result) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    return NextResponse.json({ error: formatDatabaseError(error) }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const rowCount = await execute('DELETE FROM usuarios WHERE id = $1', [id]);

    if (rowCount === 0) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Usuário excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    return NextResponse.json({ error: formatDatabaseError(error) }, { status: 500 });
  }
}
