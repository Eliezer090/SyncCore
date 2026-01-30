import { NextRequest, NextResponse } from 'next/server';
import { queryOne, query } from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

interface TokenPayload {
  userId: number;
  empresaId: number | null;
  empresaAtivaId?: number | null;
  email: string;
  papel: string;
  // profissionalId removido - profissional é o próprio usuario
}

interface Usuario {
  id: number;
  nome: string;
  email: string;
  senha_hash: string;
}

// PUT - Atualizar perfil do usuário logado
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token não fornecido' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    let decoded: TokenPayload;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    } catch {
      return NextResponse.json(
        { error: 'Token inválido ou expirado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { nome, senhaAtual, novaSenha } = body;

    if (!nome || nome.trim().length < 2) {
      return NextResponse.json(
        { error: 'Nome é obrigatório e deve ter pelo menos 2 caracteres' },
        { status: 400 }
      );
    }

    // Buscar usuário atual
    const usuario = await queryOne<Usuario>(
      'SELECT id, nome, email, senha_hash FROM usuarios WHERE id = $1',
      [decoded.userId]
    );

    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Se está alterando a senha, validar senha atual
    if (senhaAtual && novaSenha) {
      const senhaValida = await bcrypt.compare(senhaAtual, usuario.senha_hash);
      
      if (!senhaValida) {
        return NextResponse.json(
          { error: 'Senha atual incorreta' },
          { status: 400 }
        );
      }

      if (novaSenha.length < 6) {
        return NextResponse.json(
          { error: 'A nova senha deve ter pelo menos 6 caracteres' },
          { status: 400 }
        );
      }

      // Atualizar nome e senha
      const novaSenhaHash = await bcrypt.hash(novaSenha, 10);
      await query(
        'UPDATE usuarios SET nome = $1, senha_hash = $2 WHERE id = $3',
        [nome.trim(), novaSenhaHash, decoded.userId]
      );
    } else {
      // Atualizar apenas o nome
      await query(
        'UPDATE usuarios SET nome = $1 WHERE id = $2',
        [nome.trim(), decoded.userId]
      );
    }

    // Atualizar cache local se necessário
    const usuarioAtualizado = await queryOne<{ nome: string; email: string }>(
      'SELECT nome, email FROM usuarios WHERE id = $1',
      [decoded.userId]
    );

    return NextResponse.json({
      message: 'Perfil atualizado com sucesso',
      user: {
        nome: usuarioAtualizado?.nome,
        email: usuarioAtualizado?.email,
      },
    });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
