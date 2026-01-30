import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute } from '@/lib/db';
import type { Endereco } from '@/types/database';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const endereco = await queryOne<Endereco & { cliente_nome?: string; empresa_nome?: string }>(`
      SELECT e.*, c.nome as cliente_nome, emp.nome as empresa_nome
      FROM enderecos e
      LEFT JOIN clientes c ON e.cliente_id = c.id
      LEFT JOIN empresas emp ON e.empresa_id = emp.id
      WHERE e.id = $1
    `, [id]);

    if (!endereco) {
      return NextResponse.json({ error: 'Endereço não encontrado' }, { status: 404 });
    }
    return NextResponse.json(endereco);
  } catch (error) {
    console.error('Erro ao buscar endereço:', error);
    return NextResponse.json({ error: 'Erro ao buscar endereço' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { cliente_id, empresa_id, logradouro, numero, bairro, cidade, cep, referencia, tipo } = body;

    const result = await queryOne<Endereco>(`
      UPDATE enderecos SET 
        cliente_id = $1, empresa_id = $2, logradouro = $3, numero = $4, bairro = $5, 
        cidade = $6, cep = $7, referencia = $8, tipo = $9
      WHERE id = $10 RETURNING *
    `, [cliente_id || null, empresa_id || null, logradouro, numero || null, bairro || null, cidade || null, cep || null, referencia || null, tipo || 'residencial', id]);

    if (!result) {
      return NextResponse.json({ error: 'Endereço não encontrado' }, { status: 404 });
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro ao atualizar endereço:', error);
    return NextResponse.json({ error: 'Erro ao atualizar endereço' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const rowCount = await execute('DELETE FROM enderecos WHERE id = $1', [id]);

    if (rowCount === 0) {
      return NextResponse.json({ error: 'Endereço não encontrado' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Endereço excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir endereço:', error);
    return NextResponse.json({ error: 'Erro ao excluir endereço' }, { status: 500 });
  }
}
