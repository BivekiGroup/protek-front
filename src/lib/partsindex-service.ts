import { PartsIndexCatalogsResponse, PartsIndexGroup, PartsIndexEntityInfoResponse } from '@/types/partsindex';

const PARTS_INDEX_API_BASE = process.env.PARTSAPI_URL || 'https://api.parts-index.com';
const API_KEY = 'PI-E1C0ADB7-E4A8-4960-94A0-4D9C0A074DAE';

// Debug logging for development
if (process.env.NODE_ENV === 'development') {
  console.log('🔍 PartsIndex API Base URL:', PARTS_INDEX_API_BASE);
  console.log('🔍 Environment variable NEXT_PUBLIC_PARTSAPI_URL:', process.env.NEXT_PUBLIC_PARTSAPI_URL);
}

class PartsIndexService {
  /**
   * Получить список каталогов
   */
  async getCatalogs(lang: string = 'ru'): Promise<PartsIndexCatalogsResponse> {
    try {
      const response = await fetch(
        `${PARTS_INDEX_API_BASE}/v1/catalogs?lang=${lang}`,
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Ошибка получения каталогов Parts Index:', error);
      throw error;
    }
  }

  /**
   * Получить группы каталога
   */
  async getCatalogGroups(catalogId: string, lang: string = 'ru'): Promise<PartsIndexGroup> {
    try {
      const response = await fetch(
        `${PARTS_INDEX_API_BASE}/v1/catalogs/${catalogId}/groups?lang=${lang}`,
        {
          headers: {
            'Accept': 'application/json',
            'Authorization': API_KEY,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Ошибка получения групп каталога ${catalogId}:`, error);
      throw error;
    }
  }

  /**
   * Получить информацию о детали по артикулу и бренду
   */
  async getEntityInfo(code: string, brand?: string, lang: string = 'ru'): Promise<PartsIndexEntityInfoResponse> {
    try {
      const params = new URLSearchParams({
        code: code,
        lang: lang
      });
      
      if (brand) {
        params.append('brand', brand);
      }

      const response = await fetch(
        `${PARTS_INDEX_API_BASE}/v1/entities?${params.toString()}`,
        {
          headers: {
            'Accept': 'application/json',
            'Authorization': API_KEY,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Ошибка получения информации о детали ${code}:`, error);
      throw error;
    }
  }
}

export const partsIndexService = new PartsIndexService();