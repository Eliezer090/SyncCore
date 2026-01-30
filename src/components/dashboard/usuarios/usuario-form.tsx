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
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select from '@mui/material/Select';
import Switch from '@mui/material/Switch';

import type { Usuario, Empresa } from '@/types/database';
import { useUser } from '@/hooks/use-user';

const schema = z.object({
  empresa_id: z.number().nullable().optional(),
  nome: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  senha_hash: z.string().optional(),
  papel: z.string().min(1, 'Papel é obrigatório'),
  ativo: z.boolean(),
});

type FormData = z.infer<typeof schema>;

interface UsuarioFormProps {
  usuario?: Usuario | null;
  empresas?: Empresa[];
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
  loading?: boolean;
  defaultPapel?: string | null; // Para pré-selecionar papel (ex: 'profissional')
}

export function UsuarioForm({ usuario, empresas = [], onSubmit, onCancel, loading, defaultPapel }: UsuarioFormProps): React.JSX.Element {
  const { user } = useUser();
  const isAdminGlobal = user?.papel === 'admin';
  
  // Determinar empresa_id: admin_global pode escolher, outros usam a empresa do usuário logado
  const defaultEmpresaId = React.useMemo(() => {
    if (usuario?.empresa_id) return Number(usuario.empresa_id);
    if (isAdminGlobal) return null;
    const empresaId = user?.empresa?.id || user?.empresaAtiva?.id;
    return empresaId ? Number(empresaId) : null;
  }, [usuario, isAdminGlobal, user]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      empresa_id: defaultEmpresaId,
      nome: usuario?.nome || '',
      email: usuario?.email || '',
      senha_hash: '',
      papel: usuario?.papel || defaultPapel || 'atendente',
      ativo: usuario?.ativo ?? true,
    },
  });

  // Log para debug
  console.log('[UsuarioForm] defaultEmpresaId:', defaultEmpresaId, 'usuario:', usuario, 'defaultPapel:', defaultPapel);

  // Atualiza empresa_id quando o user carrega (para não-admin)
  React.useEffect(() => {
    if (!isAdminGlobal && !usuario) {
      const empresaId = user?.empresa?.id || user?.empresaAtiva?.id;
      if (empresaId) {
        setValue('empresa_id', Number(empresaId));
      }
    }
  }, [user, isAdminGlobal, usuario, setValue]);

  const onFormSubmit = (data: FormData) => {
    console.log('[UsuarioForm] Dados do formulário:', data);
    // Se não for admin_global, garantir que empresa_id está preenchido
    if (!isAdminGlobal) {
      const empresaId = user?.empresa?.id || user?.empresaAtiva?.id;
      if (empresaId) {
        data.empresa_id = Number(empresaId);
      }
    }
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)}>
      <Card>
        <CardHeader title={usuario ? 'Editar Usuário' : 'Novo Usuário'} />
        <Divider />
        <CardContent>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="nome"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={Boolean(errors.nome)}>
                    <InputLabel>Nome</InputLabel>
                    <OutlinedInput {...field} label="Nome" />
                    {errors.nome && <FormHelperText>{errors.nome.message}</FormHelperText>}
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
                    <InputLabel>Email</InputLabel>
                    <OutlinedInput {...field} label="Email" type="email" />
                    {errors.email && <FormHelperText>{errors.email.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Grid>
            {/* Campo Empresa - Apenas visível para admin_global */}
            {isAdminGlobal && (
              <Grid size={{ xs: 12, md: 6 }}>
                <Controller
                  name="empresa_id"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={Boolean(errors.empresa_id)}>
                      <InputLabel>Empresa</InputLabel>
                      <Select {...field} label="Empresa">
                        {empresas.map((empresa) => (
                          <MenuItem key={empresa.id} value={empresa.id}>
                            {empresa.nome}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.empresa_id && <FormHelperText>{errors.empresa_id.message}</FormHelperText>}
                    </FormControl>
                  )}
                />
              </Grid>
            )}
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="papel"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={Boolean(errors.papel)}>
                    <InputLabel>Papel</InputLabel>
                    <Select {...field} label="Papel">
                      {isAdminGlobal && <MenuItem value="admin">Admin</MenuItem>}
                      <MenuItem value="gerente">Gerente</MenuItem>
                      <MenuItem value="atendente">Atendente</MenuItem>
                      <MenuItem value="profissional">Profissional</MenuItem>
                    </Select>
                    {errors.papel && <FormHelperText>{errors.papel.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="senha_hash"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>{usuario ? 'Nova Senha (deixe em branco para manter)' : 'Senha'}</InputLabel>
                    <OutlinedInput
                      {...field}
                      label={usuario ? 'Nova Senha (deixe em branco para manter)' : 'Senha'}
                      type="password"
                    />
                  </FormControl>
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="ativo"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch checked={field.value} onChange={field.onChange} />}
                    label="Ativo"
                  />
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
