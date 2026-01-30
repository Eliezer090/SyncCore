'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import { authClient } from '@/lib/auth/client';

const schema = zod.object({
  email: zod.string().min(1, { message: 'E-mail é obrigatório' }).email({ message: 'E-mail inválido' }),
});

type Values = zod.infer<typeof schema>;

const defaultValues = { email: '' } satisfies Values;

export function ResetPasswordForm(): React.JSX.Element {
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
      setIsPending(true);

      const { error } = await authClient.resetPassword(values);

      if (error) {
        setError('root', { type: 'server', message: error });
        setIsPending(false);
        return;
      }

      setSuccess(true);
      setIsPending(false);
    },
    [setError]
  );

  return (
    <Stack spacing={4}>
      <Stack spacing={1}>
        <Typography variant="h4">Recuperar Senha</Typography>
        <Typography color="text.secondary" variant="body2">
          Digite seu e-mail para receber as instruções de recuperação
        </Typography>
      </Stack>

      {success ? (
        <Alert color="success">
          <Typography variant="body2">
            <strong>E-mail enviado!</strong>
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Se o e-mail estiver cadastrado, você receberá as instruções de recuperação em alguns minutos.
            Verifique também sua caixa de spam.
          </Typography>
        </Alert>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={2}>
            <Controller
              control={control}
              name="email"
              render={({ field }) => (
                <FormControl error={Boolean(errors.email)}>
                  <InputLabel>E-mail</InputLabel>
                  <OutlinedInput {...field} label="E-mail" type="email" />
                  {errors.email ? <FormHelperText>{errors.email.message}</FormHelperText> : null}
                </FormControl>
              )}
            />
            {errors.root ? <Alert color="error">{errors.root.message}</Alert> : null}
            <Button disabled={isPending} type="submit" variant="contained">
              {isPending ? 'Enviando...' : 'Enviar link de recuperação'}
            </Button>
          </Stack>
        </form>
      )}
    </Stack>
  );
}

