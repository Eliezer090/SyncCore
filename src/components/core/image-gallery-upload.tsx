'use client';

import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { ImagesIcon } from '@phosphor-icons/react/dist/ssr/Images';
import { PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { StarIcon } from '@phosphor-icons/react/dist/ssr/Star';
import { TrashIcon } from '@phosphor-icons/react/dist/ssr/Trash';
import { UploadSimpleIcon } from '@phosphor-icons/react/dist/ssr/UploadSimple';
import { MagnifyingGlassPlus as ZoomIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlassPlus';

import { compressImage, compressionPresets } from '@/lib/image-compression';
import { ImageLightbox } from './image-lightbox';

export interface GalleryImage {
  id: number;
  url: string;
  ordem: number;
  is_capa: boolean;
}

interface ImageGalleryUploadProps {
  images: GalleryImage[];
  onAdd: (url: string, isCapa?: boolean) => Promise<void>;
  onRemove: (id: number) => Promise<void>;
  onSetCapa: (id: number) => Promise<void>;
  folder?: string;
  label?: string;
  maxImages?: number;
  disabled?: boolean;
}

export function ImageGalleryUpload({
  images,
  onAdd,
  onRemove,
  onSetCapa,
  folder = 'galeria',
  label = 'Galeria de Imagens',
  maxImages = 10,
  disabled = false,
}: ImageGalleryUploadProps): React.JSX.Element {
  const [uploading, setUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState('');
  const [removing, setRemoving] = React.useState<number | null>(null);
  const [settingCapa, setSettingCapa] = React.useState<number | null>(null);
  const [lightboxOpen, setLightboxOpen] = React.useState(false);
  const [lightboxIndex, setLightboxIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validação de tipo
        if (!file.type.startsWith('image/')) {
          console.error('Arquivo não é uma imagem:', file.name);
          continue;
        }

        setUploadProgress(`Comprimindo ${i + 1}/${files.length}...`);

        // Comprimir imagem antes do upload (otimizado para WhatsApp)
        const compressedFile = await compressImage(file, compressionPresets.whatsapp);

        setUploadProgress(`Enviando ${i + 1}/${files.length}...`);

        // Upload para ImageKit
        const formData = new FormData();
        formData.append('file', compressedFile);
        formData.append('folder', folder);
        formData.append('fileName', file.name);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Erro no upload');
        }

        const data = await response.json();
        
        // Primeira imagem é capa automaticamente
        const isCapa = images.length === 0 && i === 0;
        await onAdd(data.url, isCapa);
      }
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
    } finally {
      setUploading(false);
      setUploadProgress('');
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  const handleRemove = async (id: number) => {
    setRemoving(id);
    try {
      await onRemove(id);
    } finally {
      setRemoving(null);
    }
  };

  const handleSetCapa = async (id: number) => {
    setSettingCapa(id);
    try {
      await onSetCapa(id);
    } finally {
      setSettingCapa(null);
    }
  };

  const handleViewImage = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const canAddMore = images.length < maxImages;
  const imageUrls = images.map(img => img.url);

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <ImagesIcon size={20} />
          <Typography variant="subtitle2">{label}</Typography>
          <Typography variant="caption" color="text.secondary">
            ({images.length}/{maxImages})
          </Typography>
        </Stack>
        {canAddMore && (
          <Button
            variant="outlined"
            size="small"
            startIcon={uploading ? <CircularProgress size={16} /> : <PlusIcon />}
            onClick={() => inputRef.current?.click()}
            disabled={disabled || uploading}
          >
            {uploading ? uploadProgress || 'Processando...' : 'Adicionar'}
          </Button>
        )}
      </Stack>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {images.length === 0 ? (
        <Card
          sx={{
            border: '2px dashed',
            borderColor: 'divider',
            borderRadius: 2,
            p: 4,
            textAlign: 'center',
            cursor: disabled ? 'default' : 'pointer',
            '&:hover': !disabled ? { borderColor: 'primary.main', bgcolor: 'action.hover' } : {},
          }}
          onClick={() => !disabled && inputRef.current?.click()}
        >
          {uploading ? (
            <>
              <CircularProgress size={40} />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {uploadProgress || 'Processando...'}
              </Typography>
            </>
          ) : (
            <>
              <UploadSimpleIcon size={40} style={{ opacity: 0.5 }} />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Clique ou arraste imagens para adicionar
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Máximo {maxImages} imagens (compressão automática)
              </Typography>
            </>
          )}
        </Card>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
            gap: 2,
          }}
        >
          {images.map((image, index) => (
            <Card
              key={image.id}
              sx={{
                position: 'relative',
                overflow: 'visible',
                border: image.is_capa ? '2px solid' : '1px solid',
                borderColor: image.is_capa ? 'primary.main' : 'divider',
              }}
            >
              <CardMedia
                component="img"
                image={image.url}
                alt={`Imagem ${image.ordem}`}
                onClick={() => handleViewImage(index)}
                sx={{
                  height: 120,
                  objectFit: 'cover',
                  cursor: 'zoom-in',
                }}
              />
              
              {/* Badge de capa */}
              {image.is_capa && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: -8,
                    left: -8,
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    borderRadius: '50%',
                    width: 24,
                    height: 24,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <StarIcon size={14} weight="fill" />
                </Box>
              )}

              {/* Ações */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  display: 'flex',
                  gap: 0.5,
                }}
              >
                {!image.is_capa && (
                  <Tooltip title="Definir como capa">
                    <IconButton
                      size="small"
                      onClick={() => handleSetCapa(image.id)}
                      disabled={disabled || settingCapa === image.id}
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.9)',
                        '&:hover': { bgcolor: 'rgba(255,255,255,1)' },
                      }}
                    >
                      {settingCapa === image.id ? (
                        <CircularProgress size={14} />
                      ) : (
                        <StarIcon size={14} />
                      )}
                    </IconButton>
                  </Tooltip>
                )}
                <Tooltip title="Remover">
                  <IconButton
                    size="small"
                    onClick={() => handleRemove(image.id)}
                    disabled={disabled || removing === image.id}
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.9)',
                      color: 'error.main',
                      '&:hover': { bgcolor: 'rgba(255,255,255,1)' },
                    }}
                  >
                    {removing === image.id ? (
                      <CircularProgress size={14} />
                    ) : (
                      <TrashIcon size={14} />
                    )}
                  </IconButton>
                </Tooltip>
              </Box>
            </Card>
          ))}

          {/* Botão para adicionar mais */}
          {canAddMore && (
            <Card
              sx={{
                height: 120,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px dashed',
                borderColor: 'divider',
                cursor: disabled ? 'default' : 'pointer',
                '&:hover': !disabled ? { borderColor: 'primary.main', bgcolor: 'action.hover' } : {},
              }}
              onClick={() => !disabled && !uploading && inputRef.current?.click()}
            >
              {uploading ? (
                <CircularProgress size={24} />
              ) : (
                <PlusIcon size={32} style={{ opacity: 0.5 }} />
              )}
            </Card>
          )}
        </Box>
      )}

      {/* Lightbox */}
      {imageUrls.length > 0 && (
        <ImageLightbox
          open={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          images={imageUrls}
          initialIndex={lightboxIndex}
          title={label}
        />
      )}
    </Box>
  );
}
