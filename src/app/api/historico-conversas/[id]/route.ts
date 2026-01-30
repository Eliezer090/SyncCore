import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute } from '@/lib/db';
import type { HistoricoConversa } from '@/types/database';
import { getAuthUser, getEmpresaIdParaQuery } from '@/lib/auth/middleware';

// DDL: id, session_id, message (jsonb), empresa_id
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Verificar autenticação
    const { user, error } = getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: error || 'Não autorizado' }, { status: 401 });
    }

    const empresaIdFiltro = getEmpresaIdParaQuery(user);

    const { id } = await params;
    
    let sql = 'SELECT * FROM historico_conversas WHERE id = $1';
    const params_query: (string | number)[] = [id];
    
    if (empresaIdFiltro !== null) {
      sql += ' AND empresa_id = $2';
      params_query.push(empresaIdFiltro);
    }
    
    const historico = await queryOne<HistoricoConversa>(sql, params_query);

    if (!historico) {
      return NextResponse.json({ error: 'Histórico não encontrado' }, { status: 404 });
    }
    return NextResponse.json(historico);
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    return NextResponse.json({ error: 'Erro ao buscar histórico' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Verificar autenticação
    const { user, error } = getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: error || 'Não autorizado' }, { status: 401 });
    }

    const empresaIdFiltro = getEmpresaIdParaQuery(user);

    const { id } = await params;
    const body = await request.json();
    const { session_id, message } = body;

    let sql = `
      UPDATE historico_conversas SET session_id = $1, message = $2
      WHERE id = $3`;
    const params_query: (string | number)[] = [session_id, JSON.stringify(message), id];
    
    if (empresaIdFiltro !== null) {
      sql += ' AND empresa_id = $4';
      params_query.push(empresaIdFiltro);
    }
    
    sql += ' RETURNING *';

    const result = await queryOne<HistoricoConversa>(sql, params_query);

    if (!result) {
      return NextResponse.json({ error: 'Histórico não encontrado' }, { status: 404 });
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro ao atualizar histórico:', error);
    return NextResponse.json({ error: 'Erro ao atualizar histórico' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Verificar autenticação
    const { user, error } = getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: error || 'Não autorizado' }, { status: 401 });
    }

    const empresaIdFiltro = getEmpresaIdParaQuery(user);

    const { id } = await params;
    
    let sql = 'DELETE FROM historico_conversas WHERE id = $1';
    const params_query: (string | number)[] = [id];
    
    if (empresaIdFiltro !== null) {
      sql += ' AND empresa_id = $2';
      params_query.push(empresaIdFiltro);
    }
    
    const rowCount = await execute(sql, params_query);

    if (rowCount === 0) {
      return NextResponse.json({ error: 'Histórico não encontrado' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Histórico excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir histórico:', error);
    return NextResponse.json({ error: 'Erro ao excluir histórico' }, { status: 500 });
  }
}
