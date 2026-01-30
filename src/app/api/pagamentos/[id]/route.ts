import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute } from '@/lib/db';
import { deleteImageByUrl } from '@/lib/imagekit';
import type { Pagamento } from '@/types/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const pagamento = await queryOne<Pagamento>(`
      SELECT pg.*, p.id as pedido_numero
      FROM pagamentos pg
      LEFT JOIN pedidos p ON pg.pedido_id = p.id
      WHERE pg.id = $1
    `, [id]);

    if (!pagamento) {
      return NextResponse.json({ error: 'Pagamento não encontrado' }, { status: 404 });
    }

    return NextResponse.json(pagamento);
  } catch (error) {
    console.error('Erro ao buscar pagamento:', error);
    return NextResponse.json({ error: 'Erro ao buscar pagamento' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { pedido_id, metodo, valor, status, pago_em, url_comprovante } = body;

    // Busca o pagamento atual para verificar se o comprovante mudou
    const pagamentoAtual = await queryOne<Pagamento>('SELECT url_comprovante FROM pagamentos WHERE id = $1', [id]);
    
    // Se o comprovante mudou e havia um anterior, deletar do ImageKit
    if (pagamentoAtual?.url_comprovante && pagamentoAtual.url_comprovante !== url_comprovante) {
      await deleteImageByUrl(pagamentoAtual.url_comprovante);
    }

    const sql = `
      UPDATE pagamentos SET
        pedido_id = $1, metodo = $2, valor = $3, status = $4, pago_em = $5, url_comprovante = $6
      WHERE id = $7
      RETURNING *
    `;
    const sqlParams = [pedido_id, metodo, valor, status, pago_em, url_comprovante, id];

    const result = await queryOne<Pagamento>(sql, sqlParams);

    if (!result) {
      return NextResponse.json({ error: 'Pagamento não encontrado' }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro ao atualizar pagamento:', error);
    return NextResponse.json({ error: 'Erro ao atualizar pagamento' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Busca o pagamento para deletar o comprovante do ImageKit
    const pagamento = await queryOne<Pagamento>('SELECT url_comprovante FROM pagamentos WHERE id = $1', [id]);
    
    // Deleta o comprovante do ImageKit se existir
    if (pagamento?.url_comprovante) {
      await deleteImageByUrl(pagamento.url_comprovante);
    }
    
    const rowCount = await execute('DELETE FROM pagamentos WHERE id = $1', [id]);

    if (rowCount === 0) {
      return NextResponse.json({ error: 'Pagamento não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Pagamento excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir pagamento:', error);
    return NextResponse.json({ error: 'Erro ao excluir pagamento' }, { status: 500 });
  }
}
