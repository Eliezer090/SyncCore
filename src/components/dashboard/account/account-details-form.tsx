'use client';

import * as React from 'react';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';

import { useUser } from '@/hooks/use-user';
import { getAuthHeaders } from '@/lib/auth/client';

export function AccountDetailsForm(): React.JSX.Element {
  const { user, checkSession } = useUser();
  const [nome, setNome] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [senhaAtual, setSenhaAtual] = React.useState('');
  const [novaSenha, setNovaSenha] = React.useState('');
  const [confirmarSenha, setConfirmarSenha] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);

  React.useEffect(() => {
    if (user) {
      setNome(user.nome || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    // Validar senhas se estiver alterando
    if (novaSenha || confirmarSenha) {
      if (!senhaAtual) {
        setMessage({ type: 'error', text: 'Informe a senha atual para alterar a senha' });
        setLoading(false);
        return;
      }
      if (novaSenha !== confirmarSenha) {
        setMessage({ type: 'error', text: 'As senhas não conferem' });
        setLoading(false);
        return;
      }
      if (novaSenha.length < 6) {
        setMessage({ type: 'error', text: 'A nova senha deve ter pelo menos 6 caracteres' });
        setLoading(false);
        return;
      }
    }

    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          nome,
          ...(senhaAtual && novaSenha && { senhaAtual, novaSenha }),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage({ type: 'error', text: data.error || 'Erro ao atualizar perfil' });
      } else {
        setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
        setSenhaAtual('');
        setNovaSenha('');
        setConfirmarSenha('');
        // Atualizar dados do usuário no contexto
        await checkSession?.();
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao conectar com o servidor' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader subheader="Atualize suas informações pessoais" title="Perfil" />
        <Divider />
        <CardContent>
          <Grid container spacing={3}>
            {message && (
              <Grid size={{ xs: 12 }}>
                <Alert severity={message.type}>{message.text}</Alert>
              </Grid>
            )}
            <Grid size={{ md: 6, xs: 12 }}>
              <FormControl fullWidth required>
                <InputLabel>Nome</InputLabel>
                <OutlinedInput 
                  value={nome} 
                  onChange={(e) => setNome(e.target.value)}
                  label="Nome" 
                  name="nome" 
                />
              </FormControl>
            </Grid>
            <Grid size={{ md: 6, xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel>Email</InputLabel>
                <OutlinedInput 
                  value={email} 
                  label="Email" 
                  name="email" 
                  disabled
                />
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Divider sx={{ my: 1 }}>Alterar Senha (opcional)</Divider>
            </Grid>
            <Grid size={{ md: 4, xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel>Senha atual</InputLabel>
                <OutlinedInput 
                  value={senhaAtual}
                  onChange={(e) => setSenhaAtual(e.target.value)}
                  label="Senha atual" 
                  name="senhaAtual" 
                  type="password"
                />
              </FormControl>
            </Grid>
            <Grid size={{ md: 4, xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel>Nova senha</InputLabel>
                <OutlinedInput 
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  label="Nova senha" 
                  name="novaSenha" 
                  type="password"
                />
              </FormControl>
            </Grid>
            <Grid size={{ md: 4, xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel>Confirmar senha</InputLabel>
                <OutlinedInput 
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  label="Confirmar senha" 
                  name="confirmarSenha" 
                  type="password"
                />
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
        <Divider />
        <CardActions sx={{ justifyContent: 'flex-end' }}>
          <Button 
            type="submit" 
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </CardActions>
      </Card>
    </form>
  );
}
