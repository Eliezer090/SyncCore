// Este arquivo é necessário para evitar erros de build com o Pages Router interno do Next.js
// quando usando MUI + App Router
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="pt-BR">
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
