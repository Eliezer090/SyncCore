'use client';

import * as React from 'react';
import Card from '@mui/material/Card';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import { MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';

interface EmpresasFiltersProps {
  onSearch?: (search: string) => void;
}

export function EmpresasFilters({ onSearch }: EmpresasFiltersProps): React.JSX.Element {
  const [searchValue, setSearchValue] = React.useState('');

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchValue(value);
    onSearch?.(value);
  };

  return (
    <Card sx={{ p: 2 }}>
      <OutlinedInput
        value={searchValue}
        onChange={handleSearchChange}
        fullWidth
        placeholder="Buscar empresas..."
        startAdornment={
          <InputAdornment position="start">
            <MagnifyingGlassIcon fontSize="var(--icon-fontSize-md)" />
          </InputAdornment>
        }
        sx={{ maxWidth: '500px' }}
      />
    </Card>
  );
}
