import ImageKit from '@imagekit/nodejs';

// Configuração do cliente ImageKit (server-side)
const imagekit = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || '',
});

export interface UploadResponse {
  url: string;
  fileId: string;
  name: string;
  thumbnailUrl?: string;
}

export interface UploadOptions {
  folder?: string;
  fileName?: string;
  tags?: string[];
}

/**
 * Upload de imagem para o ImageKit
 * @param file - Base64 ou URL da imagem
 * @param options - Opções de upload (pasta, nome, tags)
 */
export async function uploadImage(
  file: string,
  options: UploadOptions = {}
): Promise<UploadResponse> {
  try {
    const { folder = 'uploads', fileName, tags } = options;

    // Gera nome único se não fornecido
    const finalFileName = fileName || `img_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    const response = await imagekit.files.upload({
      file, // base64 ou URL
      fileName: finalFileName,
      folder,
      tags,
      useUniqueFileName: true,
    });

    return {
      url: response.url || '',
      fileId: response.fileId || '',
      name: response.name || '',
      thumbnailUrl: response.thumbnailUrl || undefined,
    };
  } catch (error) {
    console.error('Erro ao fazer upload para ImageKit:', error);
    throw new Error('Falha ao fazer upload da imagem');
  }
}

/**
 * Deleta uma imagem do ImageKit pelo fileId
 * @param fileId - ID do arquivo no ImageKit
 */
export async function deleteImage(fileId: string): Promise<void> {
  try {
    await imagekit.files.delete(fileId);
  } catch (error) {
    console.error('Erro ao deletar imagem do ImageKit:', error);
    throw new Error('Falha ao deletar imagem');
  }
}

/**
 * Extrai o caminho do arquivo a partir de uma URL do ImageKit
 * @param url - URL completa da imagem (ex: https://ik.imagekit.io/agencia/pasta/arquivo.jpg)
 * @returns Caminho do arquivo (ex: /pasta/arquivo.jpg)
 */
export function extractPathFromUrl(url: string): string | null {
  try {
    const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/agencia';
    if (!url.startsWith(urlEndpoint)) {
      return null;
    }
    // Remove o endpoint e retorna o caminho
    return url.replace(urlEndpoint, '');
  } catch {
    return null;
  }
}

/**
 * Busca um arquivo no ImageKit pelo nome
 * @param fileName - Nome do arquivo para buscar
 */
export async function findFileByName(fileName: string): Promise<string | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const files = await (imagekit as any).assets.list({
      searchQuery: `name="${fileName}"`,
      limit: 1,
      type: 'file',
    });
    
    if (files && files.length > 0 && files[0].fileId) {
      return files[0].fileId;
    }
    return null;
  } catch (error) {
    console.error('Erro ao buscar arquivo no ImageKit:', error);
    return null;
  }
}

/**
 * Deleta uma imagem do ImageKit pela URL
 * @param url - URL completa da imagem
 */
export async function deleteImageByUrl(url: string): Promise<boolean> {
  try {
    // Extrai o nome do arquivo da URL
    const urlParts = url.split('/');
    const fileName = urlParts[urlParts.length - 1];
    
    if (!fileName) {
      console.warn('Não foi possível extrair o nome do arquivo da URL:', url);
      return false;
    }

    // Busca o arquivo pelo nome
    const fileId = await findFileByName(fileName);
    
    if (!fileId) {
      console.warn('Arquivo não encontrado no ImageKit:', fileName);
      return false;
    }

    // Deleta o arquivo
    await imagekit.files.delete(fileId);
    console.log('Imagem deletada do ImageKit:', fileName);
    return true;
  } catch (error) {
    console.error('Erro ao deletar imagem do ImageKit pela URL:', error);
    return false;
  }
}

/**
 * Retorna a configuração pública do ImageKit
 */
export function getImageKitConfig() {
  return {
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY || '',
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/agencia',
  };
}

export default imagekit;
