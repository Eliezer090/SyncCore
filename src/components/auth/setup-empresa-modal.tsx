'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import { useUser } from '@/hooks/use-user';

const schema = zod.object({
  nome: zod.string().min(1, { message: 'Nome da empresa é obrigatório' }),
  tipo_negocio: zod.string().optional(),
  modelo_negocio: zod.enum(['produto', 'servico', 'ambos']),
  whatsapp_vinculado: zod.string().optional(),
  nome_agente: zod.string().optional(),
  descricao_negocio: zod.string().optional(),
  oferece_delivery: zod.boolean(),
  taxa_entrega_padrao: zod.number().optional(),
  tempo_cancelamento_minutos: zod.number().optional(),
});

type Values = zod.infer<typeof schema>;

const defaultValues: Values = {
  nome: '',
  tipo_negocio: '',
  modelo_negocio: 'ambos',
  whatsapp_vinculado: '',
  nome_agente: '',
  descricao_negocio: '',
  oferece_delivery: false,
  taxa_entrega_padrao: 0,
  tempo_cancelamento_minutos: 60,
};

interface SetupEmpresaModalProps {
  open: boolean;
  onSuccess: () => void;
}

export function SetupEmpresaModal({ open, onSuccess }: SetupEmpresaModalProps): React.JSX.Element {
  const { checkSession } = useUser();
  const [isPending, setIsPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Values>({ defaultValues, resolver: zodResolver(schema) });

  const ofereceDelivery = watch('oferece_delivery');

  const onSubmit = React.useCallback(
    async (values: Values): Promise<void> => {
      setIsPending(true);
      setError(null);

      try {
        const token = localStorage.getItem('custom-auth-token');
        if (!token) {
          setError('Sessão expirada. Por favor, faça login novamente.');
          setIsPending(false);
          return;
        }

        const response = await fetch('/api/auth/setup-empresa', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...values,
            taxa_entrega_padrao: values.oferece_delivery ? values.taxa_entrega_padrao : 0,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Erro ao criar empresa');
          setIsPending(false);
          return;
        }

        // Atualizar token e dados do usuário
        localStorage.setItem('custom-auth-token', data.token);
        localStorage.setItem('user-data', JSON.stringify(data.user));

        // Atualizar sessão
        await checkSession?.();

        setIsPending(false);
        onSuccess();
      } catch (err) {
        console.error('Erro ao criar empresa:', err);
        setError('Erro ao conectar com o servidor');
        setIsPending(false);
      }
    },
    [checkSession, onSuccess]
  );

  return (
    <Dialog 
      open={open} 
      maxWidth="sm" 
      fullWidth 
      disableEscapeKeyDown
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle>
        <Stack spacing={1}>
          <Typography variant="h5" fontWeight={600}>
            Bem-vindo ao SyncCore! 🎉
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Para começar, precisamos configurar sua empresa. Preencha os dados abaixo.
          </Typography>
        </Stack>
      </DialogTitle>
      <Divider />
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {/* Nome da Empresa */}
            <Controller
              control={control}
              name="nome"
              render={({ field }) => (
                <FormControl error={Boolean(errors.nome)} required>
                  <InputLabel>Nome da Empresa</InputLabel>
                  <OutlinedInput {...field} label="Nome da Empresa" />
                  {errors.nome ? <FormHelperText>{errors.nome.message}</FormHelperText> : null}
                </FormControl>
              )}
            />

            {/* Tipo de Negócio */}
            <Controller
              control={control}
              name="tipo_negocio"
              render={({ field }) => (
                <FormControl>
                  <InputLabel>Tipo de Negócio</InputLabel>
                  <OutlinedInput {...field} label="Tipo de Negócio" placeholder="Ex: Restaurante, Salão de Beleza, Loja..." />
                </FormControl>
              )}
            />

            {/* Modelo de Negócio */}
            <Controller
              control={control}
              name="modelo_negocio"
              render={({ field }) => (
                <FormControl>
                  <InputLabel>Modelo de Negócio</InputLabel>
                  <Select {...field} label="Modelo de Negócio">
                    <MenuItem value="produto">Apenas Produtos</MenuItem>
                    <MenuItem value="servico">Apenas Serviços</MenuItem>
                    <MenuItem value="ambos">Produtos e Serviços</MenuItem>
                  </Select>
                  <FormHelperText>
                    Define quais funcionalidades estarão disponíveis no sistema
                  </FormHelperText>
                </FormControl>
              )}
            />

            {/* WhatsApp */}
            <Controller
              control={control}
              name="whatsapp_vinculado"
              render={({ field }) => (
                <FormControl>
                  <InputLabel>WhatsApp</InputLabel>
                  <OutlinedInput 
                    {...field} 
                    label="WhatsApp" 
                    placeholder="(11) 99999-9999"
                  />
                  <FormHelperText>Número para integração com WhatsApp (opcional)</FormHelperText>
                </FormControl>
              )}
            />

            {/* Descrição */}
            <Controller
              control={control}
              name="descricao_negocio"
              render={({ field }) => (
                <FormControl>
                  <InputLabel>Descrição do Negócio</InputLabel>
                  <OutlinedInput 
                    {...field} 
                    label="Descrição do Negócio" 
                    multiline 
                    rows={2}
                    placeholder="Breve descrição da sua empresa..."
                  />
                </FormControl>
              )}
            />

            <Divider />

            {/* Delivery */}
            <Controller
              control={control}
              name="oferece_delivery"
              render={({ field }) => (
                <FormControlLabel
                  control={<Switch {...field} checked={field.value} />}
                  label="Oferece Delivery"
                />
              )}
            />

            {ofereceDelivery && (
              <Controller
                control={control}
                name="taxa_entrega_padrao"
                render={({ field }) => (
                  <FormControl>
                    <InputLabel>Taxa de Entrega Padrão (R$)</InputLabel>
                    <OutlinedInput
                      {...field}
                      type="number"
                      label="Taxa de Entrega Padrão (R$)"
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                )}
              />
            )}

            {/* Tempo Cancelamento */}
            <Controller
              control={control}
              name="tempo_cancelamento_minutos"
              render={({ field }) => (
                <FormControl>
                  <InputLabel>Tempo para Cancelamento (minutos)</InputLabel>
                  <OutlinedInput
                    {...field}
                    type="number"
                    label="Tempo para Cancelamento (minutos)"
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 60)}
                  />
                  <FormHelperText>
                    Tempo máximo que o cliente pode cancelar um pedido/agendamento
                  </FormHelperText>
                </FormControl>
              )}
            />

            {error && (
              <Alert severity="error">{error}</Alert>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={isPending}
                sx={{ minWidth: 200 }}
              >
                {isPending ? 'Criando...' : 'Criar Empresa e Continuar'}
              </Button>
            </Box>
          </Stack>
        </form>
      </DialogContent>
    </Dialog>
  );
}
