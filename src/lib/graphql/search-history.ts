import { gql } from '@apollo/client';

// Запросы для истории поиска запчастей
export const GET_PARTS_SEARCH_HISTORY = gql`
  query GetPartsSearchHistory($limit: Int, $offset: Int) {
    partsSearchHistory(limit: $limit, offset: $offset) {
      items {
        id
        searchQuery
        searchType
        brand
        articleNumber
        vehicleInfo {
          brand
          model
          year
        }
        resultCount
        createdAt
      }
      total
      hasMore
    }
  }
`;

// Запрос для получения последних поисковых запросов для автодополнения
export const GET_RECENT_SEARCH_QUERIES = gql`
  query GetRecentSearchQueries($limit: Int = 5) {
    partsSearchHistory(limit: $limit, offset: 0) {
      items {
        id
        searchQuery
        searchType
        createdAt
      }
    }
  }
`;

export const DELETE_SEARCH_HISTORY_ITEM = gql`
  mutation DeletePartsSearchHistoryItem($id: ID!) {
    deletePartsSearchHistoryItem(id: $id)
  }
`;

export const CLEAR_SEARCH_HISTORY = gql`
  mutation ClearPartsSearchHistory {
    clearPartsSearchHistory
  }
`;

export const CREATE_SEARCH_HISTORY_ITEM = gql`
  mutation CreatePartsSearchHistoryItem($input: PartsSearchHistoryInput!) {
    createPartsSearchHistoryItem(input: $input) {
      id
      searchQuery
      searchType
      brand
      articleNumber
      vehicleInfo {
        brand
        model
        year
      }
      resultCount
      createdAt
    }
  }
`;

// Типы для TypeScript
export interface PartsSearchHistoryItem {
  id: string;
  searchQuery: string;
  searchType: 'TEXT' | 'ARTICLE' | 'OEM' | 'VIN' | 'PLATE' | 'WIZARD' | 'PART_VEHICLES';
  brand?: string;
  articleNumber?: string;
  vehicleInfo?: {
    brand?: string;
    model?: string;
    year?: number;
  };
  resultCount: number;
  createdAt: string;
}

export interface PartsSearchHistoryResponse {
  items: PartsSearchHistoryItem[];
  total: number;
  hasMore: boolean;
} 