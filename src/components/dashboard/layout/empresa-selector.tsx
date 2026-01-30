'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import type { SelectChangeEvent } from '@mui/material/Select';

import type { UserEmpresa } from '@/types/user';
import { useUser } from '@/hooks/use-user';

interface Empresa {
  id: number;
  nome: string;
  url_logo: string | null;
  modelo_negocio: string;
}

export function EmpresaSelector(): React.JSX.Element | null {
  const { user, setEmpresaAtiva } = useUser();
  const [empresas, setEmpresas] = React.useState<Empresa[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [isAdminGlobal, setIsAdminGlobal] = React.useState(false);

  console.log('[EmpresaSelector] Render - user:', user, 'setEmpresaAtiva:', typeof setEmpresaAtiva);

  // Carregar empresas (só para admin)
  React.useEffect(() => {
    console.log('[EmpresaSelector] useEffect - user?.papel:', user?.papel);
    // Verificar se é admin após o componente montar
    if (user?.papel !== 'admin') {
      setIsAdminGlobal(false);
      return;
    }
    
    setIsAdminGlobal(true);

    async function loadEmpresas() {
      try {
        const token = localStorage.getItem('custom-auth-token');
        console.log('[EmpresaSelector] loadEmpresas - token exists:', !!token);
        if (!token) return;

        const response = await fetch('/api/admin/empresas', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log('[EmpresaSelector] loadEmpresas - response.ok:', response.ok);
        if (response.ok) {
          const data = await response.json();
          console.log('[EmpresaSelector] loadEmpresas - empresas:', data.empresas);
          setEmpresas(data.empresas || []);
        }
      } catch (error) {
        console.error('[EmpresaSelector] Erro ao carregar empresas:', error);
      }
    }

    loadEmpresas();
  }, [user?.papel]);
  
  // Só exibe para admin
  if (!isAdminGlobal) {
    console.log('[EmpresaSelector] Não é admin, retornando null');
    return null;
  }

  const handleChange = async (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    console.log('[EmpresaSelector] handleChange - value:', value);
    setLoading(true);

    try {
      if (value === 'todas') {
        console.log('[EmpresaSelector] Selecionou TODAS as empresas');
        await setEmpresaAtiva?.(null);
        console.log('[EmpresaSelector] setEmpresaAtiva(null) concluído');
      } else {
        // Usar comparação como string pois e.id pode vir como string do JSON
        const empresa = empresas.find((e) => String(e.id) === value);
        console.log('[EmpresaSelector] Selecionou empresa:', empresa);
        if (empresa) {
          await setEmpresaAtiva?.({
            id: typeof empresa.id === 'string' ? parseInt(empresa.id, 10) : empresa.id,
            nome: empresa.nome,
            logo: empresa.url_logo,
            modelo_negocio: empresa.modelo_negocio as 'produto' | 'servico' | 'ambos',
          });
          console.log('[EmpresaSelector] setEmpresaAtiva concluído');
        } else {
          console.log('[EmpresaSelector] EMPRESA NÃO ENCONTRADA no array!');
        }
      }
    } catch (error) {
      console.error('[EmpresaSelector] Erro no handleChange:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentValue = user?.empresaAtiva?.id?.toString() || 'todas';
  console.log('[EmpresaSelector] currentValue:', currentValue, 'empresaAtiva:', user?.empresaAtiva);

  return (
    <FormControl size="small" sx={{ minWidth: 200, maxWidth: 280 }}>
      <Select
        value={currentValue}
        onChange={(event) => {
          console.log('[EmpresaSelector] onChange DISPARADO! event.target.value:', event.target.value);
          handleChange(event);
        }}
        disabled={loading}
        displayEmpty
        sx={{
          bgcolor: 'background.paper',
          '& .MuiSelect-select': {
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            py: 1,
          },
        }}
        renderValue={(selected) => {
          if (selected === 'todas') {
            return (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem', bgcolor: 'primary.main' }}>
                  T
                </Avatar>
                <Typography variant="body2" noWrap>
                  Todas as empresas
                </Typography>
              </Box>
            );
          }

          const empresa = empresas.find((e) => e.id.toString() === selected);
          if (empresa) {
            return (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar
                  src={empresa.url_logo || undefined}
                  sx={{ width: 24, height: 24, fontSize: '0.75rem' }}
                >
                  {empresa.nome.charAt(0).toUpperCase()}
                </Avatar>
                <Typography variant="body2" noWrap>
                  {empresa.nome}
                </Typography>
              </Box>
            );
          }

          return 'Selecione...';
        }}
      >
        <MenuItem value="todas">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem', bgcolor: 'primary.main' }}>
              T
            </Avatar>
            <Typography variant="body2">Todas as empresas</Typography>
          </Box>
        </MenuItem>
        {empresas.map((empresa) => (
          <MenuItem key={empresa.id} value={empresa.id.toString()}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar
                src={empresa.url_logo || undefined}
                sx={{ width: 24, height: 24, fontSize: '0.75rem' }}
              >
                {empresa.nome.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="body2">{empresa.nome}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                  {empresa.modelo_negocio}
                </Typography>
              </Box>
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
