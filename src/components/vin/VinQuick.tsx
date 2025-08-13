import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import { GET_LAXIMO_QUICK_DETAIL } from '@/lib/graphql/laximo';

interface VinQuickProps {
  quickGroup: any;
  catalogCode: string;
  vehicleId: string;
  ssd: string;
  onBack: () => void;
  onNodeSelect: (unit: any) => void;
}

const VinQuick: React.FC<VinQuickProps> = ({ quickGroup, catalogCode, vehicleId, ssd, onBack, onNodeSelect }) => {
  const router = useRouter();
  
  const { data, loading, error } = useQuery(GET_LAXIMO_QUICK_DETAIL, {
    variables: {
      catalogCode,
      vehicleId,
      quickGroupId: quickGroup.quickgroupid,
      ssd
    },
    skip: !quickGroup || !quickGroup.quickgroupid
  });
  const quickDetail = data?.laximoQuickDetail;

  const handleUnitClick = (unit: any) => {
    onNodeSelect({
      ...unit,
      unitid: unit.unitid,
      name: unit.name,
      catalogCode,
      vehicleId,
      ssd: unit.ssd || ssd  // Используем SSD узла, а не родительский
    });
  };
  
  const handleDetailClick = (detail: any) => {
    if (detail.oem) {
      // Переходим на страницу выбора бренда
      const url = `/vehicle-search/${catalogCode}/${vehicleId}/part/${detail.oem}/brands?detailName=${encodeURIComponent(detail.name || '')}`;
      router.push(url);
    }
  };

  const [shownCounts, setShownCounts] = useState<{ [unitid: string]: number }>({});

  return (
    <div className="w-full">
      {/* <button onClick={onBack} className="mb-4 px-4 py-2 bg-gray-200 rounded self-start">Назад</button> */}
      {loading ? (
        <div className="text-center py-4">Загружаем детали...</div>
      ) : error ? (
        <div className="text-red-600 py-4">Ошибка загрузки деталей: {error.message}</div>
      ) : quickDetail && quickDetail.units ? (
        quickDetail.units.map((unit: any) => (
          <div key={unit.unitid} className="w-layout-vflex flex-block-14-copy-copy">
            <div className="knotinfo">
              {unit.imageurl || unit.largeimageurl ? (
                <img
                  src={unit.largeimageurl ? unit.largeimageurl.replace('%size%', '250') : unit.imageurl.replace('%size%', '250')}
                  alt={unit.name}
                  className="image-26"
                  onError={e => { (e.currentTarget as HTMLImageElement).src = '/images/image-44.jpg'; }}
                  onClick={() => handleUnitClick(unit)}
                  style={{ cursor: 'pointer' }}
                />
              ) : (
                <img src="/images/image-44.jpg" alt="Нет изображения" className="image-26" />
              )}
            </div>
            <div className="knot-img">
              <h1 className="heading-19">{unit.name}</h1>
              {(() => {
                const details = unit.details || [];
                const total = details.length;
                const shownCount = shownCounts[unit.unitid] ?? 3;
                return (
                  <>
                    {details.slice(0, shownCount).map((detail: any, index: number) => (
                      <div className="w-layout-hflex flex-block-115" key={`${unit.unitid}-${detail.detailid || index}`}>
                        <div className="oemnuber">{detail.oem}</div>
                        <div className="partsname">{detail.name}</div>
                        <a href="#" className="button-3 w-button" onClick={e => { e.preventDefault(); handleDetailClick(detail); }}>Показать цены</a>
                      </div>
                    ))}
                    {total > 3 && shownCount < total && (
                      <div className="flex gap-2 mt-2 w-full">
                        <button
                          className="expand-btn"
                          onClick={() => setShownCounts(prev => ({ ...prev, [unit.unitid]: total }))}
                          style={{ border: '1px solid #EC1C24', borderRadius: 8, background: '#fff', color: '#222', padding: '6px 18px', minWidth: 180 }}
                        >
                          Развернуть
                          <svg width="16" height="16" viewBox="0 0 16 16" style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 4 }}>
                            <path d="M4 6l4 4 4-4" stroke="#222" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                        <button
                          className="showall-btn"
                          onClick={() => handleUnitClick(unit)}
                          style={{ background: '#e9eef5', borderRadius: 8, color: '#222', padding: '6px 18px', border: 'none'}}
                        >
                          Показать все
                        </button>
                      </div>
                    )}
                    {shownCount >= total && (
                      <a href="#" className="showallparts w-button" onClick={e => { e.preventDefault(); handleUnitClick(unit); }}>Подробнее</a>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        ))
      ) : (
        <div className="text-center text-gray-500 py-4">Нет деталей для этой группы</div>
      )}
    </div>
  );
};

export default VinQuick; 