'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { useUser } from '@/hooks/use-user';

export function AccountInfo(): React.JSX.Element {
  const { user } = useUser();

  return (
    <Card>
      <CardContent>
        <Stack spacing={2} sx={{ alignItems: 'center' }}>
          <div>
            <Avatar 
              src={user?.avatar || '/assets/avatar.png'} 
              sx={{ height: '80px', width: '80px' }}
            >
              {user?.nome?.charAt(0).toUpperCase()}
            </Avatar>
          </div>
          <Stack spacing={1} sx={{ textAlign: 'center' }}>
            <Typography variant="h5">{user?.nome || 'Carregando...'}</Typography>
            <Typography color="text.secondary" variant="body2">
              {user?.email}
            </Typography>
            <Typography color="text.secondary" variant="body2" sx={{ textTransform: 'capitalize' }}>
              {user?.papel?.replace('_', ' ')}
            </Typography>
            {user?.empresa && (
              <Typography color="primary" variant="body2">
                {user.empresa.nome}
              </Typography>
            )}
          </Stack>
        </Stack>
      </CardContent>
      <Divider />
      <CardActions>
        <Button fullWidth variant="text">
          Upload picture
        </Button>
      </CardActions>
    </Card>
  );
}
