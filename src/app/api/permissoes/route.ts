import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, execute } from '@/lib/db';
import { formatDatabaseError } from '@/lib/db-errors';
import jwt from 'jsonwebtoken';
import type { PermissaoCompleta } from '@/types/database';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

interface TokenPayload {
  userId: number;
  empresaId: number | null;
  empresaAtivaId?: number | null;
  email: string;
  papel: string;
  papelEmpresaId?: number | null;
}

// GET - Listar permissões
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    let decoded: TokenPayload;
    
    try {
      decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    } catch {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const papel = searchParams.get('papel');
    const papelEmpresaId = searchParams.get('papel_empresa_id');
    const empresaIdParam = searchParams.get('empresa_id');
    const recurso = searchParams.get('recurso');
    const apenasVisualizaveis = searchParams.get('apenasVisualizaveis') === 'true';

    // Determinar empresa ativa
    const empresaAtiva = decoded.empresaAtivaId || decoded.empresaId;

    // Se pediu permissões de um papel customizado específico
    if (papelEmpresaId) {
      const perms = await query<PermissaoCompleta>(
        `SELECT * FROM vw_permissoes_completas 
         WHERE papel_empresa_id = $1
         ${apenasVisualizaveis ? 'AND pode_visualizar = true' : ''}
         ORDER BY ordem`,
        [parseInt(papelEmpresaId)]
      );
      return NextResponse.json({ permissoes: perms });
    }

    // Se pediu permissões de um papel do sistema específico
    if (papel) {
      // Verificar se tem permissões específicas da empresa
      const empId = empresaIdParam ? parseInt(empresaIdParam) : empresaAtiva;
      
      // Usar a função get_permissoes_usuario que considera hierarquia
      const permissoes = await query<PermissaoCompleta>(
        `SELECT * FROM get_permissoes_usuario($1, $2, NULL)
         ${apenasVisualizaveis ? 'WHERE pode_visualizar = true' : ''}
         ORDER BY ordem`,
        [papel, empId]
      );

      return NextResponse.json({ permissoes });
    }

    // Se pediu permissão de um recurso específico para o usuário atual
    if (recurso) {
      // Usar a função get_permissoes_usuario que considera hierarquia
      // (papel customizado, específico da empresa, ou global)
      const permissao = await queryOne<PermissaoCompleta>(
        `SELECT * FROM get_permissoes_usuario($1, $2, $3) WHERE recurso_codigo = $4`,
        [decoded.papel, empresaAtiva, decoded.papelEmpresaId, recurso]
      );
      
      return NextResponse.json({ permissao });
    }

    // Retornar todas as permissões - admin e gerente podem ver
    if (!['admin', 'gerente'].includes(decoded.papel)) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    // Admin vê tudo, gerente vê apenas da sua empresa
    let permissoes: PermissaoCompleta[];
    
    if (decoded.papel === 'admin') {
      // Admin vê permissões globais e de todas empresas
      permissoes = await query<PermissaoCompleta>(
        `SELECT * FROM vw_permissoes_completas 
         WHERE empresa_id IS NULL
         ORDER BY COALESCE(papel, papel_customizado_codigo), ordem`
      );
    } else {
      // Gerente vê apenas da sua empresa
      if (!empresaAtiva) {
        return NextResponse.json({ error: 'Empresa não identificada' }, { status: 400 });
      }

      permissoes = await query<PermissaoCompleta>(
        `SELECT * FROM vw_permissoes_completas 
         WHERE empresa_id = $1 OR (empresa_id IS NULL AND papel_empresa_id IS NULL)
         ORDER BY COALESCE(papel, papel_customizado_codigo), ordem`,
        [empresaAtiva]
      );
    }

    // Agrupar por papel
    const porPapel = permissoes.reduce((acc, p) => {
      const key = p.papel_customizado_nome || p.papel || 'Sem papel';
      if (!acc[key]) acc[key] = [];
      acc[key].push(p);
      return acc;
    }, {} as Record<string, PermissaoCompleta[]>);

    return NextResponse.json({ permissoes, porPapel });
  } catch (error) {
    console.error('Erro ao buscar permissões:', error);
    return NextResponse.json({ error: formatDatabaseError(error) }, { status: 500 });
  }
}

// PUT - Atualizar permissões
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    let decoded: TokenPayload;
    
    try {
      decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    } catch {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    // Admin e gerente podem alterar permissões
    if (!['admin', 'gerente'].includes(decoded.papel)) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const body = await request.json();
    const { papel, papel_empresa_id, empresa_id, permissoes } = body as {
      papel?: string;
      papel_empresa_id?: number;
      empresa_id?: number;
      permissoes: Array<{
        recurso_id: number;
        pode_visualizar: boolean;
        pode_criar: boolean;
        pode_editar: boolean;
        pode_excluir: boolean;
      }>;
    };

    if (!permissoes || !Array.isArray(permissoes)) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
    }

    const empresaAtiva = decoded.empresaAtivaId || decoded.empresaId;

    // Admin não pode alterar suas próprias permissões
    if (papel === 'admin') {
      return NextResponse.json({ error: 'Não é possível alterar permissões do admin' }, { status: 400 });
    }

    // Gerente só pode alterar permissões da sua empresa
    if (decoded.papel === 'gerente') {
      if (!empresaAtiva) {
        return NextResponse.json({ error: 'Empresa não identificada' }, { status: 400 });
      }

      // Verificar se está tentando alterar permissões de outra empresa
      if (empresa_id && empresa_id !== empresaAtiva) {
        return NextResponse.json({ error: 'Você só pode alterar permissões da sua empresa' }, { status: 403 });
      }
    }

    // Determinar qual empresa usar
    const targetEmpresaId = decoded.papel === 'admin' ? (empresa_id || null) : empresaAtiva;

    // Atualizar cada permissão
    for (const perm of permissoes) {
      if (papel_empresa_id) {
        // Atualizar permissão de papel customizado
        await execute(
          `UPDATE permissoes 
           SET pode_visualizar = $1, pode_criar = $2, pode_editar = $3, pode_excluir = $4, atualizado_em = NOW()
           WHERE papel_empresa_id = $5 AND recurso_id = $6`,
          [perm.pode_visualizar, perm.pode_criar, perm.pode_editar, perm.pode_excluir, papel_empresa_id, perm.recurso_id]
        );
      } else if (papel) {
        // Para papéis do sistema, criar ou atualizar permissão específica da empresa
        if (targetEmpresaId) {
          // Verificar se já existe permissão para esta empresa
          const existente = await queryOne(
            `SELECT id FROM permissoes WHERE papel = $1 AND recurso_id = $2 AND empresa_id = $3 AND papel_empresa_id IS NULL`,
            [papel, perm.recurso_id, targetEmpresaId]
          );

          if (existente) {
            await execute(
              `UPDATE permissoes 
               SET pode_visualizar = $1, pode_criar = $2, pode_editar = $3, pode_excluir = $4, atualizado_em = NOW()
               WHERE papel = $5 AND recurso_id = $6 AND empresa_id = $7 AND papel_empresa_id IS NULL`,
              [perm.pode_visualizar, perm.pode_criar, perm.pode_editar, perm.pode_excluir, papel, perm.recurso_id, targetEmpresaId]
            );
          } else {
            await execute(
              `INSERT INTO permissoes (papel, recurso_id, empresa_id, pode_visualizar, pode_criar, pode_editar, pode_excluir)
               VALUES ($1, $2, $3, $4, $5, $6, $7)`,
              [papel, perm.recurso_id, targetEmpresaId, perm.pode_visualizar, perm.pode_criar, perm.pode_editar, perm.pode_excluir]
            );
          }
        } else {
          // Admin editando permissões globais
          await execute(
            `UPDATE permissoes 
             SET pode_visualizar = $1, pode_criar = $2, pode_editar = $3, pode_excluir = $4, atualizado_em = NOW()
             WHERE papel = $5 AND recurso_id = $6 AND empresa_id IS NULL AND papel_empresa_id IS NULL`,
            [perm.pode_visualizar, perm.pode_criar, perm.pode_editar, perm.pode_excluir, papel, perm.recurso_id]
          );
        }
      }
    }

    return NextResponse.json({ message: 'Permissões atualizadas com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar permissões:', error);
    return NextResponse.json({ error: formatDatabaseError(error) }, { status: 500 });
  }
}

// POST - Resetar permissões ou copiar para empresa
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    let decoded: TokenPayload;
    
    try {
      decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    } catch {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    if (!['admin', 'gerente'].includes(decoded.papel)) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const body = await request.json();
    const { acao, papel, papel_empresa_id, empresa_id } = body;

    if (acao === 'resetar') {
      // Resetar permissões para o padrão
      if (papel_empresa_id) {
        // Resetar papel customizado baseado no atendente
        await execute('SELECT criar_permissoes_papel_customizado($1, $2)', [papel_empresa_id, 'atendente']);
      } else if (papel && empresa_id) {
        // Deletar permissões específicas da empresa para usar as globais
        await execute(
          'DELETE FROM permissoes WHERE papel = $1 AND empresa_id = $2 AND papel_empresa_id IS NULL',
          [papel, empresa_id]
        );
      }

      return NextResponse.json({ message: 'Permissões resetadas' });
    }

    if (acao === 'copiar_para_empresa') {
      // Copiar permissões globais de um papel para uma empresa
      if (!papel || !empresa_id) {
        return NextResponse.json({ error: 'Papel e empresa são obrigatórios' }, { status: 400 });
      }

      await execute('SELECT copiar_permissoes_para_empresa($1, $2)', [empresa_id, papel]);
      return NextResponse.json({ message: 'Permissões copiadas para a empresa' });
    }

    return NextResponse.json({ error: 'Ação não reconhecida' }, { status: 400 });
  } catch (error) {
    console.error('Erro:', error);
    return NextResponse.json({ error: formatDatabaseError(error) }, { status: 500 });
  }
}
