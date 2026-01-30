import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import { formatDatabaseError } from '@/lib/db-errors';
import { getAuthUser } from '@/lib/auth/middleware';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// POST - Cria empresa e vincula ao usuário atual (para novos usuários sem empresa)
export async function POST(request: NextRequest) {
  try {
    const { user, error } = getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: error || 'Não autorizado' }, { status: 401 });
    }

    // Verificar se usuário já tem empresa
    const usuarioAtual = await queryOne<{ empresa_id: number | null }>(
      'SELECT empresa_id FROM usuarios WHERE id = $1',
      [user.userId]
    );

    if (usuarioAtual?.empresa_id) {
      return NextResponse.json(
        { error: 'Você já possui uma empresa vinculada' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { 
      nome, 
      tipo_negocio, 
      modelo_negocio = 'ambos', 
      whatsapp_vinculado,
      nome_agente,
      descricao_negocio,
      oferece_delivery = false,
      taxa_entrega_padrao = 0,
      valor_minimo_entrega_gratis,
      tempo_cancelamento_minutos = 60,
      url_logo
    } = body;

    if (!nome) {
      return NextResponse.json(
        { error: 'Nome da empresa é obrigatório' },
        { status: 400 }
      );
    }

    // Criar empresa
    const novaEmpresa = await queryOne<{
      id: number;
      nome: string;
      url_logo: string | null;
      modelo_negocio: string;
    }>(
      `INSERT INTO empresas (
        nome, tipo_negocio, ativo, whatsapp_vinculado, nome_agente, 
        modelo_negocio, oferece_delivery, taxa_entrega_padrao, 
        valor_minimo_entrega_gratis, tempo_cancelamento_minutos, url_logo, descricao_negocio
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING id, nome, url_logo, modelo_negocio`,
      [
        nome, 
        tipo_negocio || 'Não especificado', 
        true, 
        whatsapp_vinculado || null, 
        nome_agente || null,
        modelo_negocio,
        oferece_delivery,
        taxa_entrega_padrao,
        valor_minimo_entrega_gratis || null,
        tempo_cancelamento_minutos,
        url_logo || null,
        descricao_negocio || null
      ]
    );

    if (!novaEmpresa) {
      return NextResponse.json(
        { error: 'Erro ao criar empresa' },
        { status: 500 }
      );
    }

    // Vincular empresa ao usuário e definir como gerente
    await queryOne(
      `UPDATE usuarios 
       SET empresa_id = $1, papel = 'gerente'
       WHERE id = $2`,
      [novaEmpresa.id, user.userId]
    );

    // Gerar novo token com empresa_id
    const newToken = jwt.sign(
      {
        userId: user.userId,
        empresaId: novaEmpresa.id,
        email: user.email,
        papel: 'gerente',
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Buscar dados atualizados do usuário
    const usuarioAtualizado = await queryOne<{
      id: number;
      nome: string;
      email: string;
      papel: string;
    }>(
      'SELECT id, nome, email, papel FROM usuarios WHERE id = $1',
      [user.userId]
    );

    return NextResponse.json({
      empresa: {
        id: novaEmpresa.id,
        nome: novaEmpresa.nome,
        logo: novaEmpresa.url_logo,
        modelo_negocio: novaEmpresa.modelo_negocio,
      },
      user: {
        id: usuarioAtualizado?.id.toString(),
        nome: usuarioAtualizado?.nome,
        email: usuarioAtualizado?.email,
        papel: 'gerente',
        empresa: {
          id: novaEmpresa.id,
          nome: novaEmpresa.nome,
          logo: novaEmpresa.url_logo,
          modelo_negocio: novaEmpresa.modelo_negocio,
        },
      },
      token: newToken,
    }, { status: 201 });

  } catch (error) {
    console.error('Erro ao criar empresa para usuário:', error);
    return NextResponse.json({ error: formatDatabaseError(error) }, { status: 500 });
  }
}
