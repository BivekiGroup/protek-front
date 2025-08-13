import * as React from "react";
import { useQuery, useMutation, useLazyQuery } from '@apollo/client';
import { 
  GET_USER_VEHICLES, 
  GET_VEHICLE_SEARCH_HISTORY, 
  CREATE_VEHICLE_FROM_VIN, 
  DELETE_USER_VEHICLE, 
  ADD_VEHICLE_FROM_SEARCH, 
  DELETE_SEARCH_HISTORY_ITEM,
  UserVehicle,
  VehicleSearchHistory 
} from '@/lib/graphql/garage';
import { FIND_LAXIMO_VEHICLE_GLOBAL } from '@/lib/graphql';
import { LaximoVehicleSearchResult } from '@/types/laximo';

const ProfileGarageMain = () => {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [vin, setVin] = React.useState("");
  const [carComment, setCarComment] = React.useState("");
  const [showAddCar, setShowAddCar] = React.useState(false);
  const [expandedVehicle, setExpandedVehicle] = React.useState<string | null>(null);
  const [isAddingVehicle, setIsAddingVehicle] = React.useState(false);

  // GraphQL queries and mutations
  const { data: vehiclesData, loading: vehiclesLoading, refetch: refetchVehicles } = useQuery(GET_USER_VEHICLES);
  const { data: historyData, loading: historyLoading, refetch: refetchHistory } = useQuery(GET_VEHICLE_SEARCH_HISTORY);

  const [searchVehicleByVin] = useLazyQuery(FIND_LAXIMO_VEHICLE_GLOBAL);

  const [createVehicleFromVin] = useMutation(CREATE_VEHICLE_FROM_VIN, {
    onCompleted: () => {
      refetchVehicles();
      setVin('');
      setCarComment('');
      setShowAddCar(false);
      setIsAddingVehicle(false);
    },
    onError: (error) => {
      console.error('Ошибка создания автомобиля:', error);
      alert('Ошибка при добавлении автомобиля');
      setIsAddingVehicle(false);
    }
  });

  const [deleteVehicle] = useMutation(DELETE_USER_VEHICLE, {
    onCompleted: () => refetchVehicles(),
    onError: (error) => {
      console.error('Ошибка удаления автомобиля:', error);
      alert('Ошибка при удалении автомобиля');
    }
  });

  const [addFromSearch] = useMutation(ADD_VEHICLE_FROM_SEARCH, {
    onCompleted: () => {
      refetchVehicles();
      refetchHistory();
    },
    onError: (error) => {
      console.error('Ошибка добавления из истории:', error);
      alert('Ошибка при добавлении автомобиля из истории');
    }
  });

  const [deleteHistoryItem] = useMutation(DELETE_SEARCH_HISTORY_ITEM, {
    onCompleted: () => refetchHistory(),
    onError: (error) => {
      console.error('Ошибка удаления истории:', error);
      alert('Ошибка при удалении из истории');
    }
  });

  const vehicles: UserVehicle[] = vehiclesData?.userVehicles || [];
  const searchHistory: VehicleSearchHistory[] = historyData?.vehicleSearchHistory || [];

  // Фильтрация автомобилей по поисковому запросу
  const filteredVehicles = vehicles.filter(vehicle => 
    vehicle.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vehicle.vin?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vehicle.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vehicle.model?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSaveVehicle = async () => {
    if (!vin.trim()) {
      alert('Введите VIN номер');
      return;
    }

    setIsAddingVehicle(true);
    
    try {
      await createVehicleFromVin({
        variables: {
          vin: vin.trim().toUpperCase(),
          comment: carComment.trim() || null
        }
      });
    } catch (error) {
      console.error('Ошибка сохранения автомобиля:', error);
    }
  };

  const handleDeleteVehicle = async (vehicleId: string) => {
    if (confirm('Вы уверены, что хотите удалить этот автомобиль?')) {
      try {
        await deleteVehicle({ variables: { id: vehicleId } });
      } catch (error) {
        console.error('Ошибка удаления автомобиля:', error);
      }
    }
  };

  const handleAddFromHistory = async (historyItem: VehicleSearchHistory) => {
    try {
      await addFromSearch({
        variables: {
          vin: historyItem.vin,
          comment: ''
        }
      });
    } catch (error) {
      console.error('Ошибка добавления из истории:', error);
    }
  };

  const handleDeleteFromHistory = async (historyId: string) => {
    try {
      await deleteHistoryItem({ variables: { id: historyId } });
    } catch (error) {
      console.error('Ошибка удаления истории:', error);
    }
  };

  const handleFindParts = (vehicle: UserVehicle) => {
    // Переход к поиску запчастей для автомобиля
    if (vehicle.vin) {
      window.location.href = `/vehicle-search-results?q=${encodeURIComponent(vehicle.vin)}`;
    }
  };

  const toggleVehicleExpanded = (vehicleId: string) => {
    setExpandedVehicle(expandedVehicle === vehicleId ? null : vehicleId);
  };

  return (
    <div className="flex flex-col flex-1 shrink justify-center basis-0 w-full max-md:max-w-full">
      <div className="flex flex-wrap gap-5 items-center px-8 py-3 w-full text-base leading-snug text-gray-400 whitespace-nowrap bg-white rounded-lg max-md:px-5 max-md:max-w-full">
        <div className="flex-1 shrink self-stretch my-auto text-gray-400 basis-0 text-ellipsis max-md:max-w-full">
          <input
            type="text"
            placeholder="Поиск по гаражу"
            className="w-full bg-transparent outline-none text-gray-400"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <img
          loading="lazy"
          src="/images/search_ixon.svg"
          className="object-contain shrink-0 self-stretch my-auto w-5 rounded-sm aspect-square"
        />
      </div>
      <div className="flex overflow-hidden flex-col p-8 mt-5 w-full bg-white rounded-2xl max-md:px-5 max-md:max-w-full">
        <div className="text-3xl font-bold leading-none text-gray-950">
          Мои автомобили
        </div>
        
        {vehiclesLoading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          </div>
        )}

        {!vehiclesLoading && filteredVehicles.length === 0 && !showAddCar && (
          <div className="text-center py-8 text-gray-500">
            {vehicles.length === 0 ? 'У вас пока нет автомобилей в гараже' : 'Автомобили не найдены'}
          </div>
        )}

        {!vehiclesLoading && filteredVehicles.map((vehicle) => (
          <div key={vehicle.id} className="mt-8">
            <div className="flex flex-col justify-center px-5 py-3 w-full rounded-lg bg-slate-50 max-md:max-w-full hover:bg-slate-200 transition-colors cursor-pointer">
              <div className="flex flex-wrap gap-8 items-center w-full max-md:max-w-full">
                <div className="flex gap-8 items-center self-stretch my-auto min-w-[240px] max-md:flex-col max-md:min-w-0 max-md:gap-2">
                  <div className="self-stretch my-auto text-xl font-bold leading-none text-gray-950">
                    {vehicle.name || `${vehicle.brand || ''} ${vehicle.model || ''}`.trim() || 'Неизвестный автомобиль'}
                  </div>
                  <div className="self-stretch my-auto text-sm leading-snug text-gray-600 max-md:whitespace-normal">
                    {vehicle.vin || 'VIN не указан'}
                  </div>
                </div>
                <div className="flex-1 shrink gap-2.5 self-stretch px-3.5 py-1.5 my-auto text-sm leading-snug whitespace-nowrap bg-white rounded border border-solid basis-3 border-zinc-100 min-h-[32px] min-w-[240px] text-stone-500 truncate overflow-hidden">
                  {vehicle.comment || 'Комментарий не добавлен'}
                </div>
                <div 
                  className="gap-2.5 self-stretch px-5 py-2 my-auto font-medium leading-tight text-center bg-red-600 rounded-lg min-h-[32px] cursor-pointer text-white hover:bg-red-700 transition-colors" 
                  role="button" 
                  tabIndex={0}
                  onClick={() => handleFindParts(vehicle)}
                >
                  Найти запчасть
                </div>
                <div className="flex gap-5 items-center self-stretch pr-2.5 my-auto text-sm leading-snug text-gray-600 whitespace-nowrap">
                  <button 
                    type="button" 
                    className="flex gap-1.5 items-center self-stretch my-auto text-sm leading-snug text-gray-600 cursor-pointer bg-transparent group"
                    style={{ outline: 'none' }}
                    aria-label="Удалить автомобиль"
                    tabIndex={0}
                    onClick={() => handleDeleteVehicle(vehicle.id)}
                    onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleDeleteVehicle(vehicle.id)}
                    onMouseEnter={e => {
                      const path = e.currentTarget.querySelector('path');
                      if (path) path.setAttribute('fill', '#ec1c24');
                    }}
                    onMouseLeave={e => {
                      const path = e.currentTarget.querySelector('path');
                      if (path) path.setAttribute('fill', '#D0D0D0');
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 18 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M4.625 17.5C4.14375 17.5 3.73192 17.3261 3.3895 16.9782C3.04708 16.6304 2.87558 16.2117 2.875 15.7222V4.16667H2V2.38889H6.375V1.5H11.625V2.38889H16V4.16667H15.125V15.7222C15.125 16.2111 14.9538 16.6298 14.6114 16.9782C14.269 17.3267 13.8568 17.5006 13.375 17.5H4.625ZM6.375 13.9444H8.125V5.94444H6.375V13.9444ZM9.875 13.9444H11.625V5.94444H9.875V13.9444Z"
                        fill="#D0D0D0"
                        style={{ transition: 'fill 0.2s' }}
                      />
                    </svg>
                    <span className="self-stretch my-auto text-gray-600 group-hover:text-red-600">
                      Удалить
                    </span>
                  </button>
                  <button 
                    type="button" 
                    className="flex gap-1.5 items-center self-stretch my-auto cursor-pointer text-sm leading-snug text-gray-600 hover:text-blue-600 transition-colors"
                    onClick={() => toggleVehicleExpanded(vehicle.id)}
                  >
                    <span className="self-stretch my-auto text-gray-600">
                      {expandedVehicle === vehicle.id ? 'Свернуть' : 'Развернуть'}
                    </span>
                    <img
                      loading="lazy"
                      src="/images/arrow_drop.svg"
                      className={`object-contain shrink-0 self-stretch my-auto w-3.5 aspect-square transition-transform ${
                        expandedVehicle === vehicle.id ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                </div>
              </div>
              {/* Расширенная информация об автомобиле — вложена внутрь карточки */}
              <div
                className={
                  `overflow-hidden transition-all duration-300 rounded-lg flex flex-col gap-4` +
                  (expandedVehicle === vehicle.id ? ' py-4 max-h-[1000px] opacity-100 mt-4' : ' max-h-0 opacity-0 pointer-events-none')
                }
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  {vehicle.brand && (
                    <div>
                      <div className="font-bold text-gray-950">Бренд</div>
                      <div className="mt-1.5 text-gray-600">{vehicle.brand}</div>
                    </div>
                  )}
                  {vehicle.model && (
                    <div>
                      <div className="font-bold text-gray-950">Модель</div>
                      <div className="mt-1.5 text-gray-600">{vehicle.model}</div>
                    </div>
                  )}
                  {vehicle.modification && (
                    <div>
                      <div className="font-bold text-gray-950">Модификация</div>
                      <div className="mt-1.5 text-gray-600">{vehicle.modification}</div>
                    </div>
                  )}
                  {vehicle.year && (
                    <div>
                      <div className="font-bold text-gray-950">Год</div>
                      <div className="mt-1.5 text-gray-600">{vehicle.year}</div>
                    </div>
                  )}
                  {vehicle.frame && (
                    <div>
                      <div className="font-bold text-gray-950">Номер кузова</div>
                      <div className="mt-1.5 text-gray-600">{vehicle.frame}</div>
                    </div>
                  )}
                  {vehicle.licensePlate && (
                    <div>
                      <div className="font-bold text-gray-950">Госномер</div>
                      <div className="mt-1.5 text-gray-600">{vehicle.licensePlate}</div>
                    </div>
                  )}
                  {vehicle.mileage && (
                    <div>
                      <div className="font-bold text-gray-950">Пробег</div>
                      <div className="mt-1.5 text-gray-600">{vehicle.mileage.toLocaleString()} км</div>
                    </div>
                  )}
                  <div>
                    <div className="font-bold text-gray-950">Добавлен</div>
                    <div className="mt-1.5 text-gray-600">
                      {new Date(vehicle.createdAt).toLocaleDateString('ru-RU')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        {!showAddCar && (
          <div className="flex mt-8">
            <div
              className="gap-2.5 self-stretch px-5 py-4 bg-red-600 rounded-xl min-h-[50px] cursor-pointer text-white text-base font-medium leading-tight text-center"
              role="button"
              tabIndex={0}
              onClick={() => setShowAddCar(true)}
            >
              Добавить авто
            </div>
          </div>
        )}
        {showAddCar && (
          <>
            <div className="mt-8 text-3xl font-bold leading-none text-gray-950">
              Добавить авто в гараж
            </div>
            <div className="flex flex-col mt-8 w-full text-sm leading-snug whitespace-nowrap text-gray-950 max-md:max-w-full">
              <div className="flex flex-wrap gap-5 items-start w-full min-h-[78px] max-md:max-w-full">
                <div className="flex flex-col flex-1 shrink basis-0 min-w-[240px] max-md:max-w-full">
                  <div className="text-gray-950 max-md:max-w-full">VIN</div>
                  <div className="gap-2.5 self-stretch px-6 py-4 mt-1.5 w-full bg-white rounded border border-solid border-stone-300 min-h-[52px] text-gray-950 max-md:px-5 max-md:max-w-full">
                    <input
                      type="text"
                      placeholder="VIN"
                      className="w-full bg-transparent outline-none text-gray-950"
                      value={vin}
                      onChange={e => setVin(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex flex-col flex-1 shrink basis-0 min-w-[240px] max-md:max-w-full">
                  <div className="text-gray-950 max-md:max-w-full">Комментарий</div>
                  <div className="gap-2.5 self-stretch px-6 py-4 mt-1.5 w-full bg-white rounded border border-solid border-stone-300 min-h-[52px] text-gray-950 max-md:px-5 max-md:max-w-full">
                    <input
                      type="text"
                      placeholder="Комментарий"
                      className="w-full bg-transparent outline-none text-gray-950"
                      value={carComment}
                      onChange={e => setCarComment(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-8 items-start self-start mt-8 text-base font-medium leading-tight text-center whitespace-nowrap">
              <div
                className={`gap-2.5 self-stretch px-5 py-4 rounded-xl min-h-[50px] cursor-pointer text-white transition-colors ${
                  isAddingVehicle 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
                role="button"
                tabIndex={0}
                onClick={handleSaveVehicle}
              >
                {isAddingVehicle ? 'Сохранение...' : 'Сохранить'}
              </div>
              <div
                className="gap-2.5 self-stretch px-5 py-4 rounded-xl border border-red-600 min-h-[50px] cursor-pointer bg-white text-gray-950 hover:bg-gray-50 transition-colors"
                role="button"
                tabIndex={0}
                onClick={() => {
                  setShowAddCar(false);
                  setVin('');
                  setCarComment('');
                }}
              >
                Отменить
              </div>
            </div>
          </>
        )}
      </div>
      <div className="flex overflow-hidden flex-col p-8 mt-5 w-full bg-white rounded-2xl max-md:px-5 max-md:max-w-full">
        <div className="text-3xl font-bold leading-none text-gray-950">
          Ранее вы искали
        </div>
        
        {historyLoading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          </div>
        )}

        {!historyLoading && searchHistory.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            История поиска пуста
          </div>
        )}

        {!historyLoading && searchHistory.length > 0 && (
          <div className="flex flex-col mt-8 w-full max-md:max-w-full">
            {searchHistory.map((historyItem) => (
              <div key={historyItem.id} className="flex flex-col justify-center px-5 py-3 mb-2.5 w-full rounded-lg bg-slate-50 min-h-[44px] max-md:max-w-full hover:bg-slate-200 transition-colors cursor-pointer">
                <div className="flex flex-wrap gap-10 justify-between items-center w-full max-md:max-w-full">
                  <div className="flex gap-8 items-center self-stretch my-auto min-w-[240px] max-md:flex-col max-md:min-w-0 max-md:gap-2">
                    <div className="self-stretch my-auto text-lg font-bold leading-none text-gray-950 w-[300px]">
                      {historyItem.brand && historyItem.model 
                        ? `${historyItem.brand} ${historyItem.model}` 
                        : 'Автомобиль найден'}
                    </div>
                    <div className="self-stretch my-auto text-sm leading-snug text-gray-600">
                      {historyItem.vin}
                    </div>
                  </div>
                  <button 
                    type="button" 
                    className="flex gap-1.5 items-center self-stretch my-auto text-sm leading-snug text-gray-600 cursor-pointer bg-transparent hover:text-green-600 transition-colors"
                    onClick={() => handleAddFromHistory(historyItem)}
                  >
                    <img
                      loading="lazy"
                      src="/images/add.svg"
                      className="object-contain shrink-0 self-stretch my-auto w-4 aspect-square"
                    />
                    <span className="self-stretch my-auto text-gray-600">
                      Добавить в гараж
                    </span>
                  </button>
                  <div className="flex gap-5 items-center self-stretch pr-2.5 my-auto text-sm leading-snug text-gray-600 whitespace-nowrap">
                    <div className="self-stretch my-auto text-gray-600">
                      {new Date(historyItem.searchDate).toLocaleDateString('ru-RU')}
                    </div>
                    <button 
                      type="button" 
                      className="flex gap-1.5 items-center self-stretch my-auto text-sm leading-snug text-gray-600 cursor-pointer bg-transparent group"
                      style={{ outline: 'none' }}
                      aria-label="Удалить из истории поиска"
                      tabIndex={0}
                      onClick={() => handleDeleteFromHistory(historyItem.id)}
                      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleDeleteFromHistory(historyItem.id)}
                      onMouseEnter={e => {
                        const path = e.currentTarget.querySelector('path');
                        if (path) path.setAttribute('fill', '#ec1c24');
                      }}
                      onMouseLeave={e => {
                        const path = e.currentTarget.querySelector('path');
                        if (path) path.setAttribute('fill', '#D0D0D0');
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 18 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M4.625 17.5C4.14375 17.5 3.73192 17.3261 3.3895 16.9782C3.04708 16.6304 2.87558 16.2117 2.875 15.7222V4.16667H2V2.38889H6.375V1.5H11.625V2.38889H16V4.16667H15.125V15.7222C15.125 16.2111 14.9538 16.6298 14.6114 16.9782C14.269 17.3267 13.8568 17.5006 13.375 17.5H4.625ZM6.375 13.9444H8.125V5.94444H6.375V13.9444ZM9.875 13.9444H11.625V5.94444H9.875V13.9444Z"
                          fill="#D0D0D0"
                          style={{ transition: 'fill 0.2s' }}
                        />
                      </svg>
                      <span className="self-stretch my-auto text-gray-600 group-hover:text-red-600">
                        Удалить
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfileGarageMain;


