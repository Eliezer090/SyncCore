import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAuthUser, getEmpresaIdParaQuery } from '@/lib/auth/middleware';

// GET /api/relatorios - Dados agregados para relatórios gerenciais
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

    const searchParams = request.nextUrl.searchParams;
    const dataInicio = searchParams.get('data_inicio');
    const dataFim = searchParams.get('data_fim');

    if (!dataInicio || !dataFim) {
      return NextResponse.json({ error: 'Parâmetros data_inicio e data_fim são obrigatórios' }, { status: 400 });
    }

    // ============================================================
    // 1. Agendamentos por profissional (contagem por status)
    // ============================================================
    const agendamentosPorProfissional = await query<{
      profissional_id: number;
      profissional_nome: string;
      status: string;
      total: number;
    }>(
      `SELECT 
        a.usuario_id as profissional_id,
        u.nome as profissional_nome,
        a.status,
        COUNT(*)::int as total
      FROM agendamentos a
      LEFT JOIN usuarios u ON a.usuario_id = u.id
      WHERE a.empresa_id = $1
        AND a.inicio >= $2::date
        AND a.inicio < ($3::date + interval '1 day')
      GROUP BY a.usuario_id, u.nome, a.status
      ORDER BY u.nome, a.status`,
      [empresaId, dataInicio, dataFim]
    );

    // ============================================================
    // 2. Agendamentos diários por profissional (para gráfico de linha)
    // ============================================================
    const agendamentosDiarios = await query<{
      data: string;
      profissional_id: number;
      profissional_nome: string;
      status: string;
      total: number;
    }>(
      `SELECT 
        TO_CHAR(a.inicio, 'YYYY-MM-DD') as data,
        a.usuario_id as profissional_id,
        u.nome as profissional_nome,
        a.status,
        COUNT(*)::int as total
      FROM agendamentos a
      LEFT JOIN usuarios u ON a.usuario_id = u.id
      WHERE a.empresa_id = $1
        AND a.inicio >= $2::date
        AND a.inicio < ($3::date + interval '1 day')
      GROUP BY TO_CHAR(a.inicio, 'YYYY-MM-DD'), a.usuario_id, u.nome, a.status
      ORDER BY data, u.nome`,
      [empresaId, dataInicio, dataFim]
    );

    // ============================================================
    // 3. Resumo geral de agendamentos no período
    // ============================================================
    const resumoAgendamentos = await query<{
      status: string;
      total: number;
    }>(
      `SELECT 
        a.status,
        COUNT(*)::int as total
      FROM agendamentos a
      WHERE a.empresa_id = $1
        AND a.inicio >= $2::date
        AND a.inicio < ($3::date + interval '1 day')
      GROUP BY a.status
      ORDER BY total DESC`,
      [empresaId, dataInicio, dataFim]
    );

    // ============================================================
    // 4. Taxa de cancelamento por profissional
    // ============================================================
    const taxaCancelamento = await query<{
      profissional_id: number;
      profissional_nome: string;
      total_agendamentos: number;
      total_cancelados: number;
      taxa_cancelamento: number;
    }>(
      `SELECT 
        a.usuario_id as profissional_id,
        u.nome as profissional_nome,
        COUNT(*)::int as total_agendamentos,
        COUNT(*) FILTER (WHERE a.status = 'cancelado')::int as total_cancelados,
        ROUND(
          (COUNT(*) FILTER (WHERE a.status = 'cancelado')::numeric / NULLIF(COUNT(*), 0)) * 100, 1
        )::float as taxa_cancelamento
      FROM agendamentos a
      LEFT JOIN usuarios u ON a.usuario_id = u.id
      WHERE a.empresa_id = $1
        AND a.inicio >= $2::date
        AND a.inicio < ($3::date + interval '1 day')
      GROUP BY a.usuario_id, u.nome
      ORDER BY taxa_cancelamento DESC`,
      [empresaId, dataInicio, dataFim]
    );

    // ============================================================
    // 5. Faturamento por profissional (serviços dos agendamentos concluídos)
    // ============================================================
    const faturamentoPorProfissional = await query<{
      profissional_id: number;
      profissional_nome: string;
      total_faturamento: number;
      total_servicos: number;
    }>(
      `SELECT 
        a.usuario_id as profissional_id,
        u.nome as profissional_nome,
        COALESCE(SUM(ags.preco), 0)::float as total_faturamento,
        COUNT(ags.id)::int as total_servicos
      FROM agendamentos a
      LEFT JOIN usuarios u ON a.usuario_id = u.id
      LEFT JOIN agendamento_servicos ags ON a.id = ags.agendamento_id
      WHERE a.empresa_id = $1
        AND a.inicio >= $2::date
        AND a.inicio < ($3::date + interval '1 day')
        AND a.status = 'concluido'
      GROUP BY a.usuario_id, u.nome
      ORDER BY total_faturamento DESC`,
      [empresaId, dataInicio, dataFim]
    );

    // ============================================================
    // 6. Serviços mais realizados no período
    // ============================================================
    const servicosMaisRealizados = await query<{
      servico_id: number;
      servico_nome: string;
      total: number;
      receita_total: number;
    }>(
      `SELECT 
        ags.servico_id,
        s.nome as servico_nome,
        COUNT(*)::int as total,
        COALESCE(SUM(ags.preco), 0)::float as receita_total
      FROM agendamento_servicos ags
      JOIN agendamentos a ON ags.agendamento_id = a.id
      JOIN servicos s ON ags.servico_id = s.id
      WHERE a.empresa_id = $1
        AND a.inicio >= $2::date
        AND a.inicio < ($3::date + interval '1 day')
        AND a.status = 'concluido'
      GROUP BY ags.servico_id, s.nome
      ORDER BY total DESC
      LIMIT 10`,
      [empresaId, dataInicio, dataFim]
    );

    // ============================================================
    // 7. Horários mais movimentados (agendamentos por hora do dia)
    // ============================================================
    const horariosPico = await query<{
      hora: number;
      total: number;
    }>(
      `SELECT 
        EXTRACT(HOUR FROM a.inicio)::int as hora,
        COUNT(*)::int as total
      FROM agendamentos a
      WHERE a.empresa_id = $1
        AND a.inicio >= $2::date
        AND a.inicio < ($3::date + interval '1 day')
      GROUP BY EXTRACT(HOUR FROM a.inicio)
      ORDER BY hora`,
      [empresaId, dataInicio, dataFim]
    );

    // ============================================================
    // 8. Dias da semana mais movimentados
    // ============================================================
    const diasSemana = await query<{
      dia_semana: number;
      dia_nome: string;
      total: number;
    }>(
      `SELECT 
        EXTRACT(DOW FROM a.inicio)::int as dia_semana,
        CASE EXTRACT(DOW FROM a.inicio)::int
          WHEN 0 THEN 'Domingo'
          WHEN 1 THEN 'Segunda'
          WHEN 2 THEN 'Terça'
          WHEN 3 THEN 'Quarta'
          WHEN 4 THEN 'Quinta'
          WHEN 5 THEN 'Sexta'
          WHEN 6 THEN 'Sábado'
        END as dia_nome,
        COUNT(*)::int as total
      FROM agendamentos a
      WHERE a.empresa_id = $1
        AND a.inicio >= $2::date
        AND a.inicio < ($3::date + interval '1 day')
      GROUP BY EXTRACT(DOW FROM a.inicio)
      ORDER BY dia_semana`,
      [empresaId, dataInicio, dataFim]
    );

    // ============================================================
    // 9. Clientes mais frequentes
    // ============================================================
    const clientesFrequentes = await query<{
      cliente_id: number;
      cliente_nome: string;
      cliente_telefone: string;
      total_agendamentos: number;
      total_concluidos: number;
      total_gasto: number;
    }>(
      `SELECT 
        a.cliente_id,
        c.nome as cliente_nome,
        c.telefone as cliente_telefone,
        COUNT(*)::int as total_agendamentos,
        COUNT(*) FILTER (WHERE a.status = 'concluido')::int as total_concluidos,
        COALESCE(SUM(ags.preco) FILTER (WHERE a.status = 'concluido'), 0)::float as total_gasto
      FROM agendamentos a
      LEFT JOIN clientes c ON a.cliente_id = c.id
      LEFT JOIN agendamento_servicos ags ON a.id = ags.agendamento_id
      WHERE a.empresa_id = $1
        AND a.inicio >= $2::date
        AND a.inicio < ($3::date + interval '1 day')
      GROUP BY a.cliente_id, c.nome, c.telefone
      ORDER BY total_agendamentos DESC
      LIMIT 10`,
      [empresaId, dataInicio, dataFim]
    );

    // ============================================================
    // 10. Ticket médio por profissional
    // ============================================================
    const ticketMedio = await query<{
      profissional_id: number;
      profissional_nome: string;
      ticket_medio: number;
      total_atendimentos: number;
    }>(
      `SELECT 
        a.usuario_id as profissional_id,
        u.nome as profissional_nome,
        ROUND(
          COALESCE(SUM(ags.preco), 0)::numeric / NULLIF(COUNT(DISTINCT a.id), 0), 2
        )::float as ticket_medio,
        COUNT(DISTINCT a.id)::int as total_atendimentos
      FROM agendamentos a
      LEFT JOIN usuarios u ON a.usuario_id = u.id
      LEFT JOIN agendamento_servicos ags ON a.id = ags.agendamento_id
      WHERE a.empresa_id = $1
        AND a.inicio >= $2::date
        AND a.inicio < ($3::date + interval '1 day')
        AND a.status = 'concluido'
      GROUP BY a.usuario_id, u.nome
      ORDER BY ticket_medio DESC`,
      [empresaId, dataInicio, dataFim]
    );

    // ============================================================
    // 11. Faturamento diário (para gráfico de linha de receita)
    // ============================================================
    const faturamentoDiario = await query<{
      data: string;
      total_faturamento: number;
      total_agendamentos: number;
    }>(
      `SELECT 
        TO_CHAR(a.inicio, 'YYYY-MM-DD') as data,
        COALESCE(SUM(ags.preco), 0)::float as total_faturamento,
        COUNT(DISTINCT a.id)::int as total_agendamentos
      FROM agendamentos a
      LEFT JOIN agendamento_servicos ags ON a.id = ags.agendamento_id
      WHERE a.empresa_id = $1
        AND a.inicio >= $2::date
        AND a.inicio < ($3::date + interval '1 day')
        AND a.status = 'concluido'
      GROUP BY TO_CHAR(a.inicio, 'YYYY-MM-DD')
      ORDER BY data`,
      [empresaId, dataInicio, dataFim]
    );

    // ============================================================
    // 12. Novos clientes no período
    // ============================================================
    const novosClientes = await query<{
      data: string;
      total: number;
    }>(
      `SELECT 
        TO_CHAR(c.criado_em, 'YYYY-MM-DD') as data,
        COUNT(*)::int as total
      FROM clientes_empresas ce
      JOIN clientes c ON c.id = ce.cliente_id
      WHERE ce.empresa_id = $1
        AND c.criado_em >= $2::date
        AND c.criado_em < ($3::date + interval '1 day')
      GROUP BY TO_CHAR(c.criado_em, 'YYYY-MM-DD')
      ORDER BY data`,
      [empresaId, dataInicio, dataFim]
    );

    return NextResponse.json({
      agendamentosPorProfissional,
      agendamentosDiarios,
      resumoAgendamentos,
      taxaCancelamento,
      faturamentoPorProfissional,
      servicosMaisRealizados,
      horariosPico,
      diasSemana,
      clientesFrequentes,
      ticketMedio,
      faturamentoDiario,
      novosClientes,
    });
  } catch (err) {
    console.error('[Relatórios API] Erro:', err);
    return NextResponse.json({ error: 'Erro interno ao gerar relatórios' }, { status: 500 });
  }
}
