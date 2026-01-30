import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { getAuthUser } from '@/lib/auth/middleware';
import dayjs from 'dayjs';

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

    // Agora o ID do profissional é o próprio ID do usuário
    const usuarioId = user.userId;
    const hoje = dayjs().format('YYYY-MM-DD');
    const inicioMes = dayjs().startOf('month').format('YYYY-MM-DD');
    const fimMes = dayjs().endOf('month').format('YYYY-MM-DD');

    // 1. Agendamentos de hoje
    const agendamentosHojeResult = await query<{ count: number }>(
      `SELECT COUNT(*) as count FROM agendamentos 
       WHERE usuario_id = $1 
       AND DATE(inicio) = $2
       AND status != 'cancelado'`,
      [usuarioId, hoje]
    );

    const agendamentosHoje = parseInt(agendamentosHojeResult[0]?.count?.toString() || '0');

    // 2. Agendamentos deste mês
    const agendamentosEsteMesResult = await query<{ count: number }>(
      `SELECT COUNT(*) as count FROM agendamentos 
       WHERE usuario_id = $1 
       AND DATE(inicio) >= $2 
       AND DATE(inicio) <= $3
       AND status != 'cancelado'`,
      [usuarioId, inicioMes, fimMes]
    );

    const agendamentosEsteMes = parseInt(agendamentosEsteMesResult[0]?.count?.toString() || '0');

    // 3. Agendamentos concluídos este mês
    const agendamentosConcluidosResult = await query<{ count: number }>(
      `SELECT COUNT(*) as count FROM agendamentos 
       WHERE usuario_id = $1 
       AND DATE(inicio) >= $2 
       AND DATE(inicio) <= $3
       AND status = 'concluido'`,
      [usuarioId, inicioMes, fimMes]
    );

    const agendamentosConcluidosEsteMes = parseInt(agendamentosConcluidosResult[0]?.count?.toString() || '0');

    // 4. Serviços mais realizados este mês
    const servicosMaisRealizados = await query<{ nome: string; quantidade: number }>(
      `SELECT s.nome, COUNT(DISTINCT a.id) as quantidade
       FROM agendamentos a
       JOIN agendamento_servicos ags ON a.id = ags.agendamento_id
       JOIN servicos s ON ags.servico_id = s.id
       WHERE a.usuario_id = $1 
       AND DATE(a.inicio) >= $2 
       AND DATE(a.inicio) <= $3
       AND a.status = 'concluido'
       GROUP BY s.id, s.nome
       ORDER BY quantidade DESC
       LIMIT 5`,
      [usuarioId, inicioMes, fimMes]
    );

    // 5. Próximos agendamentos (hoje em diante)
    const proximosAgendamentos = await query<{
      id: number;
      cliente_nome: string;
      inicio: string;
      fim: string;
      servico_nome: string;
      status: string;
    }>(
      `SELECT 
        a.id,
        c.nome as cliente_nome,
        a.inicio,
        a.fim,
        STRING_AGG(s.nome, ', ') as servico_nome,
        a.status
       FROM agendamentos a
       JOIN clientes c ON a.cliente_id = c.id
       LEFT JOIN agendamento_servicos ags ON a.id = ags.agendamento_id
       LEFT JOIN servicos s ON ags.servico_id = s.id
       WHERE a.usuario_id = $1 
       AND DATE(a.inicio) = $2
       AND a.status != 'cancelado'
       GROUP BY a.id, c.nome, a.inicio, a.fim, a.status
       ORDER BY a.inicio ASC`,
      [usuarioId, hoje]
    );

    return NextResponse.json({
      agendamentosHoje,
      agendamentosEsteMes,
      agendamentosConcluidosEsteMes,
      servicosMaisRealizados: servicosMaisRealizados.map(s => ({
        nome: s.nome,
        quantidade: parseInt(s.quantidade?.toString() || '0'),
      })),
      agendamentosHojeDetalhes: proximosAgendamentos,
    });
  } catch (error) {
    console.error('Erro ao buscar métricas do profissional:', error);
    return NextResponse.json({ error: 'Erro ao buscar métricas' }, { status: 500 });
  }
}
