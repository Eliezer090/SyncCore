import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { Notificacao } from '@/types/database';
import { getAuthUser } from '@/lib/auth/middleware';

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const { user, error } = getAuthUser(request);
    if (!user || error) {
      return NextResponse.json({ error: error || 'Não autorizado' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const empresaId = searchParams.get('empresa_id') || (user.empresaId ? String(user.empresaId) : null);
    const apenasNaoLidas = searchParams.get('apenas_nao_lidas') === 'true';
    const page = parseInt(searchParams.get('page') || '0');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = page * limit;

    // Construir query
    let whereClause = '';
    const params: (string | number | boolean)[] = [];
    let paramIndex = 1;

    // Filtrar por empresa (obrigatório para não-admin)
    if (empresaId) {
      whereClause = `WHERE n.empresa_id = $${paramIndex}`;
      params.push(empresaId);
      paramIndex++;
    }

    // Filtrar apenas não lidas
    if (apenasNaoLidas) {
      whereClause += whereClause ? ' AND' : 'WHERE';
      whereClause += ` n.lida = false`;
    }

    // Contar total
    const countResult = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM notificacoes n ${whereClause}`,
      params
    );
    const total = parseInt(countResult[0].count);

    // Buscar notificações com JOINs
    const data = await query<Notificacao>(`
      SELECT 
        n.*,
        c.nome as cliente_nome,
        c.telefone as cliente_telefone,
        e.nome as empresa_nome
      FROM notificacoes n
      LEFT JOIN clientes c ON n.cliente_id = c.id
      LEFT JOIN empresas e ON n.empresa_id = e.id
      ${whereClause}
      ORDER BY n.criada_em DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, [...params, limit, offset]);

    // Contar não lidas
    const naoLidasParams = empresaId ? [empresaId] : [];
    const naoLidasWhere = empresaId ? 'WHERE empresa_id = $1 AND lida = false' : 'WHERE lida = false';
    const naoLidasResult = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM notificacoes ${naoLidasWhere}`,
      naoLidasParams
    );
    const naoLidas = parseInt(naoLidasResult[0].count);

    return NextResponse.json({ data, total, naoLidas, page, limit });
  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    return NextResponse.json({ error: 'Erro ao buscar notificações' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { empresa_id, cliente_id, tipo = 'atendimento_humano', mensagem } = body;

    if (!empresa_id || !cliente_id) {
      return NextResponse.json({ error: 'empresa_id e cliente_id são obrigatórios' }, { status: 400 });
    }

    // Buscar nome do cliente para a mensagem
    const clienteResult = await query<{ nome: string; telefone: string }>(
      'SELECT nome, telefone FROM clientes WHERE id = $1',
      [cliente_id]
    );
    const cliente = clienteResult[0];
    const nomeCliente = cliente?.nome || cliente?.telefone || `Cliente #${cliente_id}`;

    // Montar mensagem padrão se não fornecida
    const mensagemFinal = mensagem || `${nomeCliente} está solicitando atendimento humano`;

    const result = await query<Notificacao>(`
      INSERT INTO notificacoes (empresa_id, cliente_id, tipo, mensagem, lida)
      VALUES ($1, $2, $3, $4, false)
      RETURNING *
    `, [empresa_id, cliente_id, tipo, mensagemFinal]);

    // Buscar dados completos com JOINs
    const notificacaoCompleta = await query<Notificacao>(`
      SELECT 
        n.*,
        c.nome as cliente_nome,
        c.telefone as cliente_telefone,
        e.nome as empresa_nome
      FROM notificacoes n
      LEFT JOIN clientes c ON n.cliente_id = c.id
      LEFT JOIN empresas e ON n.empresa_id = e.id
      WHERE n.id = $1
    `, [result[0].id]);

    return NextResponse.json(notificacaoCompleta[0], { status: 201 });
  } catch (error) {
    console.error('Erro ao criar notificação:', error);
    return NextResponse.json({ error: 'Erro ao criar notificação' }, { status: 500 });
  }
}
