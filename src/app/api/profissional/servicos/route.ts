import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { ServicoProfissional } from '@/types/database';
import { getAuthUser } from '@/lib/auth/middleware';
import { formatDatabaseError } from '@/lib/db-errors';

export async function GET(request: NextRequest) {
  try {
    const { user, error } = getAuthUser(request);
    
    if (!user || error) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Só profissional pode acessar
    if (user.papel !== 'profissional') {
      return NextResponse.json({ error: 'Acesso restrito a profissionais' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '0');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = page * limit;

    // Agora usa usuario_id ao invés de profissional_id
    const servicosProfissional = await query<
      ServicoProfissional & {
        servico_nome: string;
        duracao: number;
      }
    >(
      `SELECT sp.*, s.nome as servico_nome, sp.duracao_minutos as duracao
       FROM servicos_profissional sp
       JOIN servicos s ON sp.servico_id = s.id
       WHERE sp.usuario_id = $1
       ORDER BY s.nome ASC
       LIMIT $2 OFFSET $3`,
      [user.userId, limit, offset]
    );

    // Contar total
    const countResult = await query<{ count: number }>(
      `SELECT COUNT(*) as count FROM servicos_profissional WHERE usuario_id = $1`,
      [user.userId]
    );

    const total = parseInt(countResult[0]?.count?.toString() || '0');

    return NextResponse.json({ data: servicosProfissional, total, page, limit });
  } catch (error) {
    console.error('Erro ao buscar serviços do profissional:', error);
    return NextResponse.json({ error: formatDatabaseError(error) }, { status: 500 });
  }
}
