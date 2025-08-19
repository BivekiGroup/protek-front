import { useState } from 'react';

interface UseArticleImageOptions {
  enabled?: boolean;
  fallbackImage?: string;
}

interface UseArticleImageReturn {
  imageUrl: string;
  isLoading: boolean;
  error: boolean;
}

export const useArticleImage = (
  _artId: string | undefined | null,
  options: UseArticleImageOptions = {}
): UseArticleImageReturn => {
  const { fallbackImage = '/images/image-10.png' } = options;
  // PartsAPI removed: always return fallback, no loading, no error
  const [imageUrl] = useState<string>(fallbackImage);

  return {
    imageUrl,
    isLoading: false,
    error: false,
  };
};
