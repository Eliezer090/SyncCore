'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import { BellIcon } from '@phosphor-icons/react/dist/ssr/Bell';
import { ListIcon } from '@phosphor-icons/react/dist/ssr/List';

import { usePopover } from '@/hooks/use-popover';
import { useUser } from '@/hooks/use-user';
import { useNotificacoes } from '@/hooks/use-notificacoes';

import { EmpresaSelector } from './empresa-selector';
import { MobileNav } from './mobile-nav';
import { UserPopover } from './user-popover';
import { NotificationPopover } from './notification-popover';
import { AlertaAtendimentoHumano } from './alerta-atendimento';

export function MainNav(): React.JSX.Element {
  const [openNav, setOpenNav] = React.useState<boolean>(false);
  const { user } = useUser();
  const { naoLidas } = useNotificacoes();

  const userPopover = usePopover<HTMLDivElement>();
  const notificationPopover = usePopover<HTMLButtonElement>();

  return (
    <React.Fragment>
      <Box
        component="header"
        sx={{
          borderBottom: '1px solid var(--mui-palette-divider)',
          backgroundColor: 'var(--mui-palette-background-paper)',
          position: 'sticky',
          top: 0,
          zIndex: 'var(--mui-zIndex-appBar)',
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          sx={{ alignItems: 'center', justifyContent: 'space-between', minHeight: '64px', px: 2 }}
        >
          <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
            <IconButton
              onClick={(): void => {
                setOpenNav(true);
              }}
              sx={{ display: { lg: 'none' } }}
            >
              <ListIcon />
            </IconButton>
            {/* Seletor de empresa para admin global */}
            <EmpresaSelector />
          </Stack>
          <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
            <Tooltip title="Notificações">
              <IconButton
                ref={notificationPopover.anchorRef}
                onClick={notificationPopover.handleOpen}
              >
                <Badge 
                  badgeContent={naoLidas} 
                  color="error"
                  max={99}
                >
                  <BellIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            <Tooltip title={user?.nome || 'Usuário'}>
              <Avatar
                onClick={userPopover.handleOpen}
                ref={userPopover.anchorRef}
                src={user?.avatar || undefined}
                sx={{ 
                  cursor: 'pointer',
                  bgcolor: 'var(--mui-palette-primary-main)',
                }}
              >
                {user?.nome?.charAt(0)?.toUpperCase() || 'U'}
              </Avatar>
            </Tooltip>
          </Stack>
        </Stack>
      </Box>
      <UserPopover anchorEl={userPopover.anchorRef.current} onClose={userPopover.handleClose} open={userPopover.open} />
      <NotificationPopover anchorEl={notificationPopover.anchorRef.current} onClose={notificationPopover.handleClose} open={notificationPopover.open} />
      <AlertaAtendimentoHumano />
      <MobileNav
        onClose={() => {
          setOpenNav(false);
        }}
        open={openNav}
      />
    </React.Fragment>
  );
}
