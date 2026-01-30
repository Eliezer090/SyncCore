import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, execute } from '@/lib/db';
import { formatDatabaseError } from '@/lib/db-errors';
import jwt from 'jsonwebtoken';
import type { PapelEmpresa } from '@/types/database';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

interface TokenPayload {
  userId: number;
  empresaId: number | null;
  empresaAtivaId?: number | null;
  email: string;
  papel: string;
}

// GET - Listar papéis customizados da empresa
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
    const empresaIdParam = searchParams.get('empresa_id');
    const incluirSistema = searchParams.get('incluir_sistema') === 'true';

    // Determinar empresa
    const empresaId = empresaIdParam ? parseInt(empresaIdParam) : (decoded.empresaAtivaId || decoded.empresaId);

    // Buscar papéis customizados da empresa
    const papeisCustomizados = empresaId ? await query<PapelEmpresa>(
      `SELECT * FROM papeis_empresa WHERE empresa_id = $1 AND ativo = true ORDER BY nome`,
      [empresaId]
    ) : [];

    // Se solicitado, incluir papéis do sistema
    if (incluirSistema) {
      const papeisSistema = [
        { codigo: 'gerente', nome: 'Gerente', descricao: 'Gerencia a empresa', cor: 'secondary', is_sistema: true },
        { codigo: 'profissional', nome: 'Profissional', descricao: 'Acesso à agenda e clientes', cor: 'success', is_sistema: true },
        { codigo: 'atendente', nome: 'Atendente', descricao: 'Acesso básico para atendimento', cor: 'warning', is_sistema: true },
      ];

      // Admin só vê opção admin se for admin
      if (decoded.papel === 'admin') {
        papeisSistema.unshift({ codigo: 'admin', nome: 'Administrador', descricao: 'Acesso total', cor: 'primary', is_sistema: true });
      }

      return NextResponse.json({ 
        papeis: papeisSistema,
        papeisCustomizados: papeisCustomizados.map(p => ({ ...p, is_sistema: false }))
      });
    }

    return NextResponse.json({ papeis: papeisCustomizados });
  } catch (error) {
    console.error('Erro ao buscar papéis:', error);
    return NextResponse.json({ error: formatDatabaseError(error) }, { status: 500 });
  }
}

// POST - Criar novo papel customizado
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

    // Apenas admin e gerente podem criar papéis
    if (!['admin', 'gerente'].includes(decoded.papel)) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const body = await request.json();
    const { codigo, nome, descricao, cor, empresa_id, papel_base } = body;

    if (!codigo || !nome) {
      return NextResponse.json({ error: 'Código e nome são obrigatórios' }, { status: 400 });
    }

    // Determinar empresa
    const empresaId = decoded.papel === 'admin' ? empresa_id : (decoded.empresaAtivaId || decoded.empresaId);

    if (!empresaId) {
      return NextResponse.json({ error: 'Empresa não identificada' }, { status: 400 });
    }

    // Verificar se código já existe na empresa
    const existente = await queryOne(
      `SELECT id FROM papeis_empresa WHERE empresa_id = $1 AND codigo = $2`,
      [empresaId, codigo]
    );

    if (existente) {
      return NextResponse.json({ error: 'Já existe um papel com este código nesta empresa' }, { status: 400 });
    }

    // Criar papel
    const result = await queryOne<PapelEmpresa>(
      `INSERT INTO papeis_empresa (empresa_id, codigo, nome, descricao, cor)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [empresaId, codigo, nome, descricao || null, cor || 'default']
    );

    if (result) {
      // Criar permissões para o novo papel baseado em um papel existente
      const papelBase = papel_base || 'atendente';
      await execute('SELECT criar_permissoes_papel_customizado($1, $2)', [result.id, papelBase]);
    }

    return NextResponse.json({ papel: result, message: 'Papel criado com sucesso' }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar papel:', error);
    return NextResponse.json({ error: formatDatabaseError(error) }, { status: 500 });
  }
}

// PUT - Atualizar papel customizado
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

    if (!['admin', 'gerente'].includes(decoded.papel)) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const body = await request.json();
    const { id, nome, descricao, cor, ativo } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });
    }

    // Verificar se papel existe e pertence à empresa do usuário
    const papel = await queryOne<PapelEmpresa>('SELECT * FROM papeis_empresa WHERE id = $1', [id]);

    if (!papel) {
      return NextResponse.json({ error: 'Papel não encontrado' }, { status: 404 });
    }

    // Gerente só pode editar papéis da sua empresa
    if (decoded.papel === 'gerente') {
      const empresaAtiva = decoded.empresaAtivaId || decoded.empresaId;
      if (papel.empresa_id !== empresaAtiva) {
        return NextResponse.json({ error: 'Você só pode editar papéis da sua empresa' }, { status: 403 });
      }
    }

    // Atualizar
    const result = await queryOne<PapelEmpresa>(
      `UPDATE papeis_empresa 
       SET nome = COALESCE($2, nome),
           descricao = COALESCE($3, descricao),
           cor = COALESCE($4, cor),
           ativo = COALESCE($5, ativo),
           atualizado_em = NOW()
       WHERE id = $1
       RETURNING *`,
      [id, nome, descricao, cor, ativo]
    );

    return NextResponse.json({ papel: result, message: 'Papel atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar papel:', error);
    return NextResponse.json({ error: formatDatabaseError(error) }, { status: 500 });
  }
}

// DELETE - Excluir papel customizado
export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });
    }

    // Verificar se papel existe
    const papel = await queryOne<PapelEmpresa>('SELECT * FROM papeis_empresa WHERE id = $1', [id]);

    if (!papel) {
      return NextResponse.json({ error: 'Papel não encontrado' }, { status: 404 });
    }

    // Gerente só pode excluir papéis da sua empresa
    if (decoded.papel === 'gerente') {
      const empresaAtiva = decoded.empresaAtivaId || decoded.empresaId;
      if (papel.empresa_id !== empresaAtiva) {
        return NextResponse.json({ error: 'Você só pode excluir papéis da sua empresa' }, { status: 403 });
      }
    }

    // Verificar se há usuários usando este papel
    const usuariosUsando = await queryOne<{ count: number }>(
      'SELECT COUNT(*) as count FROM usuarios WHERE papel_empresa_id = $1',
      [id]
    );

    if (usuariosUsando && usuariosUsando.count > 0) {
      return NextResponse.json({ 
        error: `Este papel está sendo usado por ${usuariosUsando.count} usuário(s). Altere o papel deles antes de excluir.` 
      }, { status: 400 });
    }

    // Excluir (as permissões serão excluídas em cascata)
    await execute('DELETE FROM papeis_empresa WHERE id = $1', [id]);

    return NextResponse.json({ message: 'Papel excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir papel:', error);
    return NextResponse.json({ error: formatDatabaseError(error) }, { status: 500 });
  }
}
