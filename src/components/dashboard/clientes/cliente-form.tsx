'use client';

import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';

import type { Cliente } from '@/types/database';
import { ImageUpload } from '@/components/core/image-upload';

const schema = z.object({
  nome: z.string().nullable().optional(),
  telefone: z.string().min(1, 'Telefone é obrigatório'),
  email: z.string().email('E-mail inválido').nullable().optional().or(z.literal('')),
  url_foto: z.string().nullable().optional(),
});

type FormData = z.infer<typeof schema>;

interface ClienteFormProps {
  cliente?: Cliente | null;
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

export function ClienteForm({ cliente, onSubmit, onCancel, loading }: ClienteFormProps): React.JSX.Element {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: cliente?.nome || '',
      telefone: cliente?.telefone || '',
      email: cliente?.email || '',
      url_foto: cliente?.url_foto ?? null,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader title={cliente ? 'Editar Cliente' : 'Novo Cliente'} />
        <Divider />
        <CardContent>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <Controller
                name="url_foto"
                control={control}
                render={({ field }) => (
                  <ImageUpload
                    value={field.value}
                    onChange={field.onChange}
                    folder="clientes/fotos"
                    label="Foto do Cliente"
                    variant="avatar"
                    width={100}
                    height={100}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="nome"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Nome</InputLabel>
                    <OutlinedInput {...field} value={field.value || ''} label="Nome" />
                  </FormControl>
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="telefone"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={Boolean(errors.telefone)}>
                    <InputLabel>Telefone</InputLabel>
                    <OutlinedInput {...field} label="Telefone" />
                    {errors.telefone && <FormHelperText>{errors.telefone.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={Boolean(errors.email)}>
                    <InputLabel>E-mail</InputLabel>
                    <OutlinedInput {...field} value={field.value || ''} label="E-mail" type="email" />
                    {errors.email && <FormHelperText>{errors.email.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Grid>
          </Grid>
        </CardContent>
        <Divider />
        <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
          <Button onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </CardActions>
      </Card>
    </form>
  );
}
