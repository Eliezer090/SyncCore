import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

interface TokenPayload {
  userId: number;
  empresaId: number | null;
  empresaAtivaId?: number | null; // empresa selecionada pelo admin global
  email: string;
  papel: string;
}

interface UsuarioWithEmpresa {
  id: number;
  empresa_id: number | null;
  nome: string;
  email: string;
  papel: string;
  ativo: boolean;
  url_foto: string | null;
  empresa_nome: string | null;
  empresa_logo: string | null;
  empresa_modelo_negocio: string | null;
}

export async function GET(request: NextRequest) {
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

    // Buscar dados atualizados do usuário (sem JOIN com profissionais)
    const sql = `
      SELECT 
        u.id,
        u.empresa_id,
        u.nome,
        u.email,
        u.papel,
        u.ativo,
        u.url_foto,
        e.nome as empresa_nome,
        e.url_logo as empresa_logo,
        e.modelo_negocio as empresa_modelo_negocio
      FROM usuarios u
      LEFT JOIN empresas e ON u.empresa_id = e.id
      WHERE u.id = $1
    `;

    const usuario = await queryOne<UsuarioWithEmpresa>(sql, [decoded.userId]);

    if (!usuario || !usuario.ativo) {
      return NextResponse.json(
        { error: 'Usuário não encontrado ou inativo' },
        { status: 401 }
      );
    }

    // Para admin, buscar dados da empresa ativa do token
    let empresaAtiva = null;
    if (usuario.papel === 'admin' && decoded.empresaAtivaId) {
      const empresaAtivaDados = await queryOne<{
        id: number;
        nome: string;
        url_logo: string | null;
        modelo_negocio: string;
      }>(
        'SELECT id, nome, url_logo, modelo_negocio FROM empresas WHERE id = $1 AND ativo = true',
        [decoded.empresaAtivaId]
      );
      if (empresaAtivaDados) {
        empresaAtiva = {
          id: empresaAtivaDados.id,
          nome: empresaAtivaDados.nome,
          logo: empresaAtivaDados.url_logo,
          modelo_negocio: empresaAtivaDados.modelo_negocio,
        };
      }
    } else if (usuario.empresa_id) {
      // Para usuários normais, a empresa ativa é a empresa vinculada
      empresaAtiva = {
        id: usuario.empresa_id,
        nome: usuario.empresa_nome,
        logo: usuario.empresa_logo,
        modelo_negocio: usuario.empresa_modelo_negocio,
      };
    }

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
      empresaAtiva,
    };

    return NextResponse.json({ user: userData });
  } catch (error) {
    console.error('Erro ao verificar usuário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
