import React, { useEffect, useState } from "react";
import { useQuery } from "@apollo/client";
import { PARTS_INDEX_SEARCH_BY_ARTICLE } from "@/lib/graphql";

interface ProductCharacteristicsProps {
  result?: any;
}

const ProductCharacteristics = ({ result }: ProductCharacteristicsProps) => {
  const [partsIndexData, setPartsIndexData] = useState<any>(null);

  // Запрос к Parts Index для получения дополнительных характеристик
  const { data: partsIndexResult, loading: partsIndexLoading } = useQuery(PARTS_INDEX_SEARCH_BY_ARTICLE, {
    variables: {
      articleNumber: result?.articleNumber || '',
      brandName: result?.brand || '',
      lang: 'ru'
    },
    skip: !result?.articleNumber || !result?.brand,
    errorPolicy: 'ignore'
  });

  useEffect(() => {
    if (partsIndexResult?.partsIndexSearchByArticle) {
      setPartsIndexData(partsIndexResult.partsIndexSearchByArticle);
    }
  }, [partsIndexResult]);

  // Функция для рендеринга параметров из Parts Index
  const renderPartsIndexParameters = () => {
    if (!partsIndexData?.parameters) return null;

    return partsIndexData.parameters.map((paramGroup: any, groupIndex: number) => (
      <div key={groupIndex} className="w-layout-vflex flex-block-53">
        {paramGroup.params?.map((param: any, paramIndex: number) => (
          <div key={paramIndex} className="w-layout-hflex flex-block-55">
            <span className="text-block-29">{param.title}:</span>
            <span className="text-block-28">
              {param.values?.map((value: any) => value.value).join(', ') || 'Нет данных'}
            </span>
          </div>
        ))}
      </div>
    ));
  };

  return (
    <>
      <div className="w-layout-hflex flex-block-52">
        {result && (
          <>
            <div className="w-layout-vflex flex-block-53">
              <div className="w-layout-hflex flex-block-55">
                <span className="text-block-29">Бренд:</span>
                <span className="text-block-28">{result.brand}</span>
              </div>
              <div className="w-layout-hflex flex-block-55">
                <span className="text-block-29">Артикул:</span>
                <span className="text-block-28">{result.articleNumber}</span>
              </div>
              <div className="w-layout-hflex flex-block-55">
                <span className="text-block-29">Название:</span>
                <span className="text-block-28">{result.name}</span>
              </div>
              {partsIndexData?.originalName && (
                <div className="w-layout-hflex flex-block-55">
                  <span className="text-block-29">Оригинальное название:</span>
                  <span className="text-block-28">{partsIndexData.originalName}</span>
                </div>
              )}
              {partsIndexData?.description && (
                <div className="w-layout-hflex flex-block-55">
                  <span className="text-block-29">Описание:</span>
                  <span className="text-block-28">{partsIndexData.description}</span>
                </div>
              )}
            </div>
            
            {/* Дополнительные характеристики из Parts Index */}
            {partsIndexLoading ? (
              <div className="w-layout-vflex flex-block-53">
                <div className="w-layout-hflex flex-block-55">
                  <span className="text-block-29">Загрузка характеристик...</span>
                </div>
              </div>
            ) : (
              renderPartsIndexParameters()
            )}
          </>
        )}
      </div>
    </>
  );
};

export default ProductCharacteristics; 