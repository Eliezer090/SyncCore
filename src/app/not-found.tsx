import * as React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';

import { config } from '@/config';
import { paths } from '@/paths';

export const metadata = { title: `Not found | ${config.site.name}` } satisfies Metadata;

export default function NotFound(): React.JSX.Element {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      padding: '20px',
      textAlign: 'center'
    }}>
      <img
        alt="Not found"
        src="/assets/error-404.png"
        style={{ maxWidth: '400px', height: 'auto', marginBottom: '24px' }}
      />
      <h1 style={{ marginBottom: '16px' }}>
        404: A página que você procura não existe
      </h1>
      <p style={{ marginBottom: '24px', color: '#666' }}>
        Você tentou acessar uma rota que não existe ou veio aqui por engano.
      </p>
      <Link 
        href={paths.home}
        style={{
          padding: '12px 24px',
          backgroundColor: '#635bff',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '8px',
          fontSize: '16px'
        }}
      >
        Voltar para o início
      </Link>
    </div>
  );
}
