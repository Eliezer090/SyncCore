import { NextRequest, NextResponse } from 'next/server';
import { queryOne, query } from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

interface UsuarioWithEmpresa {
  id: number;
  empresa_id: number;
  nome: string;
  email: string;
  papel: string;
  ativo: boolean;
  empresa_nome: string;
  empresa_logo: string | null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nome, email, password, empresa_id } = body;

    if (!nome || !email || !password) {
      return NextResponse.json(
        { error: 'Nome, email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se email já existe
    const existingUser = await queryOne<{ id: number }>(
      'SELECT id FROM usuarios WHERE email = $1',
      [email]
    );

    if (existingUser) {
      return NextResponse.json(
        { error: 'Este email já está cadastrado' },
        { status: 400 }
      );
    }

    // Gerar hash da senha
    const senhaHash = await bcrypt.hash(password, 10);

    // Criar usuário - empresa_id pode ser null para novos usuários
    // Papel será 'gerente' para novos usuários que vão criar sua própria empresa
    const finalEmpresaId = empresa_id || null;
    const papel = finalEmpresaId ? 'usuario' : 'gerente'; // Se não tem empresa, será gerente da sua própria empresa

    const sql = `
      INSERT INTO usuarios (empresa_id, nome, email, senha_hash, papel, ativo)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, empresa_id, nome, email, papel, ativo
    `;
    const params = [finalEmpresaId, nome, email, senhaHash, papel, true];

    const novoUsuario = await queryOne<{
      id: number;
      empresa_id: number | null;
      nome: string;
      email: string;
      papel: string;
      ativo: boolean;
    }>(sql, params);

    if (!novoUsuario) {
      return NextResponse.json(
        { error: 'Erro ao criar usuário' },
        { status: 500 }
      );
    }

    // Buscar dados da empresa (se existir)
    let empresa = null;
    if (novoUsuario.empresa_id) {
      empresa = await queryOne<{ nome: string; url_logo: string | null; modelo_negocio: string }>(
        'SELECT nome, url_logo, modelo_negocio FROM empresas WHERE id = $1',
        [novoUsuario.empresa_id]
      );
    }

    // Gerar token JWT
    const token = jwt.sign(
      {
        userId: novoUsuario.id,
        empresaId: novoUsuario.empresa_id,
        email: novoUsuario.email,
        papel: novoUsuario.papel,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Retornar dados do usuário
    const userData = {
      id: novoUsuario.id.toString(),
      nome: novoUsuario.nome,
      email: novoUsuario.email,
      papel: novoUsuario.papel,
      empresa: novoUsuario.empresa_id && empresa ? {
        id: novoUsuario.empresa_id,
        nome: empresa.nome,
        logo: empresa.url_logo || null,
        modelo_negocio: empresa.modelo_negocio || 'ambos',
      } : null,
    };

    return NextResponse.json({
      user: userData,
      token,
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
