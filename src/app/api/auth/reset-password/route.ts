import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import pool from '@/lib/db';
import { sendPasswordResetEmail } from '@/lib/email/password-reset';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'E-mail é obrigatório' },
        { status: 400 }
      );
    }

    const client = await pool.connect();

    try {
      // Verificar se o usuário existe
      const userResult = await client.query(
        'SELECT id, nome, email FROM usuarios WHERE LOWER(email) = LOWER($1)',
        [email]
      );

      // Por segurança, sempre retorna sucesso mesmo se o e-mail não existir
      // Isso evita que atacantes descubram quais e-mails estão cadastrados
      if (userResult.rows.length === 0) {
        return NextResponse.json({
          message: 'Se o e-mail estiver cadastrado, você receberá as instruções de recuperação.',
        });
      }

      const user = userResult.rows[0];

      // Gerar token único e seguro
      const token = randomBytes(32).toString('hex');
      
      // Token expira em 1 hora
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

      // Invalidar tokens anteriores do mesmo usuário
      await client.query(
        'UPDATE password_reset_tokens SET used = TRUE WHERE usuario_id = $1 AND used = FALSE',
        [user.id]
      );

      // Criar novo token de reset
      await client.query(
        `INSERT INTO password_reset_tokens (usuario_id, token, expires_at)
         VALUES ($1, $2, $3)`,
        [user.id, token, expiresAt]
      );

      // Enviar e-mail de recuperação
      const emailResult = await sendPasswordResetEmail({
        to: user.email,
        nome: user.nome,
        resetToken: token,
      });

      if (!emailResult.success) {
        console.error('Erro ao enviar e-mail:', emailResult.error);
        return NextResponse.json(
          { error: 'Erro ao enviar e-mail de recuperação. Tente novamente.' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        message: 'Se o e-mail estiver cadastrado, você receberá as instruções de recuperação.',
      });

    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erro ao processar reset de senha:', error);
    return NextResponse.json(
      { error: 'Erro ao processar solicitação' },
      { status: 500 }
    );
  }
}
