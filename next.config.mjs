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
  
  // Configuração experimental para evitar problemas com páginas de erro
  experimental: {
    // Força o uso apenas do App Router
    appDocumentPreloading: false,
  },
};

export default config;
