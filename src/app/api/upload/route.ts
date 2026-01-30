import { NextRequest, NextResponse } from 'next/server';
import { uploadImage } from '@/lib/imagekit';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = formData.get('folder') as string | null;
    const fileName = formData.get('fileName') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'Arquivo não enviado' }, { status: 400 });
    }

    // Converte o arquivo para base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const mimeType = file.type;
    const base64WithMime = `data:${mimeType};base64,${base64}`;

    // Faz upload para o ImageKit
    const result = await uploadImage(base64WithMime, {
      folder: folder || 'uploads',
      fileName: fileName || undefined,
    });

    return NextResponse.json({
      success: true,
      url: result.url,
      fileId: result.fileId,
      name: result.name,
      thumbnailUrl: result.thumbnailUrl,
    });
  } catch (error) {
    console.error('Erro no upload:', error);
    return NextResponse.json({ error: 'Erro ao fazer upload da imagem' }, { status: 500 });
  }
}
