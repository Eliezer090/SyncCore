import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { token, newPassword } = await request.json();

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: 'Token e nova senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Validar senha
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'A senha deve ter no mínimo 6 caracteres' },
        { status: 400 }
      );
    }

    const client = await pool.connect();

    try {
      // Verificar se o token existe e é válido
      const tokenResult = await client.query(
        `SELECT id, usuario_id, expires_at, used 
         FROM password_reset_tokens 
         WHERE token = $1`,
        [token]
      );

      if (tokenResult.rows.length === 0) {
        return NextResponse.json(
          { error: 'Token inválido ou expirado' },
          { status: 400 }
        );
      }

      const resetToken = tokenResult.rows[0];

      // Verificar se o token já foi usado
      if (resetToken.used) {
        return NextResponse.json(
          { error: 'Este link de recuperação já foi utilizado' },
          { status: 400 }
        );
      }

      // Verificar se o token expirou
      const now = new Date();
      if (new Date(resetToken.expires_at) < now) {
        return NextResponse.json(
          { error: 'Este link de recuperação expirou. Solicite um novo.' },
          { status: 400 }
        );
      }

      // Hash da nova senha
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Atualizar senha do usuário
      await client.query(
        'UPDATE usuarios SET password = $1, updated_at = NOW() WHERE id = $2',
        [hashedPassword, resetToken.usuario_id]
      );

      // Marcar token como usado
      await client.query(
        'UPDATE password_reset_tokens SET used = TRUE, updated_at = NOW() WHERE id = $1',
        [resetToken.id]
      );

      // Invalidar todos os outros tokens do usuário
      await client.query(
        `UPDATE password_reset_tokens 
         SET used = TRUE 
         WHERE usuario_id = $1 AND id != $2 AND used = FALSE`,
        [resetToken.usuario_id, resetToken.id]
      );

      return NextResponse.json({
        message: 'Senha redefinida com sucesso! Você já pode fazer login.',
      });

    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erro ao confirmar reset de senha:', error);
    return NextResponse.json(
      { error: 'Erro ao redefinir senha' },
      { status: 500 }
    );
  }
}
