import { NextRequest, NextResponse } from 'next/server';
import { queryOne, query } from '@/lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

interface TokenPayload {
  userId: number;
  empresaId: number | null;
  email: string;
  papel: string;
  // profissionalId removido - profissional é identificado pelo userId + papel
}

interface Empresa {
  id: number;
  nome: string;
  url_logo: string | null;
  modelo_negocio: string;
  ativo: boolean;
}

// GET - Listar todas empresas (admin global)
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

    // Verificar se é admin
    if (decoded.papel !== 'admin') {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas admin pode acessar.' },
        { status: 403 }
      );
    }

    // Buscar todas empresas ativas
    const empresas = await query<Empresa>(
      'SELECT id, nome, url_logo, modelo_negocio, ativo FROM empresas WHERE ativo = true ORDER BY nome'
    );

    return NextResponse.json({ empresas });
  } catch (error) {
    console.error('Erro ao listar empresas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST - Selecionar empresa ativa (admin global)
export async function POST(request: NextRequest) {
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

    // Verificar se é admin
    if (decoded.papel !== 'admin') {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas admin pode selecionar empresa.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { empresaId } = body; // null = todas empresas

    let empresaAtiva = null;

    if (empresaId) {
      // Buscar dados da empresa selecionada
      const empresa = await queryOne<Empresa>(
        'SELECT id, nome, url_logo, modelo_negocio FROM empresas WHERE id = $1 AND ativo = true',
        [empresaId]
      );

      if (!empresa) {
        return NextResponse.json(
          { error: 'Empresa não encontrada' },
          { status: 404 }
        );
      }

      empresaAtiva = {
        id: empresa.id,
        nome: empresa.nome,
        logo: empresa.url_logo,
        modelo_negocio: empresa.modelo_negocio,
      };
    }

    // Gerar novo token com empresa ativa
    const newToken = jwt.sign(
      {
        userId: decoded.userId,
        empresaId: decoded.empresaId,
        empresaAtivaId: empresaId,
        email: decoded.email,
        papel: decoded.papel,
        // profissionalId removido
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return NextResponse.json({
      empresaAtiva,
      token: newToken,
    });
  } catch (error) {
    console.error('Erro ao selecionar empresa:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
