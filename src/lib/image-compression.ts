'use client';

import imageCompression from 'browser-image-compression';

export interface CompressionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useWebWorker?: boolean;
  quality?: number;
}

const defaultOptions: CompressionOptions = {
  maxSizeMB: 1, // Máximo 1MB
  maxWidthOrHeight: 1920, // Largura/altura máxima de 1920px
  useWebWorker: true,
  quality: 0.8, // 80% de qualidade
};

/**
 * Comprime uma imagem para otimizar o envio
 * Ideal para imagens que serão exibidas no WhatsApp
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const mergedOptions = { ...defaultOptions, ...options };

  // Validar se é uma imagem
  if (!file.type.startsWith('image/')) {
    console.warn('Arquivo não é uma imagem:', file.name);
    return file;
  }

  const originalSizeMB = file.size / 1024 / 1024;

  try {
    const compressedFile = await imageCompression(file, {
      maxSizeMB: mergedOptions.maxSizeMB,
      maxWidthOrHeight: mergedOptions.maxWidthOrHeight,
      useWebWorker: mergedOptions.useWebWorker,
      initialQuality: mergedOptions.quality,
      fileType: file.type as 'image/jpeg' | 'image/png' | 'image/webp',
      alwaysKeepResolution: false,
    });

    const compressedSizeMB = compressedFile.size / 1024 / 1024;
    
    console.log(
      `📷 ${file.name}: ${originalSizeMB.toFixed(2)}MB → ${compressedSizeMB.toFixed(2)}MB (${Math.round((1 - compressedSizeMB / originalSizeMB) * 100)}% redução)`
    );

    return compressedFile;
  } catch (error) {
    console.error('Erro ao comprimir imagem:', error);
    return file; // Retorna o arquivo original em caso de erro
  }
}

/**
 * Comprime múltiplas imagens em paralelo
 */
export async function compressImages(
  files: File[],
  options: CompressionOptions = {}
): Promise<File[]> {
  return Promise.all(files.map((file) => compressImage(file, options)));
}

/**
 * Presets de compressão para diferentes casos de uso
 */
export const compressionPresets = {
  // Para WhatsApp - máxima compressão mantendo qualidade visual
  whatsapp: {
    maxSizeMB: 0.5, // 500KB
    maxWidthOrHeight: 1280,
    quality: 0.75,
  },
  // Para galeria de produtos - boa qualidade
  product: {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    quality: 0.8,
  },
  // Para avatares/fotos de perfil - bem compacto
  avatar: {
    maxSizeMB: 0.2, // 200KB
    maxWidthOrHeight: 512,
    quality: 0.8,
  },
  // Para comprovantes - precisa ser legível
  document: {
    maxSizeMB: 1,
    maxWidthOrHeight: 2048,
    quality: 0.85,
  },
} as const;
