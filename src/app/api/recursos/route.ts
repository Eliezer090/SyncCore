import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import jwt from 'jsonwebtoken';
import type { Recurso } from '@/types/database';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

interface TokenPayload {
  userId: number;
  empresaId: number | null;
  email: string;
  papel: string;
}

// GET - Listar todos os recursos do sistema
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    let decoded: TokenPayload;
    
    try {
      decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    } catch {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    // Só admin pode ver todos os recursos
    if (decoded.papel !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const recursos = await query<Recurso>(
      'SELECT * FROM recursos WHERE ativo = true ORDER BY ordem'
    );

    // Agrupar por grupo
    const porGrupo = recursos.reduce((acc, r) => {
      const grupo = r.grupo || 'Outros';
      if (!acc[grupo]) acc[grupo] = [];
      acc[grupo].push(r);
      return acc;
    }, {} as Record<string, Recurso[]>);

    return NextResponse.json({ recursos, porGrupo });
  } catch (error) {
    console.error('Erro ao buscar recursos:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
