import { type NextRequest, NextResponse } from 'next/server';

import { queryOne } from '@/lib/db';

/**
 * GET /api/empresas/:id/permitido?telefone=5511999990001
 *
 * Endpoint para uso no N8N:
 *  - Retorna se o número está permitido para receber resposta da I.A.
 *  - Se modo_teste = false  → permite todos (permitido: true)
 *  - Se modo_teste = true   → somente números da lista
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const telefone = searchParams.get('telefone')?.replace(/\D/g, '') ?? '';

  const empresa = await queryOne<{
    modo_teste: boolean;
    numeros_permitidos: string[];
  }>('SELECT modo_teste, numeros_permitidos FROM empresas WHERE id = $1', [id]);

  if (!empresa) {
    return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 });
  }

  const { modo_teste, numeros_permitidos } = empresa;

  // Normaliza os números cadastrados (apenas dígitos) para comparação segura
  const listaLimpa = (numeros_permitidos ?? []).map((n) => n.replace(/\D/g, ''));

  const permitido = !modo_teste || listaLimpa.includes(telefone);

  return NextResponse.json({
    permitido,
    modo_teste,
    numeros_permitidos: listaLimpa,
    telefone_consultado: telefone,
  });
}
