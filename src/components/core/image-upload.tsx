'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Camera as CameraIcon } from '@phosphor-icons/react/dist/ssr/Camera';
import { Image as ImageIcon } from '@phosphor-icons/react/dist/ssr/Image';
import { MagnifyingGlassPlus as ZoomIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlassPlus';
import { Trash as TrashIcon } from '@phosphor-icons/react/dist/ssr/Trash';

import { compressImage, compressionPresets, type CompressionOptions } from '@/lib/image-compression';

import { ImageLightbox } from './image-lightbox';

type CompressionPreset = 'whatsapp' | 'product' | 'avatar' | 'document';

interface ImageUploadProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  folder?: string;
  label?: string;
  variant?: 'avatar' | 'card' | 'banner';
  disabled?: boolean;
  width?: number | string;
  height?: number | string;
  compressionPreset?: CompressionPreset;
}

export function ImageUpload({
  value,
  onChange,
  folder = 'uploads',
  label = 'Imagem',
  variant = 'card',
  disabled = false,
  width = 150,
  height = 150,
  compressionPreset = 'product',
}: ImageUploadProps): React.JSX.Element {
  const [loading, setLoading] = React.useState(false);
  const [loadingText, setLoadingText] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const getCompressionOptions = (): CompressionOptions => {
    if (variant === 'avatar') {
      return compressionPresets.avatar;
    }
    return compressionPresets[compressionPreset];
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione uma imagem válida');
      return;
    }

    setLoading(true);
    setLoadingText('Comprimindo...');
    setError(null);

    try {
      const compressedFile = await compressImage(file, getCompressionOptions());
      setLoadingText('Enviando...');

      const formData = new FormData();
      formData.append('file', compressedFile);
      formData.append('folder', folder);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erro ao fazer upload');
      }

      const data = await response.json();
      onChange(data.url);
    } catch (err) {
      console.error('Erro no upload:', err);
      setError('Erro ao fazer upload da imagem');
    } finally {
      setLoading(false);
      setLoadingText('');
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    onChange(null);
  };

  const handleUploadClick = () => {
    if (!disabled && !loading) {
      inputRef.current?.click();
    }
  };

  const handleViewImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (value) {
      setLightboxOpen(true);
    }
  };

  // Render para variant avatar
  if (variant === 'avatar') {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handleFileSelect}
          disabled={disabled}
        />
        <Box sx={{ position: 'relative' }}>
          <Avatar
            src={value || undefined}
            sx={{
              width: typeof width === 'number' ? width : 100,
              height: typeof height === 'number' ? height : 100,
              cursor: value ? 'zoom-in' : disabled ? 'default' : 'pointer',
              bgcolor: 'grey.200',
            }}
            onClick={value ? handleViewImage : handleUploadClick}
          >
            {!value && !loading && <CameraIcon size={32} />}
            {loading && <CircularProgress size={32} />}
          </Avatar>
          {value && !disabled && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
              sx={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                bgcolor: 'error.main',
                color: 'white',
                '&:hover': { bgcolor: 'error.dark' },
              }}
            >
              <TrashIcon size={16} />
            </IconButton>
          )}
          {value && !disabled && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleUploadClick();
              }}
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': { bgcolor: 'primary.dark' },
              }}
            >
              <CameraIcon size={16} />
            </IconButton>
          )}
        </Box>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
        {error && (
          <Typography variant="caption" color="error">
            {error}
          </Typography>
        )}
        {value && (
          <ImageLightbox
            open={lightboxOpen}
            onClose={() => setLightboxOpen(false)}
            images={[value]}
            title={label}
          />
        )}
      </Box>
    );
  }

  // Render para variant card e banner
  const isCard = variant === 'card';
  const boxHeight = isCard ? height : 200;
  const boxWidth = isCard ? width : '100%';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Typography variant="body2" fontWeight="medium">
        {label}
      </Typography>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleFileSelect}
        disabled={disabled}
      />
      <Box
        onClick={value ? undefined : handleUploadClick}
        sx={{
          width: boxWidth,
          height: boxHeight,
          border: '2px dashed',
          borderColor: error ? 'error.main' : 'grey.300',
          borderRadius: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: value ? 'default' : disabled ? 'default' : 'pointer',
          overflow: 'hidden',
          position: 'relative',
          bgcolor: value ? 'transparent' : 'grey.50',
          '&:hover': value
            ? {}
            : {
                borderColor: disabled ? 'grey.300' : 'primary.main',
                bgcolor: disabled ? 'grey.50' : 'primary.50',
              },
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            <CircularProgress />
            {loadingText && (
              <Typography variant="caption" color="text.secondary">
                {loadingText}
              </Typography>
            )}
          </Box>
        ) : value ? (
          <>
            <Box
              component="img"
              src={value}
              alt={label}
              onClick={handleViewImage}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                cursor: 'zoom-in',
              }}
            />
            {!disabled && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  bgcolor: 'rgba(0,0,0,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1,
                  opacity: 0,
                  transition: 'opacity 0.2s',
                  '&:hover': { opacity: 1 },
                }}
              >
                <Stack direction="row" spacing={1}>
                  <IconButton
                    onClick={handleViewImage}
                    sx={{
                      bgcolor: 'white',
                      '&:hover': { bgcolor: 'grey.100' },
                    }}
                  >
                    <ZoomIcon size={20} />
                  </IconButton>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUploadClick();
                    }}
                    sx={{
                      bgcolor: 'white',
                      '&:hover': { bgcolor: 'grey.100' },
                    }}
                  >
                    <CameraIcon size={20} />
                  </IconButton>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove();
                    }}
                    sx={{
                      bgcolor: 'white',
                      color: 'error.main',
                      '&:hover': { bgcolor: 'grey.100' },
                    }}
                  >
                    <TrashIcon size={20} />
                  </IconButton>
                </Stack>
              </Box>
            )}
          </>
        ) : (
          <>
            <ImageIcon size={48} color="#9e9e9e" />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Clique para fazer upload
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Imagem será comprimida automaticamente
            </Typography>
          </>
        )}
      </Box>
      {error && (
        <Typography variant="caption" color="error">
          {error}
        </Typography>
      )}
      {value && (
        <ImageLightbox
          open={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          images={[value]}
          title={label}
        />
      )}
    </Box>
  );
}
