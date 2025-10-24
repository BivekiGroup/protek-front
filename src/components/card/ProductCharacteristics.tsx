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

  // Собираем все характеристики в один массив
  const allCharacteristics = [];

  // Базовые характеристики
  if (result?.brand) {
    allCharacteristics.push({ key: 'Бренд', value: result.brand });
  }

  // Характеристики из CMS
  if (Array.isArray(result?.characteristics)) {
    result.characteristics.forEach((ch: any) => {
      allCharacteristics.push({
        key: ch?.characteristic?.name || 'Параметр',
        value: ch?.value || '—'
      });
    });
  }

  // Вес
  if ((typeof result?.weight === 'number' && result.weight > 0) || derived.weightKg) {
    allCharacteristics.push({
      key: 'Масса, кг',
      value: (result.weight && result.weight > 0 ? result.weight : derived.weightKg)?.toLocaleString('ru-RU')
    });
  }

  // Габариты
  if (result?.dimensions || derived.dimensions) {
    allCharacteristics.push({
      key: 'Габариты (Д×Ш×В), мм',
      value: result.dimensions || derived.dimensions
    });
  }

  // Делим характеристики пополам
  const midpoint = Math.ceil(allCharacteristics.length / 2);
  const leftColumn = allCharacteristics.slice(0, midpoint);
  const rightColumn = allCharacteristics.slice(midpoint);

  return (
    <>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          padding: '28px',
          gap: '40px',
          background: '#FFFFFF',
          borderRadius: '12px'
        } as React.CSSProperties}
      >
        {result && (
          <>
            {/* Секция характеристик */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '20px',
              width: '100%'
            } as React.CSSProperties}>
              {/* Заголовок */}
              <h2 style={{
                margin: 0,
                fontFamily: 'Onest',
                fontWeight: 600,
                fontSize: '24px',
                lineHeight: '120%',
                color: '#000814'
              } as React.CSSProperties}>
                Характеристики
              </h2>

              {/* Две колонки характеристик */}
              <div style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                alignItems: 'flex-start',
                gap: isMobile ? '20px' : '60px',
                width: '100%'
              } as React.CSSProperties}>
                {/* Левая колонка */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  gap: '10px',
                  flex: 1,
                  width: '100%'
                } as React.CSSProperties}>
                  {leftColumn.map((item, idx) => (
                    <div key={idx} style={{
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '24px',
                      width: '100%'
                    } as React.CSSProperties}>
                      <span style={{
                        fontFamily: 'Onest',
                        fontWeight: 400,
                        fontSize: '16px',
                        lineHeight: '140%',
                        color: '#8893A2'
                      } as React.CSSProperties}>{item.key}</span>
                      <span style={{
                        fontFamily: 'Onest',
                        fontWeight: 400,
                        fontSize: '16px',
                        lineHeight: '140%',
                        color: '#000814'
                      } as React.CSSProperties}>{item.value}</span>
                    </div>
                  ))}
                </div>

                {/* Правая колонка */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  gap: '10px',
                  flex: 1,
                  width: '100%'
                } as React.CSSProperties}>
                  {rightColumn.map((item, idx) => (
                    <div key={idx} style={{
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '24px',
                      width: '100%'
                    } as React.CSSProperties}>
                      <span style={{
                        fontFamily: 'Onest',
                        fontWeight: 400,
                        fontSize: '16px',
                        lineHeight: '140%',
                        color: '#8893A2'
                      } as React.CSSProperties}>{item.key}</span>
                      <span style={{
                        fontFamily: 'Onest',
                        fontWeight: 400,
                        fontSize: '16px',
                        lineHeight: '140%',
                        color: '#000814'
                      } as React.CSSProperties}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Описание */}
            {result.description && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '20px',
                width: '100%'
              } as React.CSSProperties}>
                <h2 style={{
                  margin: 0,
                  fontFamily: 'Onest',
                  fontWeight: 600,
                  fontSize: '24px',
                  lineHeight: '120%',
                  color: '#000814'
                } as React.CSSProperties}>
                  Описание
                </h2>
                <div
                  style={{
                    fontFamily: 'Onest',
                    fontWeight: 400,
                    fontSize: '14px',
                    lineHeight: '140%',
                    color: '#000814',
                    width: '100%'
                  } as React.CSSProperties}
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(result.description) }}
                />
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default ProductCharacteristics; 
