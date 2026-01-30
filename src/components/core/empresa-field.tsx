'use client';

import * as React from 'react';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import type { Control, FieldValues, Path } from 'react-hook-form';
import { Controller } from 'react-hook-form';

import type { Empresa } from '@/types/database';
import { useUser } from '@/hooks/use-user';

interface EmpresaFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  empresas: Empresa[];
  error?: string;
}

/**
 * Campo de seleção de empresa que:
 * - Mostra o select para admin
 * - Esconde para outros usuários (empresa é preenchida automaticamente)
 */
export function EmpresaField<T extends FieldValues>({
  control,
  name,
  empresas,
  error,
}: EmpresaFieldProps<T>): React.JSX.Element | null {
  const { user } = useUser();
  const isAdminGlobal = user?.papel === 'admin';

  // Só mostra o campo para admin_global
  if (!isAdminGlobal) {
    return null;
  }

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <FormControl fullWidth error={Boolean(error)}>
          <InputLabel>Empresa</InputLabel>
          <Select {...field} label="Empresa">
            {empresas.map((e) => (
              <MenuItem key={e.id} value={e.id}>
                {e.nome}
              </MenuItem>
            ))}
          </Select>
          {error && <FormHelperText>{error}</FormHelperText>}
        </FormControl>
      )}
    />
  );
}
