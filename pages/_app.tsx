// Este arquivo é necessário para o Pages Router interno do Next.js
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
