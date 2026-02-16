import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import { getAuthUser, getEmpresaIdParaQuery } from '@/lib/auth/middleware';

interface IaStatusResult {
  ia_ativa: boolean;
  cliente_id: number;
  empresa_id: number;
  cliente_nome: string | null;
  cliente_telefone: string;
}

// POST /api/chat/ia-status - Busca status da IA por telefone (remoteJid)
export async function POST(request: NextRequest) {
  try {
    const { user, error } = getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: error || 'Não autorizado' }, { status: 401 });
    }

    const empresaId = getEmpresaIdParaQuery(user);
    if (!empresaId) {
      return NextResponse.json({ error: 'Empresa não selecionada' }, { status: 400 });
    }

    const body = await request.json();
    const { telefone } = body;

    if (!telefone) {
      return NextResponse.json({ error: 'telefone é obrigatório' }, { status: 400 });
    }

    // Normalizar telefone: remover @s.whatsapp.net e caracteres não numéricos
    const telefoneLimpo = telefone.replace('@s.whatsapp.net', '').replace(/\D/g, '');

    // Tentar buscar por match exato, com/sem código do país
    const result = await queryOne<IaStatusResult>(`
      SELECT 
        ce.ia_ativa,
        ce.cliente_id,
        ce.empresa_id,
        c.nome as cliente_nome,
        c.telefone as cliente_telefone
      FROM clientes_empresas ce
      JOIN clientes c ON c.id = ce.cliente_id
      WHERE ce.empresa_id = $1 
        AND (
          REGEXP_REPLACE(c.telefone, '[^0-9]', '', 'g') = $2
          OR REGEXP_REPLACE(c.telefone, '[^0-9]', '', 'g') = $3
          OR '55' || REGEXP_REPLACE(c.telefone, '[^0-9]', '', 'g') = $2
        )
    `, [empresaId, telefoneLimpo, telefoneLimpo.startsWith('55') ? telefoneLimpo.substring(2) : telefoneLimpo]);

    if (!result) {
      return NextResponse.json({ found: false, ia_ativa: true });
    }

    return NextResponse.json({ found: true, ...result });
  } catch (error) {
    console.error('Erro ao buscar status IA:', error);
    return NextResponse.json({ error: 'Erro ao buscar status' }, { status: 500 });
  }
}
