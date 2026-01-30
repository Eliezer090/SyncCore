'use client';

import * as React from 'react';
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import { CaretLeft as CaretLeftIcon } from '@phosphor-icons/react/dist/ssr/CaretLeft';
import { CaretRight as CaretRightIcon } from '@phosphor-icons/react/dist/ssr/CaretRight';
import { X as CloseIcon } from '@phosphor-icons/react/dist/ssr/X';

interface ImageLightboxProps {
  open: boolean;
  onClose: () => void;
  images: string[];
  initialIndex?: number;
  title?: string;
}

export function ImageLightbox({
  open,
  onClose,
  images,
  initialIndex = 0,
  title,
}: ImageLightboxProps): React.JSX.Element {
  const [currentIndex, setCurrentIndex] = React.useState(initialIndex);

  // Reset index when opening with new initialIndex
  React.useEffect(() => {
    if (open) {
      setCurrentIndex(initialIndex);
    }
  }, [open, initialIndex]);

  // Keyboard navigation
  React.useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrevious();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, currentIndex, images.length]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  if (images.length === 0) return <></>;

  const currentImage = images[currentIndex];
  const hasMultiple = images.length > 1;

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{
        backdrop: {
          timeout: 300,
          sx: { bgcolor: 'rgba(0, 0, 0, 0.9)' },
        },
      }}
    >
      <Box
        sx={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          outline: 'none',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2,
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {title && (
              <Typography variant="subtitle1" color="white">
                {title}
              </Typography>
            )}
            {hasMultiple && (
              <Typography variant="body2" color="grey.400">
                {currentIndex + 1} / {images.length}
              </Typography>
            )}
          </Box>
          <IconButton onClick={onClose} sx={{ color: 'white' }}>
            <CloseIcon size={28} />
          </IconButton>
        </Box>

        {/* Image container */}
        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            px: { xs: 2, md: 8 },
            py: { xs: 8, md: 10 },
          }}
          onClick={onClose}
        >
          {/* Previous button */}
          {hasMultiple && (
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                handlePrevious();
              }}
              sx={{
                position: 'absolute',
                left: { xs: 8, md: 24 },
                zIndex: 2,
                color: 'white',
                bgcolor: 'rgba(0, 0, 0, 0.5)',
                '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.7)' },
              }}
            >
              <CaretLeftIcon size={32} />
            </IconButton>
          )}

          {/* Image */}
          <Box
            component="img"
            src={currentImage}
            alt={`Imagem ${currentIndex + 1}`}
            onClick={(e) => e.stopPropagation()}
            sx={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              borderRadius: 1,
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              cursor: 'default',
            }}
          />

          {/* Next button */}
          {hasMultiple && (
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              sx={{
                position: 'absolute',
                right: { xs: 8, md: 24 },
                zIndex: 2,
                color: 'white',
                bgcolor: 'rgba(0, 0, 0, 0.5)',
                '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.7)' },
              }}
            >
              <CaretRightIcon size={32} />
            </IconButton>
          )}
        </Box>

        {/* Thumbnails for multiple images */}
        {hasMultiple && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              display: 'flex',
              justifyContent: 'center',
              gap: 1,
              p: 2,
              bgcolor: 'rgba(0, 0, 0, 0.5)',
              overflowX: 'auto',
            }}
          >
            {images.map((img, index) => (
              <Box
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(index);
                }}
                sx={{
                  width: 60,
                  height: 60,
                  flexShrink: 0,
                  borderRadius: 1,
                  overflow: 'hidden',
                  border: '2px solid',
                  borderColor: index === currentIndex ? 'primary.main' : 'transparent',
                  opacity: index === currentIndex ? 1 : 0.6,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': { opacity: 1 },
                }}
              >
                <Box
                  component="img"
                  src={img}
                  alt={`Thumbnail ${index + 1}`}
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Modal>
  );
}

// Hook para facilitar o uso do lightbox
export function useImageLightbox() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [images, setImages] = React.useState<string[]>([]);
  const [initialIndex, setInitialIndex] = React.useState(0);

  const openLightbox = React.useCallback((imgs: string | string[], index = 0) => {
    const imageArray = Array.isArray(imgs) ? imgs : [imgs];
    setImages(imageArray);
    setInitialIndex(index);
    setIsOpen(true);
  }, []);

  const closeLightbox = React.useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    isOpen,
    images,
    initialIndex,
    openLightbox,
    closeLightbox,
  };
}
