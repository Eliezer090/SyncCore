/** @type {import('next').NextConfig} */
const config = {
  // Output standalone para Docker (reduz tamanho da imagem)
  output: 'standalone',
  
  // Ignorar erros de ESLint durante o build (para produção)
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Ignorar erros de TypeScript durante o build (para produção)
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Configuração de imagens remotas (se necessário)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ik.imagekit.io',
        pathname: '/**',
      },
    ],
  },
  
  // Desabilitar x-powered-by header
  poweredByHeader: false,
  
  // Habilitar compressão
  compress: true,
  
  // Pacotes Node.js nativos que não devem ser bundlados (necessário para standalone + RabbitMQ)
  serverExternalPackages: ['amqplib'],
  
  // Configuração experimental
  experimental: {
    // Força o uso apenas do App Router
    appDocumentPreloading: false,
    // Habilitar instrumentation hook (necessário em algumas versões do Next.js 15)
    instrumentationHook: true,
  },
};

export default config;
