import React, { useState, useEffect, useRef } from 'react';
import { useLazyQuery } from '@apollo/client';
import { LaximoWizardStep, LaximoVehicleSearchResult } from '@/types/laximo';
import { GET_LAXIMO_WIZARD2, FIND_LAXIMO_VEHICLE_BY_WIZARD } from '@/lib/graphql';
import { Combobox } from '@headlessui/react';

interface WizardSearchFormProps {
  catalogCode: string;
  onVehicleFound: (vehicles: LaximoVehicleSearchResult[]) => void;
}

const WizardSearchForm: React.FC<WizardSearchFormProps> = ({
  catalogCode,
  onVehicleFound
}) => {
  const [wizardSteps, setWizardSteps] = useState<LaximoWizardStep[]>([]);
  const [selectedParams, setSelectedParams] = useState<Record<string, { key: string; value: string }>>({});
  const [currentSsd, setCurrentSsd] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [queries, setQueries] = useState<Record<string, string>>({});
  const buttonRefs = useRef<Record<string, React.RefObject<HTMLButtonElement | null>>>({});
  const inputRefs = useRef<Record<string, React.RefObject<HTMLInputElement | null>>>({});
  const [showSearchButton, setShowSearchButton] = React.useState(true);

  const [getWizard2] = useLazyQuery(GET_LAXIMO_WIZARD2, {
    onCompleted: (data) => {
      if (data.laximoWizard2) {
        console.log('🔄 Wizard обновлен:', { 
          steps: data.laximoWizard2.length, 
          selectedParams: Object.keys(selectedParams).length,
          currentSsd 
        });
        setWizardSteps(data.laximoWizard2);
        setIsLoading(false);
      }
    },
    onError: (error) => {
      setError('Ошибка загрузки параметров поиска');
      setIsLoading(false);
      console.error('Error loading wizard:', error);
    }
  });

  const [findVehicleByWizard] = useLazyQuery(FIND_LAXIMO_VEHICLE_BY_WIZARD, {
    onCompleted: (data) => {
      if (data.laximoFindVehicleByWizard) {
        onVehicleFound(data.laximoFindVehicleByWizard);
        setIsLoading(false);
      }
    },
    onError: (error) => {
      setError('Ошибка поиска автомобилей');
      setIsLoading(false);
      console.error('Error finding vehicles:', error);
    }
  });

  // Загружаем начальные параметры при монтировании
  useEffect(() => {
    if (catalogCode) {
      setIsLoading(true);
      setError('');
      setSelectedParams({});
      setCurrentSsd('');
      getWizard2({
        variables: {
          catalogCode,
          ssd: ''
        }
      });
    }
  }, [catalogCode, getWizard2]);

  // При каждом рендере wizardSteps гарантируем наличие ref для каждого шага
  wizardSteps.forEach(step => {
    if (!buttonRefs.current[step.conditionid]) {
      buttonRefs.current[step.conditionid] = React.createRef<HTMLButtonElement>();
    }
  });

  // --- Автовыбор единственного варианта для всех шагов ---
  React.useEffect(() => {
    // Предотвращаем автовыбор во время загрузки
    if (isLoading) return;
    
    wizardSteps.forEach(step => {
      const options = step.options || [];
      const selectedKey = selectedParams[step.conditionid]?.key || (step.determined ? options.find(o => o.value === step.value)?.key : '');
      
      // Автовыбираем только если есть единственный вариант и он еще не выбран
      if (options.length === 1 && selectedKey !== options[0].key && !selectedParams[step.conditionid]) {
        handleParamSelect(step, options[0].key, options[0].value);
      }
    });
    // eslint-disable-next-line
  }, [wizardSteps, selectedParams, isLoading]);

  // Обработка выбора параметра
  const handleParamSelect = async (step: LaximoWizardStep, optionKey: string, optionValue: string) => {
    // Проверяем, не выбран ли уже этот параметр
    if (selectedParams[step.conditionid]?.key === optionKey) {
      return;
    }
    
    setIsLoading(true);
    setError('');

    // Обновляем выбранные параметры
    const newSelectedParams = {
      ...selectedParams,
      [step.conditionid]: { key: optionKey, value: optionValue }
    };
    setSelectedParams(newSelectedParams);

    // Устанавливаем новый SSD
    const newSsd = optionKey;
    setCurrentSsd(newSsd);

    try {
      // Загружаем обновленные шаги wizard с новым SSD
      await getWizard2({
        variables: {
          catalogCode,
          ssd: newSsd
        }
      });
    } catch (error) {
      setError('Ошибка обновления параметров');
      setIsLoading(false);
    }
  };

  // Сброс параметра
  const handleParamReset = async (step: LaximoWizardStep) => {
    console.log('🔄 Сброс параметра:', { 
      stepName: step.name, 
      conditionId: step.conditionid,
      currentSsd,
      selectedParamsBefore: Object.keys(selectedParams)
    });
    
    setIsLoading(true);
    setError('');

    // Убираем параметр из выбранных
    const newSelectedParams = { ...selectedParams };
    delete newSelectedParams[step.conditionid];
    setSelectedParams(newSelectedParams);

    // Находим правильный SSD для сброса этого параметра
    // Нужно найти SSD, который соответствует состоянию до выбора этого параметра
    let resetSsd = '';
    
    // Ищем среди шагов wizard тот, который имеет правильный SSD для восстановления
    const currentStepIndex = wizardSteps.findIndex(s => s.conditionid === step.conditionid);
    
    // Если есть предыдущие шаги с выбранными параметрами, используем их SSD
    for (let i = currentStepIndex - 1; i >= 0; i--) {
      const prevStep = wizardSteps[i];
      if (newSelectedParams[prevStep.conditionid]) {
        resetSsd = newSelectedParams[prevStep.conditionid].key;
        break;
      }
    }
    
    // Если не нашли предыдущий SSD, используем step.ssd или пустую строку
    if (!resetSsd) {
      resetSsd = step.ssd || '';
    }
    
    console.log('🔄 Новый SSD для сброса:', { 
      resetSsd, 
      selectedParamsAfter: Object.keys(newSelectedParams),
      stepSsd: step.ssd
    });
    
    setCurrentSsd(resetSsd);

    try {
      // Загружаем обновленные шаги wizard
      await getWizard2({
        variables: {
          catalogCode,
          ssd: resetSsd
        }
      });
    } catch (error) {
      setError('Ошибка сброса параметра');
      setIsLoading(false);
    }
  };

  // Поиск автомобилей по выбранным параметрам
  const handleFindVehicles = () => {
    if (!currentSsd) {
      setError('Выберите хотя бы один параметр для поиска');
      return;
    }

    setIsLoading(true);
    setError('');

    findVehicleByWizard({
      variables: {
        catalogCode,
        ssd: currentSsd
      }
    });
  };

  // Проверяем можно ли искать автомобили
  const canListVehicles = wizardSteps.some(step => 
    step.allowlistvehicles && (step.determined || selectedParams[step.conditionid])
  );

  // Скрывать кнопку и блок после поиска, показывать при изменении параметров
  React.useEffect(() => {
    setShowSearchButton(true);
  }, [selectedParams, queries]);

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={() => {
            setError('');
            setIsLoading(true);
            getWizard2({
              variables: { catalogCode, ssd: currentSsd }
            });
          }}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-medium text-blue-900 mb-2">
          Поиск автомобиля по параметрам
        </h3>
        <p className="text-blue-700 text-sm">
          Выберите параметры автомобиля шаг за шагом. После выбора достаточного количества параметров станет доступен поиск автомобилей.
        </p>
      </div> */}

      {/* Индикатор загрузки */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          <span className="ml-3 text-gray-600">Загружаем параметры...</span>
        </div>
      )}

      {/* Шаги wizard */}
      {!isLoading && (
        <div className="flex flex-row flex-wrap gap-4 pb-2">
          {wizardSteps.map((step, index) => {
            const options = step.options || [];
            const query = queries[step.conditionid] || '';
            const filteredOptions = query
              ? options.filter(option => option.value.toLowerCase().includes(query.toLowerCase()))
              : options;
            const buttonRef = buttonRefs.current[step.conditionid];
            // Создаём ref для инпута, если его ещё нет
            if (!inputRefs.current[step.conditionid]) {
              inputRefs.current[step.conditionid] = React.createRef<HTMLInputElement>();
            }
            const inputRef = inputRefs.current[step.conditionid];
            // Определяем выбранный ключ
            const selectedKey = selectedParams[step.conditionid]?.key || (step.determined ? options.find(o => o.value === step.value)?.key : '');
            // Определяем отображаемый label
            const selectedLabel =
              options.find(o => o.key === selectedKey)?.value ||
              selectedParams[step.conditionid]?.value ||
              step.value || '';

            // Если единственный вариант уже выбран — не рендерим селект
            if (options.length === 1 && (selectedKey === options[0].key || step.determined)) {
              return null;
            }

            return (
              <div key={`${step.conditionid}-${index}`} className="space-y-3 min-w-[320px] max-w-[320px] flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <h4 className="text-lg font-medium text-gray-900">{step.name}</h4>
                  </div>
                </div>
                {/* Combobox для выбора опции (всегда показываем, кроме случая с единственным вариантом) */}
                <div className={`w-full max-w-[450px] relative transition-colors duration-200 ${selectedLabel ? 'bg-gray-50 border border-gray-200' : ''}`}>
                  <Combobox
                    value={selectedKey}
                    onChange={key => {
                      const option = options.find(o => o.key === key);
                      if (option) handleParamSelect(step, option.key, option.value);
                    }}
                    disabled={isLoading || options.length === 0}
                  >
                    <div className="relative">
                      {/* Невидимая кнопка поверх инпута */}
                      <button
                        type="button"
                        className="absolute top-0 left-0 w-full h-full opacity-0 z-10 cursor-pointer"
                        tabIndex={0}
                        aria-label="Открыть список опций"
                        onClick={() => {
                          inputRef.current?.focus();
                          if (inputRef.current) {
                            inputRef.current.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
                          }
                        }}
                      />
                      <Combobox.Input
                        ref={inputRef}
                        id={`wizard-combobox-${step.conditionid}`}
                        className={`w-full px-6 py-4 rounded text-sm text-gray-950 placeholder:text-neutral-500 outline-none focus:shadow-none transition-colors pr-12 ${selectedLabel ? 'bg-gray-50 border-gray-200' : 'bg-white border border-stone-300'}`}
                        displayValue={() => selectedLabel}
                        onChange={e => setQueries(q => ({ ...q, [step.conditionid]: e.target.value }))}
                        placeholder="Начните вводить..."
                        autoComplete="off"
                        disabled={options.length === 0}
                      />
                      {selectedLabel ? (
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 w-12 flex items-center justify-center text-gray-400 hover:text-red-600 focus:outline-none z-10"
                          aria-label="Сбросить"
                          tabIndex={0}
                          onClick={() => handleParamReset(step)}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      ) : (
                        <Combobox.Button className="absolute inset-y-0 right-0 w-12 flex items-center justify-center focus:outline-none">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 9l6 6 6-6" />
                          </svg>
                        </Combobox.Button>
                      )}
                      <Combobox.Options
                        className="absolute left-0 top-full z-10 bg-white border-x border-b border-stone-300 rounded-b-lg shadow-lg w-full max-h-60 overflow-auto scrollbar-none"
                        style={{ scrollbarWidth: 'none' }}
                        data-hide-scrollbar
                      >
                        {filteredOptions.length === 0 ? null : filteredOptions.map(option => (
                          <Combobox.Option
                            key={option.key}
                            value={option.key}
                            className={({ active, selected }) =>
                              `px-6 py-4 cursor-pointer hover:!bg-[rgb(236,28,36)] hover:!text-white text-sm transition-colors ${selected ? 'bg-red-50 font-semibold text-gray-950' : 'text-neutral-500'}`
                            }
                          >
                            {option.value}
                          </Combobox.Option>
                        ))}
                      </Combobox.Options>
                    </div>
                  </Combobox>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Информация о недостаточности параметров и кнопка поиска */}
      {!isLoading && wizardSteps.length > 0 && (
        <div className="flex flex-row gap-4 items-center w-full mx-auto max-sm:flex-col max-sm:items-stretch">
          <button
            onClick={() => {
              handleFindVehicles();
              setShowSearchButton(false);
            }}
            disabled={!canListVehicles || isLoading}
            className="w-full sm:w-auto px-8 py-3 bg-red-600 !text-white font-medium rounded-lg shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center max-sm:w-full"
            style={{ minWidth: 180 }}
          >
            Найти
          </button>
          <div
            layer-name="Выберите больше параметров для поиска автомобилей"
            className="box-border inline-flex gap-5 items-center px-10 py-4 rounded-xl bg-slate-50 h-[52px] max-md:px-8 max-md:py-3.5 max-md:w-full max-md:h-auto max-md:max-w-[524px] max-md:min-h-[52px] max-sm:gap-3 max-sm:px-5 max-sm:py-3 max-sm:w-full max-sm:rounded-lg max-sm:justify-center"
          >
            <div>
              <img src="/images/info.svg" alt="info" style={{ width: 18, height: 20, flexShrink: 0 }} />
            </div>
            <div
              layer-name="Выберите больше параметров для поиска автомобилей"
              className="relative text-base font-medium leading-5 text-center text-gray-950 max-md:text-sm max-sm:text-sm max-sm:leading-4 max-sm:text-center"
            >
              Выберите больше параметров для поиска автомобилей
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WizardSearchForm; 