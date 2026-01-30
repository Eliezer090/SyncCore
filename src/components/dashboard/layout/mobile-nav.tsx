'use client';

import * as React from 'react';
import RouterLink from 'next/link';
import { usePathname } from 'next/navigation';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { CaretDownIcon } from '@phosphor-icons/react/dist/ssr/CaretDown';
import { CaretRightIcon } from '@phosphor-icons/react/dist/ssr/CaretRight';
import { CaretUpDownIcon } from '@phosphor-icons/react/dist/ssr/CaretUpDown';

import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';
import { isNavItemActive } from '@/lib/is-nav-item-active';
import { Logo } from '@/components/core/logo';
import { useNavItems, type NavGroupConfig } from '@/hooks/use-nav-items';

import { navIcons } from './nav-icons';

export interface MobileNavProps {
  onClose?: () => void;
  open?: boolean;
  items?: NavItemConfig[];
}

export function MobileNav({ open, onClose }: MobileNavProps): React.JSX.Element {
  const pathname = usePathname();
  const { navGroups, isLoading } = useNavItems();
  const [expandedItems, setExpandedItems] = React.useState<Record<string, boolean>>({});

  // Auto-expandir itens que contém a rota atual
  React.useEffect(() => {
    const newExpanded: Record<string, boolean> = {};
    navGroups.forEach(group => {
      group.items.forEach(item => {
        if (item.items) {
          const hasActiveChild = item.items.some(child => 
            child.href && pathname.startsWith(child.href)
          );
          if (hasActiveChild) {
            newExpanded[item.key] = true;
          }
        }
      });
    });
    setExpandedItems(prev => ({ ...prev, ...newExpanded }));
  }, [pathname, navGroups]);

  const toggleExpand = (key: string) => {
    setExpandedItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Drawer
      PaperProps={{
        sx: {
          '--MobileNav-background': 'var(--mui-palette-neutral-950)',
          '--MobileNav-color': 'var(--mui-palette-common-white)',
          '--NavItem-color': 'var(--mui-palette-neutral-300)',
          '--NavItem-hover-background': 'rgba(255, 255, 255, 0.04)',
          '--NavItem-active-background': 'var(--mui-palette-primary-main)',
          '--NavItem-active-color': 'var(--mui-palette-primary-contrastText)',
          '--NavItem-disabled-color': 'var(--mui-palette-neutral-500)',
          '--NavItem-icon-color': 'var(--mui-palette-neutral-400)',
          '--NavItem-icon-active-color': 'var(--mui-palette-primary-contrastText)',
          '--NavItem-icon-disabled-color': 'var(--mui-palette-neutral-600)',
          bgcolor: 'var(--MobileNav-background)',
          color: 'var(--MobileNav-color)',
          display: 'flex',
          flexDirection: 'column',
          maxWidth: '100%',
          scrollbarWidth: 'none',
          width: 'var(--MobileNav-width)',
          zIndex: 'var(--MobileNav-zIndex)',
          '&::-webkit-scrollbar': { display: 'none' },
        },
      }}
      onClose={onClose}
      open={open}
    >
      <Stack spacing={2} sx={{ p: 3 }}>
        <Box component={RouterLink} href={paths.home} sx={{ display: 'inline-flex' }}>
          <Logo color="light" height={32} width={122} />
        </Box>
        <Box
          sx={{
            alignItems: 'center',
            backgroundColor: 'var(--mui-palette-neutral-950)',
            border: '1px solid var(--mui-palette-neutral-700)',
            borderRadius: '12px',
            cursor: 'pointer',
            display: 'flex',
            p: '4px 12px',
          }}
        >
          <Box sx={{ flex: '1 1 auto' }}>
            <Typography color="var(--mui-palette-neutral-400)" variant="body2">
              Workspace
            </Typography>
            <Typography color="inherit" variant="subtitle1">
              Sistema
            </Typography>
          </Box>
          <CaretUpDownIcon />
        </Box>
      </Stack>
      <Divider sx={{ borderColor: 'var(--mui-palette-neutral-700)' }} />
      <Box component="nav" sx={{ flex: '1 1 auto', p: '12px', overflowY: 'auto' }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={24} sx={{ color: 'var(--NavItem-color)' }} />
          </Box>
        ) : (
          <Stack spacing={2}>
            {navGroups.map((group) => (
              <NavGroup 
                key={group.key} 
                group={group} 
                pathname={pathname} 
                expandedItems={expandedItems}
                onToggle={toggleExpand}
                onClose={onClose}
              />
            ))}
          </Stack>
        )}
      </Box>
    </Drawer>
  );
}

// Componente para renderizar um grupo de navegação
function NavGroup({ 
  group, 
  pathname, 
  expandedItems, 
  onToggle,
  onClose
}: { 
  group: NavGroupConfig; 
  pathname: string; 
  expandedItems: Record<string, boolean>;
  onToggle: (key: string) => void;
  onClose?: () => void;
}): React.JSX.Element {
  return (
    <Box>
      <Typography
        sx={{
          color: 'var(--mui-palette-neutral-500)',
          fontSize: '0.75rem',
          fontWeight: 600,
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
          px: 2,
          py: 1,
        }}
      >
        {group.title}
      </Typography>
      <Stack component="ul" spacing={0.5} sx={{ listStyle: 'none', m: 0, p: 0 }}>
        {group.items.map((item) => (
          <NavItem 
            key={item.key} 
            item={item} 
            pathname={pathname} 
            expandedItems={expandedItems}
            onToggle={onToggle}
            onClose={onClose}
            depth={0}
          />
        ))}
      </Stack>
    </Box>
  );
}

// Componente para renderizar um item de navegação (com suporte a subitens)
function NavItem({ 
  item, 
  pathname, 
  expandedItems, 
  onToggle,
  onClose,
  depth = 0
}: { 
  item: NavItemConfig; 
  pathname: string; 
  expandedItems: Record<string, boolean>;
  onToggle: (key: string) => void;
  onClose?: () => void;
  depth?: number;
}): React.JSX.Element {
  const { key, disabled, external, href, icon, matcher, title, items } = item;
  const hasChildren = items && items.length > 0;
  const isExpanded = expandedItems[key] ?? false;
  const active = isNavItemActive({ disabled, external, href, matcher, pathname });
  const Icon = icon ? navIcons[icon] : null;
  
  // Verificar se algum filho está ativo
  const hasActiveChild = hasChildren && items.some(child => 
    child.href && pathname.startsWith(child.href)
  );

  const handleClick = () => {
    if (hasChildren) {
      onToggle(key);
    } else if (onClose) {
      onClose();
    }
  };

  return (
    <li>
      <Box
        {...(href && !hasChildren
          ? {
              component: external ? 'a' : RouterLink,
              href,
              target: external ? '_blank' : undefined,
              rel: external ? 'noreferrer' : undefined,
              onClick: onClose,
            }
          : { role: 'button', onClick: handleClick })}
        sx={{
          alignItems: 'center',
          borderRadius: 1,
          color: 'var(--NavItem-color)',
          cursor: 'pointer',
          display: 'flex',
          flex: '0 0 auto',
          gap: 1,
          p: '6px 16px',
          pl: depth > 0 ? `${16 + depth * 16}px` : '16px',
          position: 'relative',
          textDecoration: 'none',
          whiteSpace: 'nowrap',
          '&:hover': {
            bgcolor: 'var(--NavItem-hover-background)',
          },
          ...(disabled && {
            bgcolor: 'var(--NavItem-disabled-background)',
            color: 'var(--NavItem-disabled-color)',
            cursor: 'not-allowed',
          }),
          ...((active || hasActiveChild) && !hasChildren && { 
            bgcolor: 'var(--NavItem-active-background)', 
            color: 'var(--NavItem-active-color)' 
          }),
          ...(hasActiveChild && hasChildren && {
            color: 'var(--mui-palette-primary-main)',
          }),
        }}
      >
        <Box sx={{ alignItems: 'center', display: 'flex', justifyContent: 'center', flex: '0 0 auto' }}>
          {Icon ? (
            <Icon
              fill={(active && !hasChildren) ? 'var(--NavItem-icon-active-color)' : hasActiveChild ? 'var(--mui-palette-primary-main)' : 'var(--NavItem-icon-color)'}
              fontSize="var(--icon-fontSize-md)"
              weight={(active && !hasChildren) || hasActiveChild ? 'fill' : undefined}
            />
          ) : null}
        </Box>
        <Box sx={{ flex: '1 1 auto' }}>
          <Typography
            component="span"
            sx={{ color: 'inherit', fontSize: '0.875rem', fontWeight: 500, lineHeight: '28px' }}
          >
            {title}
          </Typography>
        </Box>
        {hasChildren && (
          <Box sx={{ alignItems: 'center', display: 'flex', justifyContent: 'center' }}>
            {isExpanded ? (
              <CaretDownIcon fontSize="var(--icon-fontSize-sm)" />
            ) : (
              <CaretRightIcon fontSize="var(--icon-fontSize-sm)" />
            )}
          </Box>
        )}
      </Box>
      
      {/* Subitens com animação de collapse */}
      {hasChildren && (
        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
          <Stack component="ul" spacing={0.5} sx={{ listStyle: 'none', m: 0, p: 0, mt: 0.5 }}>
            {items.map((child) => (
              <NavItem 
                key={child.key} 
                item={child} 
                pathname={pathname}
                expandedItems={expandedItems}
                onToggle={onToggle}
                onClose={onClose}
                depth={depth + 1}
              />
            ))}
          </Stack>
        </Collapse>
      )}
    </li>
  );
}
