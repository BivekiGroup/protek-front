import React, { useState, useCallback, useEffect, useRef } from "react";

interface ProductImageGalleryProps {
  imageUrl?: string;
  images?: string[]; // изображения из CMS/внутреннего источника
  partsIndexImages?: string[]; // устаревший источник (Parts Index), используем как последний фолбэк
}

export default function ProductImageGallery({ imageUrl, images, partsIndexImages }: ProductImageGalleryProps) {
  // Убираем defaultImage - больше не используем заглушку
  // const defaultImage = "/images/image-10.png";
  
  // Функция определения мокап/плейсхолдер изображения
  const isPlaceholder = (url?: string) => {
    if (!url) return true;
    const u = url.toLowerCase();
    return (
      u.includes('image-10') ||
      u.includes('noimage') ||
      u.includes('placeholder') ||
      u.includes('mock') ||
      u.includes('mockup') ||
      u.includes('akum') ||
      u.includes('akkum') ||
      u.includes('akku') ||
      u.includes('accum') ||
      u.includes('accumulator') ||
      u.includes('battery') ||
      u.includes('/akb')
    );
  };

  // Объединяем все доступные изображения, приоритет: CMS images -> imageUrl -> PartsIndex
  const rawImages = [
    ...(images && images.length > 0 ? images : []),
    ...(imageUrl ? [imageUrl] : []),
    ...(partsIndexImages && partsIndexImages.length > 0 ? partsIndexImages : [])
  ].filter(Boolean) as string[];

  // Удаляем дубликаты и откладываем плейсхолдеры в конец (или исключаем, если есть реальные)
  const unique = Array.from(new Set(rawImages));
  const real = unique.filter(u => !isPlaceholder(u));
  const placeholders = unique.filter(u => isPlaceholder(u));
  // Если есть реальные изображения — показываем только их. Плейсхолдеры скрываем.
  const allImages = real.length > 0 ? real : placeholders;
  
  // Если нет изображений, показываем заглушку с текстом
  const galleryImages = allImages.length > 0 ? allImages : [];
  const [selectedImage, setSelectedImage] = useState(galleryImages[0] || '');
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [overlayIndex, setOverlayIndex] = useState<number | null>(null);

  // Обновляем selectedImage при изменении galleryImages
  useEffect(() => {
    if (galleryImages.length > 0 && !selectedImage) {
      setSelectedImage(galleryImages[0]);
    }
  }, [galleryImages, selectedImage]);

  // Закрытие overlay по ESC
  useEffect(() => {
    if (!isOverlayOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOverlayOpen(false);
        setOverlayIndex(null);
        return;
      }
      if (e.key === 'ArrowRight') {
        setOverlayIndex((prev) => {
          const idx = typeof prev === 'number' ? prev : Math.max(0, galleryImages.indexOf(selectedImage));
          const next = (idx + 1) % galleryImages.length;
          setSelectedImage(galleryImages[next]);
          return next;
        });
      }
      if (e.key === 'ArrowLeft') {
        setOverlayIndex((prev) => {
          const idx = typeof prev === 'number' ? prev : Math.max(0, galleryImages.indexOf(selectedImage));
          const next = (idx - 1 + galleryImages.length) % galleryImages.length;
          setSelectedImage(galleryImages[next]);
          return next;
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOverlayOpen, galleryImages, selectedImage]);

  // Клик вне картинки
  const overlayRef = useRef<HTMLDivElement>(null);
  const handleOverlayClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) setIsOverlayOpen(false);
  }, []);

  // Если нет изображений, показываем заглушку
  if (galleryImages.length === 0) {
    return (
      <div className="w-layout-vflex core-product-copy-copy">
        <div className="div-block-20 flex items-center justify-center bg-gray-100 rounded-lg" style={{ minHeight: '300px' }}>
          <div className="text-center text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm">Изображения товара не найдены</p>
          </div>
        </div>
      </div>
    );
  }

  const openOverlay = (index?: number) => {
    const idx = typeof index === 'number' ? index : Math.max(0, galleryImages.indexOf(selectedImage));
    setOverlayIndex(idx);
    setIsOverlayOpen(true);
  };

  const goPrev = () => {
    setOverlayIndex((prev) => {
      const idx = typeof prev === 'number' ? prev : Math.max(0, galleryImages.indexOf(selectedImage));
      const next = (idx - 1 + galleryImages.length) % galleryImages.length;
      setSelectedImage(galleryImages[next]);
      return next;
    });
  };

  const goNext = () => {
    setOverlayIndex((prev) => {
      const idx = typeof prev === 'number' ? prev : Math.max(0, galleryImages.indexOf(selectedImage));
      const next = (idx + 1) % galleryImages.length;
      setSelectedImage(galleryImages[next]);
      return next;
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '507px', height: 'auto' }}>
      {/* Основная картинка - точно по размерам из Figma */}
      <div
        className="relative"
        style={{
          width: '100%',
          maxWidth: '507px',
          aspectRatio: '507 / 340',
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          cursor: 'pointer',
          overflow: 'hidden'
        }}
        onClick={() => openOverlay()}
      >
        <img 
          src={selectedImage} 
          loading="lazy" 
          alt="Изображение товара" 
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover'
          }} 
        />
        
        {/* Expand icon - точно по дизайну из Figma */}
        <div
          className="absolute bottom-3 right-3"
          style={{
            width: '32px',
            height: '32px',
            backgroundColor: 'rgba(13, 51, 108, 0.04)',
            borderRadius: '7px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '3px'
          }}
        >
          <svg 
            width="18" 
            height="18" 
            viewBox="0 0 18 18" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M6.75 2.25H2.25V6.75M11.25 2.25H15.75V6.75M15.75 11.25V15.75H11.25M6.75 15.75H2.25V11.25" 
              stroke="rgba(77, 98, 125, 0.6)" 
              strokeWidth="1.75" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* Миниатюры - точно по размерам из Figma */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: '10px',
          marginTop: '20px',
          width: '100%',
          maxWidth: '507px',
          overflowX: 'auto',
          overflowY: 'hidden',
          scrollbarWidth: 'none', // Firefox
          msOverflowStyle: 'none', // IE and Edge
          paddingBottom: '5px' // Небольшой отступ снизу
        }}
        className="gallery-scroll"
      >
        <style jsx>{`
          .gallery-scroll::-webkit-scrollbar {
            display: none; /* Chrome, Safari and Opera */
          }
        `}</style>
        {galleryImages.map((img, idx) => (
          <div
            key={img + idx}
            style={{
              width: '92px',
              height: '78px',
              backgroundColor: '#FFFFFF',
              padding: '14px',
              cursor: 'pointer',
              border: selectedImage === img ? '2px solid #e53935' : '2px solid transparent',
              borderRadius: '8px',
              flexShrink: 0 // Предотвращаем сжатие миниатюр
            }}
            onClick={() => {
              setSelectedImage(img);
            }}
          >
            <img
              src={img}
              loading="lazy"
              alt={`Миниатюра ${idx + 1}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '4px'
              }}
            />
          </div>
        ))}
      </div>
      {/* Overlay для просмотра картинки */}
      {isOverlayOpen && selectedImage && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={handleOverlayClick}
          aria-modal="true"
          role="dialog"
          style={{ animation: 'fadeIn 0.2s ease-in-out' }}
        >
          <button
            onClick={() => { setOverlayIndex(null); setIsOverlayOpen(false); }}
            className="absolute top-6 right-6 text-white bg-black/40 rounded-full p-2 hover:bg-black/70 focus:outline-none"
            aria-label="Закрыть просмотр изображения"
            tabIndex={0}
          >
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M8 24L24 8M8 8l16 16" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          {/* Кнопки навигации */}
          {galleryImages.length > 1 && (
            <>
              <button
                onClick={goPrev}
                className="absolute left-6 text-white bg-black/40 rounded-full p-3 hover:bg-black/70"
                aria-label="Предыдущее изображение"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M15 19l-7-7 7-7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                onClick={goNext}
                className="absolute right-6 text-white bg-black/40 rounded-full p-3 hover:bg-black/70"
                aria-label="Следующее изображение"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M9 5l7 7-7 7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </>
          )}
          <img
            src={typeof overlayIndex === 'number' ? galleryImages[overlayIndex] : selectedImage}
            alt="Просмотр товара"
            className="max-h-[90vh] max-w-[90vw] rounded-lg shadow-2xl border-4 border-white"
            draggable={false}
          />
        </div>
      )}
    </div>
  );
}
