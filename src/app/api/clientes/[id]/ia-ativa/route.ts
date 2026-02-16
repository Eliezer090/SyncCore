import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { getAuthUser, getEmpresaIdParaQuery } from '@/lib/auth/middleware';

interface IaAtivaResult {
  ia_ativa: boolean;
  cliente_id: number;
  empresa_id: number;
  cliente_nome: string | null;
  cliente_telefone: string;
}

// GET - Verificar status da ia_ativa para um cliente
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: error || 'Não autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const clienteId = parseInt(id);
    const empresaIdFiltro = getEmpresaIdParaQuery(user);

    if (!empresaIdFiltro) {
      return NextResponse.json({ error: 'Empresa não identificada' }, { status: 400 });
    }

    const result = await queryOne<IaAtivaResult>(`
      SELECT 
        ce.ia_ativa,
        ce.cliente_id,
        ce.empresa_id,
        c.nome as cliente_nome,
        c.telefone as cliente_telefone
      FROM clientes_empresas ce
      JOIN clientes c ON c.id = ce.cliente_id
      WHERE ce.cliente_id = $1 AND ce.empresa_id = $2
    `, [clienteId, empresaIdFiltro]);

    if (!result) {
      return NextResponse.json({ error: 'Vínculo cliente-empresa não encontrado' }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro ao buscar status ia_ativa:', error);
    return NextResponse.json({ error: 'Erro ao buscar status' }, { status: 500 });
  }
}

// PATCH - Alternar ia_ativa (ativar/desativar IA para o cliente)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: error || 'Não autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const clienteId = parseInt(id);
    const empresaIdFiltro = getEmpresaIdParaQuery(user);

    if (!empresaIdFiltro) {
      return NextResponse.json({ error: 'Empresa não identificada' }, { status: 400 });
    }

    const body = await request.json();
    const { ia_ativa } = body;

    if (typeof ia_ativa !== 'boolean') {
      return NextResponse.json({ error: 'Campo ia_ativa deve ser boolean' }, { status: 400 });
    }

    const result = await query<IaAtivaResult>(`
      UPDATE clientes_empresas 
      SET ia_ativa = $1
      WHERE cliente_id = $2 AND empresa_id = $3
      RETURNING ia_ativa, cliente_id, empresa_id
    `, [ia_ativa, clienteId, empresaIdFiltro]);

    if (result.length === 0) {
      return NextResponse.json({ error: 'Vínculo cliente-empresa não encontrado' }, { status: 404 });
    }

    const action = ia_ativa ? 'ativada' : 'desativada';
    console.log(`[IA Toggle] IA ${action} para cliente ${clienteId} na empresa ${empresaIdFiltro}`);

    return NextResponse.json({
      ...result[0],
      message: `IA ${action} com sucesso para este cliente`,
    });
  } catch (error) {
    console.error('Erro ao atualizar ia_ativa:', error);
    return NextResponse.json({ error: 'Erro ao atualizar status' }, { status: 500 });
  }
}
