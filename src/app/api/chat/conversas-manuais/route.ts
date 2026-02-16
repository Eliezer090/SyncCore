import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthUser, getEmpresaIdParaQuery } from '@/lib/auth/middleware';

interface ConversaManual {
  cliente_id: number;
  cliente_nome: string | null;
  cliente_telefone: string;
  empresa_id: number;
  ia_ativa: boolean;
}

// GET /api/chat/conversas-manuais - Lista clientes com ia_ativa = false (modo manual)
export async function GET(request: NextRequest) {
  try {
    const { user, error } = getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: error || 'Não autorizado' }, { status: 401 });
    }

    const empresaId = getEmpresaIdParaQuery(user);
    if (!empresaId) {
      return NextResponse.json({ error: 'Empresa não selecionada' }, { status: 400 });
    }

    const result = await query<ConversaManual>(`
      SELECT 
        ce.cliente_id,
        c.nome as cliente_nome,
        c.telefone as cliente_telefone,
        ce.empresa_id,
        ce.ia_ativa
      FROM clientes_empresas ce
      JOIN clientes c ON c.id = ce.cliente_id
      WHERE ce.empresa_id = $1 AND ce.ia_ativa = false
      ORDER BY c.nome ASC
    `, [empresaId]);

    return NextResponse.json({ data: result, total: result.length });
  } catch (error) {
    console.error('Erro ao buscar conversas manuais:', error);
    return NextResponse.json({ error: 'Erro ao buscar conversas manuais' }, { status: 500 });
  }
}
