import React, { useState, useCallback, useEffect, useRef } from "react";

interface ProductImageGalleryProps {
  imageUrl?: string;
  images?: string[]; // если появятся несколько картинок
  partsIndexImages?: string[]; // изображения из Parts Index
}

export default function ProductImageGallery({ imageUrl, images, partsIndexImages }: ProductImageGalleryProps) {
  // Убираем defaultImage - больше не используем заглушку
  // const defaultImage = "/images/image-10.png";
  
  // Объединяем все доступные изображения
  const allImages = [
    ...(partsIndexImages && partsIndexImages.length > 0 ? partsIndexImages : []),
    ...(images && images.length > 0 ? images : []),
    ...(imageUrl ? [imageUrl] : [])
  ];
  
  // Если нет изображений, показываем заглушку с текстом
  const galleryImages = allImages.length > 0 ? allImages : [];
  const [selectedImage, setSelectedImage] = useState(galleryImages[0] || '');
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);

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
      if (e.key === "Escape") setIsOverlayOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOverlayOpen]);

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

  return (
    <div className="w-layout-vflex core-product-copy-copy">
      {/* Основная картинка */}
      <div className="div-block-20 cursor-zoom-in" onClick={() => setIsOverlayOpen(true)} tabIndex={0} aria-label="Открыть изображение в полный экран" role="button" onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setIsOverlayOpen(true)}>
        <img src={selectedImage} loading="lazy" alt="Изображение товара" className="image-10-copy" />
      </div>
      {/* Миниатюры */}
      <div className="w-layout-hflex flex-block-56 mt-2 gap-2">
        {galleryImages.map((img, idx) => (
          <img
            key={img + idx}
            src={img}
            loading="lazy"
            alt={`Миниатюра ${idx + 1}`}
            className={`small-img cursor-pointer border ${selectedImage === img ? 'border-blue-500' : 'border-transparent'} rounded transition`}
            onClick={() => {
              setSelectedImage(img);
              setIsOverlayOpen(true);
            }}
            tabIndex={0}
            aria-label={`Показать изображение ${idx + 1}`}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                setSelectedImage(img);
                setIsOverlayOpen(true);
              }
            }}
          />
        ))}
      </div>
      {/* Overlay для просмотра картинки */}
      {isOverlayOpen && selectedImage && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 animate-fade-in"
          onClick={handleOverlayClick}
          aria-modal="true"
          role="dialog"
        >
          <button
            onClick={() => setIsOverlayOpen(false)}
            className="absolute top-6 right-6 text-white bg-black/40 rounded-full p-2 hover:bg-black/70 focus:outline-none"
            aria-label="Закрыть просмотр изображения"
            tabIndex={0}
          >
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M8 24L24 8M8 8l16 16" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <img
            src={selectedImage}
            alt="Просмотр товара"
            className="max-h-[90vh] max-w-[90vw] rounded-lg shadow-2xl border-4 border-white"
            draggable={false}
          />
        </div>
      )}
    </div>
  );
} 