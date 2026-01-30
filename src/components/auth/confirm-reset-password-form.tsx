'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { EyeIcon } from '@phosphor-icons/react/dist/ssr/Eye';
import { EyeSlashIcon } from '@phosphor-icons/react/dist/ssr/EyeSlash';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import { authClient } from '@/lib/auth/client';
import { paths } from '@/paths';

const schema = zod.object({
  password: zod.string().min(6, { message: 'A senha deve ter no mínimo 6 caracteres' }),
  confirmPassword: zod.string().min(6, { message: 'A senha deve ter no mínimo 6 caracteres' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

type Values = zod.infer<typeof schema>;

const defaultValues = { password: '', confirmPassword: '' } satisfies Values;

export function ConfirmResetPasswordForm(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [showPassword, setShowPassword] = React.useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState<boolean>(false);
  const [isPending, setIsPending] = React.useState<boolean>(false);
  const [success, setSuccess] = React.useState<boolean>(false);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Values>({ defaultValues, resolver: zodResolver(schema) });

  const onSubmit = React.useCallback(
    async (values: Values): Promise<void> => {
      if (!token) {
        setError('root', { type: 'server', message: 'Token não encontrado' });
        return;
      }

      setIsPending(true);

      const { error } = await authClient.confirmPasswordReset({
        token,
        newPassword: values.password,
      });

      if (error) {
        setError('root', { type: 'server', message: error });
        setIsPending(false);
        return;
      }

      setSuccess(true);
      setIsPending(false);

      // Redirecionar para login após 3 segundos
      setTimeout(() => {
        router.push(paths.auth.signIn);
      }, 3000);
    },
    [token, setError, router]
  );

  if (!token) {
    return (
      <Stack spacing={3}>
        <Typography variant="h4">Link Inválido</Typography>
        <Alert color="error">
          Este link de recuperação de senha é inválido ou expirou.
          Por favor, solicite um novo link de recuperação.
        </Alert>
        <Button
          variant="contained"
          onClick={() => router.push(paths.auth.resetPassword)}
        >
          Solicitar Novo Link
        </Button>
      </Stack>
    );
  }

  if (success) {
    return (
      <Stack spacing={3}>
        <Typography variant="h4">Senha Redefinida!</Typography>
        <Alert color="success">
          <Typography variant="body2">
            <strong>Sucesso!</strong>
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Sua senha foi redefinida com sucesso. Você será redirecionado para a página de login em alguns segundos.
          </Typography>
        </Alert>
        <Button
          variant="contained"
          onClick={() => router.push(paths.auth.signIn)}
        >
          Ir para Login
        </Button>
      </Stack>
    );
  }

  return (
    <Stack spacing={4}>
      <Stack spacing={1}>
        <Typography variant="h4">Definir Nova Senha</Typography>
        <Typography color="text.secondary" variant="body2">
          Digite e confirme sua nova senha
        </Typography>
      </Stack>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <FormControl error={Boolean(errors.password)}>
                <InputLabel>Nova Senha</InputLabel>
                <OutlinedInput
                  {...field}
                  endAdornment={
                    showPassword ? (
                      <EyeIcon
                        cursor="pointer"
                        fontSize="var(--icon-fontSize-md)"
                        onClick={(): void => {
                          setShowPassword(false);
                        }}
                      />
                    ) : (
                      <EyeSlashIcon
                        cursor="pointer"
                        fontSize="var(--icon-fontSize-md)"
                        onClick={(): void => {
                          setShowPassword(true);
                        }}
                      />
                    )
                  }
                  label="Nova Senha"
                  type={showPassword ? 'text' : 'password'}
                />
                {errors.password ? <FormHelperText>{errors.password.message}</FormHelperText> : null}
              </FormControl>
            )}
          />

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field }) => (
              <FormControl error={Boolean(errors.confirmPassword)}>
                <InputLabel>Confirmar Nova Senha</InputLabel>
                <OutlinedInput
                  {...field}
                  endAdornment={
                    showConfirmPassword ? (
                      <EyeIcon
                        cursor="pointer"
                        fontSize="var(--icon-fontSize-md)"
                        onClick={(): void => {
                          setShowConfirmPassword(false);
                        }}
                      />
                    ) : (
                      <EyeSlashIcon
                        cursor="pointer"
                        fontSize="var(--icon-fontSize-md)"
                        onClick={(): void => {
                          setShowConfirmPassword(true);
                        }}
                      />
                    )
                  }
                  label="Confirmar Nova Senha"
                  type={showConfirmPassword ? 'text' : 'password'}
                />
                {errors.confirmPassword ? (
                  <FormHelperText>{errors.confirmPassword.message}</FormHelperText>
                ) : null}
              </FormControl>
            )}
          />

          {errors.root ? <Alert color="error">{errors.root.message}</Alert> : null}

          <Button disabled={isPending} type="submit" variant="contained">
            {isPending ? 'Redefinindo...' : 'Redefinir Senha'}
          </Button>
        </Stack>
      </form>
    </Stack>
  );
}
