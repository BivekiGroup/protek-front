import React from 'react';
import { useRouter } from 'next/router';
import { LaximoVehicleSearchResult, LaximoCatalogInfo } from '@/types/laximo';

interface VehicleSearchResultsProps {
  results: LaximoVehicleSearchResult[];
  catalogInfo: LaximoCatalogInfo;
}

const ROW_DEFINITIONS: Array<{ label: string; keys: string[] }> = [
  { label: 'Марка', keys: ['brand', 'марка'] },
  { label: 'Название', keys: ['name', 'название'] },
  { label: 'Модель', keys: ['model', 'модель'] },
  { label: 'Код в каталоге', keys: ['catalog', 'catalog code', 'catalogcode', 'код в каталоге'] },
  { label: 'Описание', keys: ['description', 'описание'] },
  { label: 'displacement', keys: ['displacement', 'объем', 'объем двигателя'] },
  { label: 'power', keys: ['power', 'мощность'] },
  { label: 'drive', keys: ['drive', 'привод'] },
  { label: 'bodyworkType', keys: ['bodyworktype', 'bodywork type', 'кузов', 'тип кузова'] },
  { label: 'fuel', keys: ['fuel', 'fuel type', 'топливо', 'тип топлива'] },
  { label: 'trimlevel', keys: ['trimlevel', 'trim level', 'комплектация'] },
];

const VehicleSearchResults: React.FC<VehicleSearchResultsProps> = ({
  results,
  catalogInfo
}) => {
  const router = useRouter();

  const handleSelectVehicle = (vehicle: LaximoVehicleSearchResult) => {
    const routerSsd = Array.isArray(router.query.ssd) ? router.query.ssd[0] : router.query.ssd;
    const ssd = vehicle.ssd || routerSsd || '';
    const brand = router.query.brand || catalogInfo.code;

    if (ssd && ssd.trim() !== '') {
      const vehicleKey = `vehicle_ssd_${brand}_${vehicle.vehicleid}`;
      localStorage.setItem(vehicleKey, ssd);
      router.push(`/vehicle-search/${brand}/${vehicle.vehicleid}?use_storage=1&ssd_length=${ssd.length}`);
    } else {
      router.push(`/vehicle-search/${brand}/${vehicle.vehicleid}`);
    }
  };

  const normalizedResults = React.useMemo(() => {
    const seen = new Set<string>();
    return results.reduce<LaximoVehicleSearchResult[]>((acc, vehicle) => {
      const filteredAttributes = (vehicle.attributes || []).filter((attr) => {
        const key = (attr.key || attr.name || '').toLowerCase();
        return key !== 'sales_code';
      });

      const attributeSignature = filteredAttributes
        .map((attr) => ({
          key: attr.key?.trim() || '',
          name: attr.name?.trim() || '',
          value: attr.value?.trim() || '',
        }))
        .sort((a, b) => (a.name || a.key).localeCompare(b.name || b.key))
        .map((attr) => `${attr.name}|${attr.key}|${attr.value}`)
        .join('||');

      const signature = JSON.stringify({
        brand: vehicle.brand,
        model: vehicle.model,
        modification: vehicle.modification,
        year: vehicle.year,
        bodytype: vehicle.bodytype,
        engine: vehicle.engine,
        engine_info: vehicle.engine_info,
        prodRange: vehicle.prodRange,
        prodPeriod: vehicle.prodPeriod,
        market: vehicle.market,
        attributes: attributeSignature,
      });

      if (seen.has(signature)) {
        return acc;
      }

      seen.add(signature);
      acc.push({ ...vehicle, sales_code: undefined, attributes: filteredAttributes });
      return acc;
    }, []);
  }, [results]);

  if (normalizedResults.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">
        Найдено автомобилей: {normalizedResults.length}
      </h3>
      
      <div className="flex flex-wrap flex-1 gap-5 size-full max-md:max-w-full">
        {normalizedResults.map((vehicle, index) => {
          const attributeMap: Record<string, string> = {};
          (vehicle.attributes || []).forEach((attr) => {
            const key = (attr.name || attr.key || '').trim().toLowerCase();
            if (!key) return;
            if (!attributeMap[key]) {
              attributeMap[key] = attr.value;
            }
          });

          const pickValue = (...keys: string[]): { value: string | null; matchedKey: string | null } => {
            for (const rawKey of keys) {
              const key = rawKey.trim();
              const vehicleValue =
                key && key in vehicle
                  ? vehicle[key as keyof LaximoVehicleSearchResult]
                  : undefined;
              if (typeof vehicleValue === 'string' && vehicleValue.trim()) {
                return { value: vehicleValue.trim(), matchedKey: key.toLowerCase() };
              }
              const normalized = key.toLowerCase();
              if (attributeMap[normalized]) {
                return { value: attributeMap[normalized], matchedKey: normalized };
              }
            }
            return { value: null, matchedKey: null };
          };

          const handledKeys = new Set<string>();

          const rows = ROW_DEFINITIONS
            .map((row) => {
              const { value, matchedKey } = pickValue(...row.keys);
              if (!value) {
                return null;
              }
              if (matchedKey) {
                handledKeys.add(matchedKey);
              }
              row.keys.forEach((key) => {
                handledKeys.add(key.trim().toLowerCase());
              });
              return { label: row.label, value };
            })
            .filter((row): row is { label: string; value: string } => Boolean(row));

          const optionsResult = pickValue('options');
          if (optionsResult.matchedKey) {
            handledKeys.add(optionsResult.matchedKey);
          }
          handledKeys.add('options');
          handledKeys.add('опции');
          handledKeys.add('other options');

          const additionalOptions =
            optionsResult.value ||
            (vehicle.attributes || [])
              .filter((attr) => {
                const key = (attr.name || attr.key || '').trim().toLowerCase();
                if (!key) return false;
                if (handledKeys.has(key)) return false;
                return true;
              })
              .map((attr) => {
                const title = attr.name || attr.key;
                return title ? `${title.toUpperCase()}: ${attr.value}` : attr.value;
              })
              .join('\n');

          const hasAdditional = Boolean(additionalOptions);

          return (
            <div
              key={`${vehicle.vehicleid}-${index}`}
              className="flex flex-col flex-1 shrink bg-white rounded-[20px] border border-[#E6EDF6] shadow-sm hover:shadow-md transition-shadow basis-0 max-w-[520px] md:min-w-[400px] sm:min-w-[320px] min-w-[220px] cursor-pointer"
              onClick={() => handleSelectVehicle(vehicle)}
            >
              <div className="flex flex-col h-full p-[30px] gap-4">
                <div className="w-full">
                  <h4 className="text-[24px] leading-[120%] font-semibold text-black uppercase tracking-wide">
                    {vehicle.name || `${vehicle.brand} ${vehicle.model}`}
                  </h4>
                </div>

                {rows.length > 0 && (
                  <div className="w-full space-y-2">
                    {rows.map((row, rowIdx) => (
                      <div
                        key={`${row.label}-${rowIdx}`}
                        className={`flex items-center justify-between gap-6 text-[16px] leading-[120%] ${rowIdx < rows.length - 1 ? 'pb-2 border-b border-[#E6EDF6]' : 'pb-2'}`}
                      >
                        <span className="font-medium text-[#424F60]">
                          {row.label}
                        </span>
                        <span
                          className="font-semibold text-[#181D23] truncate text-right"
                          title={row.value || undefined}
                        >
                          {row.value}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {hasAdditional && (
                  <div className="mt-auto pt-5 text-[16px] leading-[120%]">
                    <div className="font-semibold text-[#181D23] mb-2">
                      Другие опции
                    </div>
                    <div className="text-[#181D23] whitespace-pre-wrap">{additionalOptions}</div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

      </div>
    </div>
  );
};

export default VehicleSearchResults;
