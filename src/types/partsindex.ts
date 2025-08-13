export interface PartsIndexCatalog {
  id: string;
  name: string;
  image: string | null;
  groups: PartsIndexGroup[];
}

export interface PartsIndexEntityName {
  id: string;
  name: string;
}

export interface PartsIndexGroup {
  id: string;
  name: string;
  lang: string;
  image: string;
  lft: number;
  rgt: number;
  entityNames: PartsIndexEntityName[];
  subgroups: PartsIndexGroup[];
}

export interface PartsIndexCatalogsResponse {
  list: PartsIndexCatalog[];
}

export interface PartsIndexTabData {
  label: string;
  heading: string;
  links: string[];
  catalogId: string;
  group?: PartsIndexGroup;
}

export interface PartsIndexCatalogsData {
  partsIndexCategoriesWithGroups: PartsIndexCatalog[];
}

export interface PartsIndexCatalogsVariables {
  lang?: string;
}

// Новые типы для товаров каталога
export interface PartsIndexParameterValue {
  id: string;
  value: string;
}

export interface PartsIndexParameter {
  id: string;
  code: string;
  title: string;
  type: string;
  values: PartsIndexParameterValue[];
}

export interface PartsIndexBrand {
  id: string;
  name: string;
}

export interface PartsIndexProductName {
  id: string;
  name: string;
}

export interface PartsIndexEntity {
  id: string;
  name: PartsIndexProductName;
  originalName: string;
  code: string;
  brand: PartsIndexBrand;
  parameters: PartsIndexParameter[];
  images: string[];
}

export interface PartsIndexPaginationPage {
  prev: number | null;
  current: number;
  next: number | null;
}

export interface PartsIndexPagination {
  limit: number;
  page: PartsIndexPaginationPage;
}

export interface PartsIndexSubgroup {
  id: string;
  name: string;
}

export interface PartsIndexEntitiesResponse {
  pagination: PartsIndexPagination;
  list: PartsIndexEntity[];
  catalog: {
    id: string;
    name: string;
    image: string | null;
  };
  subgroup: PartsIndexSubgroup | null;
}

export interface PartsIndexEntitiesData {
  partsIndexCatalogEntities: PartsIndexEntitiesResponse;
}

export interface PartsIndexEntitiesVariables {
  catalogId: string;
  groupId: string;
  lang?: string;
  limit?: number;
  page?: number;
  q?: string;
  engineId?: string;
  generationId?: string;
  params?: string;
}

// Типы для параметров фильтрации
export interface PartsIndexParamValue {
  value: string;
  title: string;
  available: boolean;
  selected: boolean;
}

export interface PartsIndexParam {
  id: string;
  code: string;
  name: string;
  isGeneral: boolean;
  type: string;
  values: PartsIndexParamValue[];
}

export interface PartsIndexParamsResponse {
  list: PartsIndexParam[];
  paramsQuery: Record<string, string>;
}

export interface PartsIndexParamsData {
  partsIndexCatalogParams: PartsIndexParamsResponse;
}

export interface PartsIndexParamsVariables {
  catalogId: string;
  groupId: string;
  lang?: string;
  engineId?: string;
  generationId?: string;
  params?: string;
  q?: string;
}

// Типы для получения информации о детали по артикулу
export interface PartsIndexEntityInfo {
  id: string;
  name: PartsIndexProductName;
  originalName: string;
  code: string;
  barcodes: string[];
  brand: PartsIndexBrand;
  description: string;
  parameters: {
    id: string;
    name: string;
    params: PartsIndexParameter[];
  }[];
  images: string[];
  links: any[];
  groups: {
    main: Array<{
      id: string;
      name: string;
      level: number;
    }>;
    additional: Array<Array<{
      id: string;
      name: string;
      level: number;
    }>>;
  };
}

export interface PartsIndexEntityInfoResponse {
  list: PartsIndexEntityInfo[];
}

export interface PartsIndexEntityInfoVariables {
  code: string;
  brand?: string;
  lang?: string;
}