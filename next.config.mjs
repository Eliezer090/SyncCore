/** @type {import('next').NextConfig} */
const config = {
  // Output standalone para Docker (reduz tamanho da imagem)
  output: 'standalone',
  
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
};

export default config;
