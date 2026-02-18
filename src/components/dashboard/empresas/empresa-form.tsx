'use client';

import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Box from '@mui/material/Box';
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
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select from '@mui/material/Select';
import Switch from '@mui/material/Switch';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { FlaskIcon } from '@phosphor-icons/react/dist/ssr/Flask';
import { WhatsappLogo as WhatsAppIcon } from '@phosphor-icons/react/dist/ssr/WhatsappLogo';
import { CheckCircle as CheckCircleIcon } from '@phosphor-icons/react/dist/ssr/CheckCircle';
import { LinkSimple as LinkIcon } from '@phosphor-icons/react/dist/ssr/LinkSimple';
import { LinkBreak as LinkBreakIcon } from '@phosphor-icons/react/dist/ssr/LinkBreak';

import type { Empresa } from '@/types/database';
import { ImageUpload } from '@/components/core/image-upload';
import { WhatsAppQRDialog } from './whatsapp-qr-dialog';
import { getAuthHeaders } from '@/lib/auth/client';

const schema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  tipo_negocio: z.string().min(1, 'Tipo de negócio é obrigatório'),
  modelo_negocio: z.enum(['produto', 'servico', 'ambos']),
  whatsapp_vinculado: z.string().nullable().optional(),
  nome_agente: z.string().nullable().optional(),
  ativo: z.boolean(),
  oferece_delivery: z.boolean(),
  taxa_entrega_padrao: z.coerce.number().min(0),
  valor_minimo_entrega_gratis: z.coerce.number().nullable().optional(),
  tempo_cancelamento_minutos: z.coerce.number().min(0).nullable().optional(),
  url_logo: z.string().nullable().optional(),
  descricao_negocio: z.string().nullable().optional(),
  modo_teste: z.boolean(),
  numeros_permitidos: z.array(z.string()),
});

type FormData = z.infer<typeof schema>;

interface EmpresaFormProps {
  empresa?: Empresa | null;
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

export function EmpresaForm({ empresa, onSubmit, onCancel, loading }: EmpresaFormProps): React.JSX.Element {
  const [whatsappDialogOpen, setWhatsappDialogOpen] = React.useState(false);
  const [checkingConnection, setCheckingConnection] = React.useState(false);
  const [isWhatsappConnected, setIsWhatsappConnected] = React.useState(false);
  const [disconnecting, setDisconnecting] = React.useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: empresa?.nome || '',
      tipo_negocio: empresa?.tipo_negocio || '',
      modelo_negocio: empresa?.modelo_negocio || 'ambos',
      whatsapp_vinculado: empresa?.whatsapp_vinculado || '',
      nome_agente: empresa?.nome_agente || '',
      ativo: empresa?.ativo ?? true,
      oferece_delivery: empresa?.oferece_delivery ?? false,
      taxa_entrega_padrao: empresa?.taxa_entrega_padrao ?? 0,
      valor_minimo_entrega_gratis: empresa?.valor_minimo_entrega_gratis ?? null,
      tempo_cancelamento_minutos: empresa?.tempo_cancelamento_minutos ?? 60,
      url_logo: empresa?.url_logo ?? null,
      descricao_negocio: empresa?.descricao_negocio ?? null,
      modo_teste: empresa?.modo_teste ?? false,
      numeros_permitidos: empresa?.numeros_permitidos ?? [],
    },
  });

  // Verificar status da conexão WhatsApp ao carregar
  React.useEffect(() => {
    const checkWhatsAppConnection = async () => {
      if (!empresa?.id) return;
      
      setCheckingConnection(true);
      try {
        const response = await fetch(`/api/evolution?empresa_id=${empresa.id}`, {
          headers: getAuthHeaders(),
        });
        const data = await response.json();
        setIsWhatsappConnected(data.connected === true);
      } catch (err) {
        console.error('[EmpresaForm] Erro ao verificar WhatsApp:', err);
      } finally {
        setCheckingConnection(false);
      }
    };

    checkWhatsAppConnection();
  }, [empresa?.id]);

  // Log de erros de validação para debug
  React.useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.log('[EmpresaForm] Erros de validação:', errors);
    }
  }, [errors]);

  // Reset form when empresa changes
  React.useEffect(() => {
    reset({
      nome: empresa?.nome || '',
      tipo_negocio: empresa?.tipo_negocio || '',
      modelo_negocio: empresa?.modelo_negocio || 'ambos',
      whatsapp_vinculado: empresa?.whatsapp_vinculado || '',
      nome_agente: empresa?.nome_agente || '',
      ativo: empresa?.ativo ?? true,
      oferece_delivery: empresa?.oferece_delivery ?? false,
      taxa_entrega_padrao: empresa?.taxa_entrega_padrao ?? 0,
      valor_minimo_entrega_gratis: empresa?.valor_minimo_entrega_gratis ?? null,
      tempo_cancelamento_minutos: empresa?.tempo_cancelamento_minutos ?? 60,
      url_logo: empresa?.url_logo ?? null,
      descricao_negocio: empresa?.descricao_negocio ?? null,
      modo_teste: empresa?.modo_teste ?? false,
      numeros_permitidos: empresa?.numeros_permitidos ?? [],
    });
  }, [empresa, reset]);

  const oferece_delivery = watch('oferece_delivery');
  const modo_teste = watch('modo_teste');
  const nomeEmpresa = watch('nome');

  // Limpa lista quando modo de teste é desativado
  React.useEffect(() => {
    if (!modo_teste) {
      setValue('numeros_permitidos', [], { shouldDirty: true });
    }
  }, [modo_teste, setValue]);

  // Handler quando WhatsApp é conectado
  const handleWhatsAppConnected = (phoneNumber: string) => {
    console.log('[EmpresaForm] WhatsApp conectado com número:', phoneNumber);
    setValue('whatsapp_vinculado', phoneNumber, { shouldDirty: true, shouldTouch: true });
    setIsWhatsappConnected(true);
  };

  // Handler para desvincular WhatsApp
  const handleDisconnectWhatsApp = async () => {
    if (!empresa?.id) return;
    
    if (!confirm('Tem certeza que deseja desvincular o WhatsApp desta empresa? O número será removido e você precisará vincular novamente.')) {
      return;
    }

    setDisconnecting(true);
    try {
      const response = await fetch(`/api/evolution?empresa_id=${empresa.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        setValue('whatsapp_vinculado', '', { shouldDirty: true, shouldTouch: true });
        setIsWhatsappConnected(false);
        console.log('[EmpresaForm] WhatsApp desvinculado com sucesso');
      } else {
        const data = await response.json();
        console.error('[EmpresaForm] Erro ao desvincular:', data.error);
        alert('Erro ao desvincular WhatsApp: ' + (data.error || 'Erro desconhecido'));
      }
    } catch (err) {
      console.error('[EmpresaForm] Erro ao desvincular WhatsApp:', err);
      alert('Erro ao desvincular WhatsApp');
    } finally {
      setDisconnecting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader title={empresa ? 'Editar Empresa' : 'Nova Empresa'} />
        <Divider />
        <CardContent>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <Controller
                name="url_logo"
                control={control}
                render={({ field }) => (
                  <ImageUpload
                    value={field.value}
                    onChange={field.onChange}
                    folder="empresas/logos"
                    label="Logo da Empresa"
                    variant="avatar"
                    width={120}
                    height={120}
                  />
                )}
              />
            </Grid>
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
                name="tipo_negocio"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={Boolean(errors.tipo_negocio)}>
                    <InputLabel>Tipo de Negócio</InputLabel>
                    <OutlinedInput {...field} label="Tipo de Negócio" />
                    {errors.tipo_negocio && <FormHelperText>{errors.tipo_negocio.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="modelo_negocio"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Modelo de Negócio</InputLabel>
                    <Select {...field} label="Modelo de Negócio">
                      <MenuItem value="produto">Produto</MenuItem>
                      <MenuItem value="servico">Serviço</MenuItem>
                      <MenuItem value="ambos">Ambos</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="whatsapp_vinculado"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={Boolean(errors.whatsapp_vinculado)}>
                    <InputLabel>WhatsApp Vinculado</InputLabel>
                    <OutlinedInput 
                      {...field} 
                      value={field.value || ''} 
                      label="WhatsApp Vinculado"
                      placeholder="5511999999999"
                      inputProps={{ inputMode: 'numeric' }}
                      onChange={(e) => {
                        // Remove tudo que não for número
                        const onlyNumbers = e.target.value.replace(/\D/g, '');
                        field.onChange(onlyNumbers);
                      }}
                      endAdornment={
                        <InputAdornment position="end">
                          {checkingConnection || disconnecting ? (
                            <CircularProgress size={20} />
                          ) : empresa?.id ? (
                            <>
                              <Tooltip title={isWhatsappConnected ? 'WhatsApp conectado' : 'Conectar WhatsApp'}>
                                <IconButton
                                  onClick={() => setWhatsappDialogOpen(true)}
                                  edge="end"
                                  sx={{
                                    color: isWhatsappConnected ? '#25D366' : 'text.secondary',
                                    '&:hover': { color: '#25D366' },
                                  }}
                                >
                                  {isWhatsappConnected ? (
                                    <CheckCircleIcon size={24} weight="fill" />
                                  ) : (
                                    <WhatsAppIcon size={24} weight="fill" />
                                  )}
                                </IconButton>
                              </Tooltip>
                              {isWhatsappConnected && (
                                <Tooltip title="Desvincular WhatsApp">
                                  <IconButton
                                    onClick={handleDisconnectWhatsApp}
                                    edge="end"
                                    sx={{
                                      color: 'error.main',
                                      '&:hover': { color: 'error.dark' },
                                      ml: 0.5,
                                    }}
                                  >
                                    <LinkBreakIcon size={22} />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </>
                          ) : (
                            <Tooltip title="Salve a empresa primeiro para conectar o WhatsApp">
                              <span>
                                <IconButton edge="end" disabled>
                                  <LinkIcon size={24} />
                                </IconButton>
                              </span>
                            </Tooltip>
                          )}
                        </InputAdornment>
                      }
                    />
                    {errors.whatsapp_vinculado && <FormHelperText>{errors.whatsapp_vinculado.message}</FormHelperText>}
                    <FormHelperText>
                      {empresa?.id 
                        ? 'Clique no ícone do WhatsApp para conectar via QR Code' 
                        : 'Salve a empresa para conectar o WhatsApp'
                      }
                    </FormHelperText>
                  </FormControl>
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="nome_agente"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Nome do Agente</InputLabel>
                    <OutlinedInput {...field} value={field.value || ''} label="Nome do Agente" />
                  </FormControl>
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="tempo_cancelamento_minutos"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Tempo p/ Cancelamento</InputLabel>
                    <OutlinedInput
                      {...field}
                      type="number"
                      label="Tempo p/ Cancelamento"
                      endAdornment={<InputAdornment position="end">minutos</InputAdornment>}
                      value={field.value ?? 60}
                      onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value, 10) : null)}
                    />
                    <FormHelperText>Tempo máximo que o cliente pode cancelar um agendamento</FormHelperText>
                  </FormControl>
                )}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Controller
                name="descricao_negocio"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Descrição Estratégica para I.A.</InputLabel>
                    <OutlinedInput
                      {...field}
                      value={field.value || ''}
                      label="Descrição Estratégica para I.A."
                      multiline
                      minRows={4}
                      maxRows={8}
                      placeholder="Ex: Somos uma barbearia de luxo focada no público jovem. Oferecemos cerveja artesanal de brinde. Nosso tom de voz deve ser descontraído, mas extremamente respeitoso. Se o cliente for novo, ofereça o 'Combo VIP' que inclui barba e cabelo."
                    />
                    <FormHelperText>
                      Descreva características do negócio, tom de voz, ofertas especiais e instruções para o agente de I.A.
                    </FormHelperText>
                  </FormControl>
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', height: '100%' }}>
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
                <Controller
                  name="oferece_delivery"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Switch checked={field.value} onChange={field.onChange} />}
                      label="Oferece Delivery"
                    />
                  )}
                />
                <Controller
                  name="modo_teste"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Switch
                          checked={field.value}
                          onChange={field.onChange}
                          color="warning"
                        />
                      }
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Typography variant="body2">Modo de Teste</Typography>
                          {field.value && (
                            <Chip label="Ativo" size="small" color="warning" sx={{ height: 18, fontSize: '0.65rem' }} />
                          )}
                        </Box>
                      }
                    />
                  )}
                />
              </Box>
            </Grid>
            {modo_teste && (
              <Grid size={{ xs: 12 }}>
                <Alert
                  severity="warning"
                  icon={<FlaskIcon size={20} />}
                  sx={{ mb: 2 }}
                >
                  <Typography variant="body2" fontWeight={600}>
                    Modo de Teste ativo
                  </Typography>
                  <Typography variant="body2">
                    A I.A. responderá <strong>somente</strong> para os números cadastrados abaixo.
                    Mensagens de outros números serão ignoradas.
                  </Typography>
                </Alert>
                <Controller
                  name="numeros_permitidos"
                  control={control}
                  render={({ field }) => {
                    const linhas = (field.value || []).join('\n');
                    return (
                      <FormControl fullWidth>
                        <InputLabel shrink>Números permitidos (um por linha)</InputLabel>
                        <OutlinedInput
                          notched
                          label="Números permitidos (um por linha)"
                          multiline
                          minRows={3}
                          maxRows={10}
                          value={linhas}
                          inputProps={{ inputMode: 'numeric' }}
                          onChange={(e) => {
                            const lista = e.target.value
                              .split(/[\n,;]+/)
                              .map((n) => n.replace(/\D/g, ''))
                              .filter(Boolean);
                            field.onChange(lista);
                          }}
                          placeholder={'5511999990001\n5511999990002'}
                        />
                        <FormHelperText>
                          Digite um número por linha (com DDI+DDD). Ex: 5511999990001
                          {field.value?.length > 0 && ` — ${field.value.length} número(s) cadastrado(s)`}
                        </FormHelperText>
                      </FormControl>
                    );
                  }}
                />
              </Grid>
            )}
            {oferece_delivery && (
              <>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Controller
                    name="taxa_entrega_padrao"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel>Taxa de Entrega Padrão</InputLabel>
                        <OutlinedInput
                          {...field}
                          type="number"
                          label="Taxa de Entrega Padrão"
                          startAdornment={<InputAdornment position="start">R$</InputAdornment>}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                    )}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Controller
                    name="valor_minimo_entrega_gratis"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel>Valor Mínimo Entrega Grátis</InputLabel>
                        <OutlinedInput
                          {...field}
                          type="number"
                          label="Valor Mínimo Entrega Grátis"
                          startAdornment={<InputAdornment position="start">R$</InputAdornment>}
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                        />
                      </FormControl>
                    )}
                  />
                </Grid>
              </>
            )}
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

      {/* Dialog para conectar WhatsApp */}
      {empresa?.id && (
        <WhatsAppQRDialog
          open={whatsappDialogOpen}
          onClose={() => setWhatsappDialogOpen(false)}
          empresaId={empresa.id}
          empresaNome={nomeEmpresa || empresa.nome}
          onConnected={handleWhatsAppConnected}
        />
      )}
    </form>
  );
}
