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

  const sanitizeHtml = (html: string) => {
    try {
      let s = String(html || '')
      s = s.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
      s = s.replace(/on\w+\s*=\s*"[^"]*"/gi, '')
      s = s.replace(/on\w+\s*=\s*'[^']*'/gi, '')
      s = s.replace(/javascript:/gi, '')
      return s
    } catch {
      return ''
    }
  }

  // Try to derive weight/dimensions from PartsIndex when not present in CMS
  const derived = (() => {
    const out: { weightKg?: number; dimensions?: string } = {}
    try {
      const groups: any[] = partsIndexData?.parameters || []
      const entries: { title: string; values: string[] }[] = []
      for (const g of groups) {
        for (const p of g.params || []) {
          const vals = (p.values || []).map((v: any) => String(v?.value || '').trim()).filter(Boolean)
          entries.push({ title: String(p.title || '').toLowerCase(), values: vals })
        }
      }
      // Weight
      const weightEntry = entries.find(e => /вес|масса|weight/.test(e.title))
      if (weightEntry && weightEntry.values[0]) {
        const raw = weightEntry.values[0]
        const num = parseFloat(raw.replace(',', '.'))
        if (!isNaN(num)) {
          out.weightKg = /г|g/.test(raw) && !/кг|kg/.test(raw) ? num / 1000 : num
        }
      }
      // Dimensions: look for length/width/height
      const getNum = (s?: string) => {
        if (!s) return undefined
        const m = s.replace(',', '.').match(/[0-9]+(?:\.[0-9]+)?/)
        return m ? parseFloat(m[0]) : undefined
      }
      const len = entries.find(e => /(длина|length)/.test(e.title))?.values?.[0]
      const wid = entries.find(e => /(ширина|width)/.test(e.title))?.values?.[0]
      const hei = entries.find(e => /(высота|height)/.test(e.title))?.values?.[0]
      const l = getNum(len), w = getNum(wid), h = getNum(hei)
      if (l && w && h) {
        out.dimensions = `${l}x${w}x${h}`
      }
    } catch {}
    return out
  })()

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
              {(typeof result.weight === 'number' && result.weight > 0) || derived.weightKg ? (
                <div className="w-layout-hflex flex-block-55">
                  <span className="text-block-29">Вес:</span>
                  <span className="text-block-28">{(result.weight && result.weight > 0 ? result.weight : derived.weightKg)?.toLocaleString('ru-RU')} кг</span>
                </div>
              ) : null}
              {(result.dimensions || derived.dimensions) && (
                <div className="w-layout-hflex flex-block-55">
                  <span className="text-block-29">Габариты (Д×Ш×В):</span>
                  <span className="text-block-28">{result.dimensions || derived.dimensions}</span>
                </div>
              )}
              {result.description && (
                <div className="w-layout-vflex flex-block-53">
                  <div className="w-layout-hflex flex-block-55">
                    <span className="text-block-29">Описание:</span>
                  </div>
                  <div className="text-block-28" dangerouslySetInnerHTML={{ __html: sanitizeHtml(result.description) }} />
                </div>
              )}

              {Array.isArray(result.characteristics) && result.characteristics.length > 0 && (
                <div className="w-layout-vflex flex-block-53">
                  {result.characteristics.map((ch: any, idx: number) => (
                    <div key={idx} className="w-layout-hflex flex-block-55">
                      <span className="text-block-29">{ch?.characteristic?.name || 'Параметр'}:</span>
                      <span className="text-block-28">{ch?.value || '—'}</span>
                    </div>
                  ))}
                </div>
              )}
              {partsIndexData?.originalName && (
                <div className="w-layout-hflex flex-block-55">
                  <span className="text-block-29">Оригинальное название:</span>
                  <span className="text-block-28">{partsIndexData.originalName}</span>
                </div>
              )}
              {partsIndexData?.description && !result.description && (
                <div className="w-layout-hflex flex-block-55">
                  <span className="text-block-29">Описание (каталог):</span>
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
