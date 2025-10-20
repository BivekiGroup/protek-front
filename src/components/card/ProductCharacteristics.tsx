import React, { useEffect, useState } from "react";
import { useQuery } from "@apollo/client";
import { PARTS_INDEX_SEARCH_BY_ARTICLE } from "@/lib/graphql";

interface ProductCharacteristicsProps {
  result?: any;
}

const ProductCharacteristics = ({ result }: ProductCharacteristicsProps) => {
  const [partsIndexData, setPartsIndexData] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
      <div 
        className="w-layout-hflex flex-block-52"
        style={{
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? '16px' : '0'
        } as React.CSSProperties}
      >
        {result && (
          <>
            <div className="w-layout-vflex flex-block-53">
               <div 
                 className="text-[24px] font-medium text-black mb-3"
                 style={{
                   fontSize: isMobile ? '20px' : '24px'
                 } as React.CSSProperties}
               >
                 Характеристики
               </div>
              <div className="w-layout-hflex flex-block-55 " style={{
                flexDirection: isMobile ? 'column' : 'row',
                alignItems: isMobile ? 'flex-start' : 'center',
                gap: isMobile ? '4px' : '8px'
              } as React.CSSProperties}>
                <span 
                  className="text-block-29"
                  style={{
                    fontSize: isMobile ? '14px' : '16px',
                    minWidth: isMobile ? 'auto' : '120px'
                  } as React.CSSProperties}
                >
                  Бренд:
                </span>
                <span 
                  className="text-block-28"
                  style={{
                    fontSize: isMobile ? '14px' : '16px'
                  } as React.CSSProperties}
                >
                  {result.brand}
                </span>
              </div>
              <div className="w-layout-hflex flex-block-55" style={{
                flexDirection: isMobile ? 'column' : 'row',
                alignItems: isMobile ? 'flex-start' : 'center',
                gap: isMobile ? '4px' : '8px'
              } as React.CSSProperties}>
                <span 
                  className="text-block-29"
                  style={{
                    fontSize: isMobile ? '14px' : '16px',
                    minWidth: isMobile ? 'auto' : '120px'
                  } as React.CSSProperties}
                >
                  Артикул:
                </span>
                <span 
                  className="text-block-28"
                  style={{
                    fontSize: isMobile ? '14px' : '16px'
                  } as React.CSSProperties}
                >
                  {result.articleNumber}
                </span>
              </div>
              <div className="w-layout-hflex flex-block-55" style={{
                flexDirection: isMobile ? 'column' : 'row',
                alignItems: isMobile ? 'flex-start' : 'center',
                gap: isMobile ? '4px' : '8px'
              } as React.CSSProperties}>
                <span 
                  className="text-block-29"
                  style={{
                    fontSize: isMobile ? '14px' : '16px',
                    minWidth: isMobile ? 'auto' : '120px'
                  } as React.CSSProperties}
                >
                  Название:
                </span>
                <span 
                  className="text-block-28"
                  style={{
                    fontSize: isMobile ? '14px' : '16px'
                  } as React.CSSProperties}
                >
                  {result.name}
                </span>
              </div>
              {(typeof result.weight === 'number' && result.weight > 0) || derived.weightKg ? (
                <div className="w-layout-hflex flex-block-55" style={{
                  flexDirection: isMobile ? 'column' : 'row',
                  alignItems: isMobile ? 'flex-start' : 'center',
                  gap: isMobile ? '4px' : '8px'
                } as React.CSSProperties}>
                  <span 
                    className="text-block-29"
                    style={{
                      fontSize: isMobile ? '14px' : '16px',
                      minWidth: isMobile ? 'auto' : '120px'
                    } as React.CSSProperties}
                  >
                    Вес:
                  </span>
                  <span 
                    className="text-block-28"
                    style={{
                      fontSize: isMobile ? '14px' : '16px'
                    } as React.CSSProperties}
                  >
                    {(result.weight && result.weight > 0 ? result.weight : derived.weightKg)?.toLocaleString('ru-RU')} кг
                  </span>
                </div>
              ) : null}
              {(result.dimensions || derived.dimensions) && (
                <div className="w-layout-hflex flex-block-55" style={{
                  flexDirection: isMobile ? 'column' : 'row',
                  alignItems: isMobile ? 'flex-start' : 'center',
                  gap: isMobile ? '4px' : '8px'
                } as React.CSSProperties}>
                  <span 
                    className="text-block-29"
                    style={{
                      fontSize: isMobile ? '14px' : '16px',
                      minWidth: isMobile ? 'auto' : '120px'
                    } as React.CSSProperties}
                  >
                    Габариты (Д×Ш×В):
                  </span>
                  <span 
                    className="text-block-28"
                    style={{
                      fontSize: isMobile ? '14px' : '16px'
                    } as React.CSSProperties}
                  >
                    {result.dimensions || derived.dimensions}
                  </span>
                </div>
              )}
              {result.description && (
                <div className="flex-block-53 mt-5">
                    <span 
                      className="text-[24px] font-medium text-black mb-3"
                      style={{
                        fontSize: isMobile ? '18px' : '24px'
                      } as React.CSSProperties}
                    >
                      Описание
                    </span>
                  <div 
                    className="mt-4" 
                    style={{
                      fontSize: isMobile ? '14px' : '16px'
                    } as React.CSSProperties}
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(result.description) }} 
                  />
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
