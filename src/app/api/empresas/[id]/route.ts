import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute } from '@/lib/db';
import { formatDatabaseError } from '@/lib/db-errors';
import { deleteImageByUrl } from '@/lib/imagekit';
import type { Empresa } from '@/types/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const empresa = await queryOne<Empresa>('SELECT * FROM empresas WHERE id = $1', [id]);

    if (!empresa) {
      return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 });
    }

    return NextResponse.json(empresa);
  } catch (error) {
    console.error('Erro ao buscar empresa:', error);
    return NextResponse.json({ error: formatDatabaseError(error) }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { nome, tipo_negocio, ativo, whatsapp_vinculado, nome_agente, modelo_negocio, oferece_delivery, taxa_entrega_padrao, valor_minimo_entrega_gratis, tempo_cancelamento_minutos, url_logo, descricao_negocio } = body;

    // Converter strings vazias para null (evita erro de unique constraint)
    const whatsappNormalizado = whatsapp_vinculado?.trim() || null;
    const nomeAgenteNormalizado = nome_agente?.trim() || null;

    // Busca a empresa atual para verificar se a imagem mudou
    const empresaAtual = await queryOne<Empresa>('SELECT url_logo FROM empresas WHERE id = $1', [id]);
    
    // Se a imagem mudou e havia uma imagem anterior, deletar do ImageKit
    if (empresaAtual?.url_logo && empresaAtual.url_logo !== url_logo) {
      await deleteImageByUrl(empresaAtual.url_logo);
    }

    const sql = `
      UPDATE empresas SET
        nome = $1,
        tipo_negocio = $2,
        ativo = $3,
        whatsapp_vinculado = $4,
        nome_agente = $5,
        modelo_negocio = $6,
        oferece_delivery = $7,
        taxa_entrega_padrao = $8,
        valor_minimo_entrega_gratis = $9,
        tempo_cancelamento_minutos = $10,
        url_logo = $11,
        descricao_negocio = $12
      WHERE id = $13
      RETURNING *
    `;
    const sqlParams = [nome, tipo_negocio, ativo, whatsappNormalizado, nomeAgenteNormalizado, modelo_negocio, oferece_delivery, taxa_entrega_padrao, valor_minimo_entrega_gratis, tempo_cancelamento_minutos, url_logo, descricao_negocio, id];

    const result = await queryOne<Empresa>(sql, sqlParams);

    if (!result) {
      return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro ao atualizar empresa:', error);
    return NextResponse.json({ error: formatDatabaseError(error) }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Busca a empresa para deletar a imagem do ImageKit
    const empresa = await queryOne<Empresa>('SELECT url_logo FROM empresas WHERE id = $1', [id]);
    
    // Deleta a imagem do ImageKit se existir
    if (empresa?.url_logo) {
      await deleteImageByUrl(empresa.url_logo);
    }
    
    const rowCount = await execute('DELETE FROM empresas WHERE id = $1', [id]);

    if (rowCount === 0) {
      return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Empresa excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir empresa:', error);
    return NextResponse.json({ error: formatDatabaseError(error) }, { status: 500 });
  }
}
