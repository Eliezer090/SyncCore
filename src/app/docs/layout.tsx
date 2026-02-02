'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  House, 
  Rocket, 
  Buildings, 
  UsersThree,
  Cube,
  Scissors,
  Calendar,
  ShoppingCart,
  Gear,
  CaretDown,
  CaretRight,
  List as ListIcon,
  SignIn,
  BookOpen,
  Question,
} from '@phosphor-icons/react';

const DRAWER_WIDTH = 280;

interface NavSection {
  title: string;
  icon: React.ReactNode;
  items: { title: string; href: string }[];
}

const navSections: NavSection[] = [
  {
    title: 'Introdução',
    icon: <House size={20} />,
    items: [
      { title: 'Visão Geral', href: '/docs' },
      { title: 'Primeiros Passos', href: '/docs/primeiros-passos' },
      { title: 'Modelos de Negócio', href: '/docs/modelos-negocio' },
    ],
  },
  {
    title: 'Fluxos de Cadastro',
    icon: <Rocket size={20} />,
    items: [
      { title: 'Empresa de Produtos', href: '/docs/fluxos/produtos' },
      { title: 'Empresa de Serviços', href: '/docs/fluxos/servicos' },
      { title: 'Empresa Mista (Ambos)', href: '/docs/fluxos/ambos' },
    ],
  },
  {
    title: 'Módulo Geral',
    icon: <Buildings size={20} />,
    items: [
      { title: 'Empresas', href: '/docs/modulos/empresas' },
      { title: 'Usuários', href: '/docs/modulos/usuarios' },
      { title: 'Clientes', href: '/docs/modulos/clientes' },
      { title: 'Endereços', href: '/docs/modulos/enderecos' },
      { title: 'Horários da Empresa', href: '/docs/modulos/horarios-empresa' },
    ],
  },
  {
    title: 'Produtos & Pedidos',
    icon: <Cube size={20} />,
    items: [
      { title: 'Categorias', href: '/docs/modulos/categorias' },
      { title: 'Produtos', href: '/docs/modulos/produtos' },
      { title: 'Variações', href: '/docs/modulos/variacoes' },
      { title: 'Adicionais', href: '/docs/modulos/adicionais' },
      { title: 'Estoque', href: '/docs/modulos/estoque' },
      { title: 'Pedidos', href: '/docs/modulos/pedidos' },
      { title: 'Pagamentos', href: '/docs/modulos/pagamentos' },
    ],
  },
  {
    title: 'Serviços & Agenda',
    icon: <Scissors size={20} />,
    items: [
      { title: 'Serviços', href: '/docs/modulos/servicos' },
      { title: 'Profissionais', href: '/docs/modulos/profissionais' },
      { title: 'Serviços do Profissional', href: '/docs/modulos/servicos-profissional' },
      { title: 'Expediente', href: '/docs/modulos/expediente' },
      { title: 'Bloqueios', href: '/docs/modulos/bloqueios' },
      { title: 'Agendamentos', href: '/docs/modulos/agendamentos' },
    ],
  },
  {
    title: 'Configurações',
    icon: <Gear size={20} />,
    items: [
      { title: 'Permissões', href: '/docs/modulos/permissoes' },
      { title: 'Minha Conta', href: '/docs/modulos/minha-conta' },
      { title: 'Integração WhatsApp', href: '/docs/modulos/whatsapp' },
    ],
  },
  {
    title: 'FAQ',
    icon: <Question size={20} />,
    items: [
      { title: 'Perguntas Frequentes', href: '/docs/faq' },
      { title: 'Solução de Problemas', href: '/docs/solucao-problemas' },
    ],
  },
];

function NavItem({ section }: { section: NavSection }) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(() => 
    section.items.some(item => pathname === item.href)
  );

  return (
    <>
      <ListItem disablePadding>
        <ListItemButton onClick={() => setOpen(!open)}>
          <ListItemIcon sx={{ minWidth: 36, color: 'primary.main' }}>
            {section.icon}
          </ListItemIcon>
          <ListItemText 
            primary={section.title} 
            primaryTypographyProps={{ fontWeight: 600, fontSize: '0.875rem' }}
          />
          {open ? <CaretDown size={16} /> : <CaretRight size={16} />}
        </ListItemButton>
      </ListItem>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {section.items.map((item) => (
            <ListItem key={item.href} disablePadding>
              <ListItemButton
                component={Link}
                href={item.href}
                selected={pathname === item.href}
                sx={{ 
                  pl: 6,
                  '&.Mui-selected': {
                    bgcolor: 'primary.lighter',
                    borderRight: '3px solid',
                    borderColor: 'primary.main',
                    '&:hover': { bgcolor: 'primary.lighter' },
                  },
                }}
              >
                <ListItemText 
                  primary={item.title} 
                  primaryTypographyProps={{ fontSize: '0.8125rem' }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Collapse>
    </>
  );
}

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* AppBar */}
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: 'background.paper',
          color: 'text.primary',
          boxShadow: 1,
        }}
      >
        <Toolbar>
          <BookOpen size={28} style={{ marginRight: 12 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
            SyncCore - Documentação
          </Typography>
          <IconButton 
            component={Link} 
            href="/auth/sign-in"
            color="primary"
            sx={{ 
              border: '1px solid',
              borderColor: 'primary.main',
              borderRadius: 2,
              px: 2,
              gap: 1,
            }}
          >
            <SignIn size={20} />
            <Typography variant="button">Acessar Sistema</Typography>
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Drawer lateral */}
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            borderRight: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.default',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto', py: 2 }}>
          <List>
            {navSections.map((section) => (
              <NavItem key={section.title} section={section} />
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Conteúdo principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          p: 3,
          mt: 8,
          minHeight: '100vh',
        }}
      >
        <Container maxWidth="lg">
          {children}
        </Container>
      </Box>
    </Box>
  );
}
