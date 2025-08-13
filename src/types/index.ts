// Навигационные категории
export interface NavigationCategory {
  id: string
  partsIndexCatalogId: string
  partsIndexGroupId: string | null
  name: string
  catalogName: string
  groupName: string | null
  icon: string | null
  sortOrder: number
  isHidden: boolean
} 