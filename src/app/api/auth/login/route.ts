import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

interface UsuarioWithEmpresa {
  id: number;
  empresa_id: number | null;
  nome: string;
  email: string;
  senha_hash: string;
  papel: string;
  ativo: boolean;
  criado_em: Date;
  empresa_nome: string | null;
  empresa_logo: string | null;
  empresa_modelo_negocio: string | null;
  url_foto: string | null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Buscar usuário com dados da empresa (sem JOIN com profissionais)
    const sql = `
      SELECT 
        u.id,
        u.empresa_id,
        u.nome,
        u.email,
        u.senha_hash,
        u.papel,
        u.ativo,
        u.criado_em,
        u.url_foto,
        e.nome as empresa_nome,
        e.url_logo as empresa_logo,
        e.modelo_negocio as empresa_modelo_negocio
      FROM usuarios u
      LEFT JOIN empresas e ON u.empresa_id = e.id
      WHERE u.email = $1
    `;

    const usuario = await queryOne<UsuarioWithEmpresa>(sql, [email]);

    if (!usuario) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      );
    }

    if (!usuario.ativo) {
      return NextResponse.json(
        { error: 'Usuário inativo. Entre em contato com o administrador.' },
        { status: 401 }
      );
    }

    // Verificar senha
    const senhaValida = await bcrypt.compare(password, usuario.senha_hash);

    if (!senhaValida) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      );
    }

    // Gerar token JWT (sem profissionalId, agora usa papel)
    const token = jwt.sign(
      {
        userId: usuario.id,
        empresaId: usuario.empresa_id,
        email: usuario.email,
        papel: usuario.papel,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Montar dados do usuário
    const userData: Record<string, unknown> = {
      id: usuario.id.toString(),
      nome: usuario.nome,
      email: usuario.email,
      papel: usuario.papel,
      url_foto: usuario.url_foto,
      empresa: usuario.empresa_id ? {
        id: usuario.empresa_id,
        nome: usuario.empresa_nome,
        logo: usuario.empresa_logo,
        modelo_negocio: usuario.empresa_modelo_negocio,
      } : null,
      empresaAtiva: usuario.empresa_id ? {
        id: usuario.empresa_id,
        nome: usuario.empresa_nome,
        logo: usuario.empresa_logo,
        modelo_negocio: usuario.empresa_modelo_negocio,
      } : null,
    };

    return NextResponse.json({
      user: userData,
      token,
    });
  } catch (error) {
    console.error('Erro no login:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
