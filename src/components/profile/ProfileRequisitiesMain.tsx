import * as React from "react";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from '@apollo/client';
import { useRouter } from 'next/router';
import { 
  GET_CLIENT_ME, 
  CREATE_CLIENT_BANK_DETAILS, 
  UPDATE_CLIENT_BANK_DETAILS, 
  DELETE_CLIENT_BANK_DETAILS 
} from '@/lib/graphql';

interface BankDetail {
  id: string;
  name: string;
  accountNumber: string;
  bankName: string;
  bik: string;
  correspondentAccount: string;
  legalEntityId: string;
  legalEntity?: {
    id: string;
    shortName: string;
    inn: string;
  };
}

interface LegalEntity {
  id: string;
  shortName: string;
  inn: string;
  bankDetails: BankDetail[];
}

interface ClientData {
  id: string;
  name: string;
  legalEntities: LegalEntity[];
}

interface ProfileRequisitiesMainProps {
  onCreateLegalEntity?: () => void;
}

const ProfileRequisitiesMain: React.FC<ProfileRequisitiesMainProps> = ({ onCreateLegalEntity }) => {
  const router = useRouter();
  const [selectedLegalEntityId, setSelectedLegalEntityId] = useState<string | null>(null);
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [bik, setBik] = useState("");
  const [bankName, setBankName] = useState("");
  const [corrAccount, setCorrAccount] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBankDetail, setEditingBankDetail] = useState<BankDetail | null>(null);

  // GraphQL запросы
  const { data, loading, error, refetch } = useQuery(GET_CLIENT_ME, {
    onCompleted: (data) => {
      console.log('Данные клиента загружены:', data);
      // Устанавливаем первое юридическое лицо как выбранное по умолчанию
      if (data?.clientMe?.legalEntities?.length > 0) {
        setSelectedLegalEntityId(data.clientMe.legalEntities[0].id);
      }
    },
    onError: (error) => {
      console.error('Ошибка загрузки данных клиента:', error);
    }
  });

  const [createBankDetails] = useMutation(CREATE_CLIENT_BANK_DETAILS, {
    onCompleted: () => {
      console.log('Банковские реквизиты созданы');
      clearForm();
      setShowAddForm(false);
      refetch();
    },
    onError: (error) => {
      console.error('Ошибка создания банковских реквизитов:', error);
      alert('Ошибка создания банковских реквизитов: ' + error.message);
    }
  });

  const [updateBankDetails] = useMutation(UPDATE_CLIENT_BANK_DETAILS, {
    onCompleted: () => {
      console.log('Банковские реквизиты обновлены');
      clearForm();
      setShowAddForm(false);
      setEditingBankDetail(null);
      refetch();
    },
    onError: (error) => {
      console.error('Ошибка обновления банковских реквизитов:', error);
      alert('Ошибка обновления банковских реквизитов: ' + error.message);
    }
  });

  const [deleteBankDetails] = useMutation(DELETE_CLIENT_BANK_DETAILS, {
    onCompleted: () => {
      console.log('Банковские реквизиты удалены');
      refetch();
    },
    onError: (error) => {
      console.error('Ошибка удаления банковских реквизитов:', error);
      alert('Ошибка удаления банковских реквизитов: ' + error.message);
    }
  });

  const clearForm = () => {
    setAccountName("");
    setAccountNumber("");
    setBik("");
    setBankName("");
    setCorrAccount("");
  };

  const handleSave = async () => {
    // Валидация
    if (!accountName.trim()) {
      alert('Введите название счета');
      return;
    }

    if (!accountNumber.trim() || accountNumber.length < 20) {
      alert('Введите корректный номер расчетного счета');
      return;
    }

    if (!bik.trim() || bik.length !== 9) {
      alert('Введите корректный БИК (9 цифр)');
      return;
    }

    if (!bankName.trim()) {
      alert('Введите наименование банка');
      return;
    }

    if (!corrAccount.trim() || corrAccount.length < 20) {
      alert('Введите корректный корреспондентский счет');
      return;
    }

    // Определяем legalEntityId для сохранения
    let legalEntityIdForSave = selectedLegalEntityId;
    
    // Если юридическое лицо не выбрано, но есть только одно - используем его
    if (!legalEntityIdForSave && legalEntities.length === 1) {
      legalEntityIdForSave = legalEntities[0].id;
    }
    
    if (!legalEntityIdForSave) {
      alert('Выберите юридическое лицо');
      return;
    }

    try {
      const input = {
        name: accountName.trim(),
        accountNumber: accountNumber.trim(),
        bik: bik.trim(),
        bankName: bankName.trim(),
        correspondentAccount: corrAccount.trim()
      };

      if (editingBankDetail) {
        // Обновляем существующие реквизиты
        await updateBankDetails({
          variables: {
            id: editingBankDetail.id,
            input,
            legalEntityId: legalEntityIdForSave
          }
        });
      } else {
        // Создаем новые реквизиты
        await createBankDetails({
          variables: {
            legalEntityId: legalEntityIdForSave,
            input
          }
        });
      }
    } catch (error) {
      console.error('Ошибка сохранения:', error);
    }
  };

  const handleEdit = (bankDetail: BankDetail) => {
    console.log('Редактирование банковских реквизитов:', bankDetail);
    setEditingBankDetail(bankDetail);
    setAccountName(bankDetail.name);
    setAccountNumber(bankDetail.accountNumber);
    setBik(bankDetail.bik);
    setBankName(bankDetail.bankName);
    setCorrAccount(bankDetail.correspondentAccount);
    setSelectedLegalEntityId(bankDetail.legalEntityId);
    setShowAddForm(true);
  };

  const handleDelete = async (bankDetailId: string, bankDetailName: string) => {
    if (window.confirm(`Вы уверены, что хотите удалить банковские реквизиты "${bankDetailName}"?`)) {
      try {
        await deleteBankDetails({
          variables: { id: bankDetailId }
        });
      } catch (error) {
        console.error('Ошибка удаления:', error);
      }
    }
  };

  const handleCancel = () => {
    clearForm();
    setShowAddForm(false);
    setEditingBankDetail(null);
  };

  const handleAddNew = () => {
    clearForm();
    setEditingBankDetail(null);
    setShowAddForm(true);
  };

  const clientData: ClientData | null = data?.clientMe || null;
  const legalEntities = clientData?.legalEntities || [];

  useEffect(() => {
    if (legalEntities.length === 0) {
      return;
    }

    if (!selectedLegalEntityId || !legalEntities.some(le => le.id === selectedLegalEntityId)) {
      setSelectedLegalEntityId(legalEntities[0].id);
    }
  }, [legalEntities, selectedLegalEntityId]);

  if (loading) {
    return (
      <div className="flex flex-col flex-1 shrink justify-center basis-0 min-w-[240px] max-md:max-w-full">
        <div className="flex flex-col items-center justify-center p-8 bg-white rounded-2xl">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          <div className="mt-4 text-gray-600">Загрузка данных...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col flex-1 shrink justify-center basis-0 min-w-[240px] max-md:max-w-full">
        <div className="flex flex-col items-center justify-center p-8 bg-white rounded-2xl">
          <div className="text-red-600 text-center">
            <div className="text-lg font-semibold mb-2">Ошибка загрузки данных</div>
            <div className="text-sm">{error.message}</div>
            <button 
              onClick={() => refetch()} 
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Повторить
            </button>
          </div>
        </div>
      </div>
    );
  }

  const selectedLegalEntity = legalEntities.find(le => le.id === selectedLegalEntityId) || legalEntities[0] || null;
  const bankDetails = selectedLegalEntity?.bankDetails?.filter(bd => bd && bd.id) || [];

  if (legalEntities.length === 0) {
    return (
      <div className="flex flex-col flex-1 shrink justify-center basis-0 min-w-[240px] max-md:max-w-full">
        <div className="flex overflow-hidden flex-col items-center p-12 w-full bg-white rounded-2xl max-md:px-5 max-md:max-w-full">
          {/* Иконка */}
          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-red-50 mb-6">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6.66699 8.33337H33.3337M6.66699 20H33.3337M6.66699 31.6667H33.3337" stroke="#EC1C24" strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx="10" cy="8.33337" r="1.5" fill="#EC1C24"/>
              <circle cx="10" cy="20" r="1.5" fill="#EC1C24"/>
              <circle cx="10" cy="31.6667" r="1.5" fill="#EC1C24"/>
            </svg>
          </div>

          {/* Заголовок */}
          <div className="text-2xl font-bold leading-none text-gray-950 text-center mb-3">
            Начните с добавления юридического лица
          </div>

          {/* Описание */}
          <div className="text-base text-gray-600 text-center max-w-md mb-8">
            Для добавления банковских реквизитов сначала необходимо создать юридическое лицо. Это займет всего пару минут.
          </div>

          {/* Кнопка */}
          <button
            onClick={() => {
              if (onCreateLegalEntity) {
                onCreateLegalEntity();
              } else {
                router.push('/profile-set');
              }
            }}
            style={{ color: '#FFFFFF' }}
            className="flex items-center gap-2 px-6 py-4 bg-red-600 rounded-xl cursor-pointer text-white text-base font-semibold leading-tight text-center hover:bg-red-700 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Добавить юридическое лицо
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 w-full">
      <div className="flex overflow-hidden flex-col p-8 w-full text-3xl font-bold leading-none bg-white rounded-2xl max-md:px-5 max-md:max-w-full">
        <div className="text-gray-950 max-md:max-w-full">
          Реквизиты {selectedLegalEntity ? selectedLegalEntity.shortName : 'юридического лица'}
        </div>
        {legalEntities.length > 1 && (
          <div className="flex flex-wrap gap-2 items-center mt-6">
            {legalEntities.map((entity) => (
              <button
                key={entity.id}
                type="button"
                onClick={() => {
                  if (selectedLegalEntity?.id === entity.id) {
                    return;
                  }
                  setSelectedLegalEntityId(entity.id);
                  if (showAddForm) {
                    setShowAddForm(false);
                    setEditingBankDetail(null);
                  }
                }}
                className={`px-3 py-1.5 rounded-full border text-sm transition-colors ${selectedLegalEntity?.id === entity.id ? 'border-red-600 text-red-600 bg-[#FFF5F5]' : 'border-slate-200 text-gray-600 hover:border-red-400 hover:text-red-600'}`}
              >
                {entity.shortName}
              </button>
            ))}
          </div>
        )}
        <div className="flex flex-col mt-6 w-full text-sm leading-snug text-gray-600 max-md:max-w-full">
          {bankDetails.length === 0 ? (
            <div className="flex flex-col items-center py-12 px-6 bg-slate-50 rounded-2xl">
              {/* Иконка */}
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-50 mb-4">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 6V26M6 16H26" stroke="#EC1C24" strokeWidth="2.5" strokeLinecap="round"/>
                  <rect x="4" y="4" width="24" height="24" rx="4" stroke="#EC1C24" strokeWidth="2" strokeDasharray="4 4"/>
                </svg>
              </div>

              {/* Заголовок */}
              <div className="text-lg font-semibold text-gray-950 text-center mb-2">
                Добавьте банковские реквизиты
              </div>

              {/* Описание */}
              <div className="text-sm text-gray-600 text-center max-w-sm mb-6">
                У {selectedLegalEntity?.shortName || 'выбранного юридического лица'} пока нет банковских реквизитов. Добавьте их для оформления документов.
              </div>

              {/* Кнопка */}
              <button
                onClick={() => setShowAddForm(true)}
                style={{ color: '#FFFFFF' }}
                className="flex items-center gap-2 px-5 py-3 bg-red-600 rounded-xl cursor-pointer text-white text-sm font-semibold leading-tight text-center hover:bg-red-700 transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 3.6V14.4M3.6 9H14.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Добавить реквизиты
              </button>
            </div>
          ) : (
            bankDetails.map((bankDetail) => (
              <div key={bankDetail.id} className="flex flex-col justify-center px-5 py-3 w-full rounded-lg bg-slate-50 max-md:max-w-full mb-2.5">
                <div className="flex flex-wrap items-center justify-between gap-3 w-full text-sm leading-5 text-gray-600">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-base font-semibold leading-5 text-gray-950">
                      {bankDetail.name}
                    </span>
                    <span className="hidden md:inline text-gray-300" aria-hidden="true">·</span>
                    <span>№ р/с {bankDetail.accountNumber}</span>
                    <span className="hidden md:inline text-gray-300" aria-hidden="true">·</span>
                    <span>{bankDetail.bankName}</span>
                    <span className="hidden md:inline text-gray-300" aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1.5" role="button" tabIndex={0} aria-label="Юридическое лицо">
                      <img
                        src="/images/icon-setting.svg"
                        alt="ЮЛ"
                        className="object-contain w-[18px] h-[18px]"
                      />
                      <span>
                        {selectedLegalEntity?.shortName || 'Юридическое лицо'}
                      </span>
                    </span>
                  </div>
                  <div className="flex gap-4 items-center text-sm leading-5 text-gray-500 whitespace-nowrap">
                    <div
                      className="flex gap-1.5 items-center cursor-pointer hover:text-red-600"
                      role="button"
                      tabIndex={0}
                      aria-label="Редактировать счет"
                      onClick={() => handleEdit(bankDetail)}
                    >
                      <img
                        src="/images/edit.svg"
                        alt="Редактировать"
                        className="object-contain w-[18px] h-[18px]"
                      />
                      <div className="self-stretch my-auto text-sm leading-5 text-gray-600">
                        Редактировать
                      </div>
                    </div>
                    <div
                      className="flex gap-1.5 items-center cursor-pointer hover:text-red-600"
                      role="button"
                      tabIndex={0}
                      aria-label="Удалить счет"
                      onClick={() => handleDelete(bankDetail.id, bankDetail.name)}
                    >
                      <img
                        src="/images/delete.svg"
                        alt="Удалить"
                        className="object-contain w-[18px] h-[18px]"
                      />
                      <div className="self-stretch my-auto text-sm leading-5 text-gray-600">
                        Удалить
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        {!showAddForm && (
          <div 
            className="gap-2.5 self-stretch px-5 py-4 my-4 bg-red-600 rounded-xl min-h-[50px] cursor-pointer text-white text-base font-medium leading-tight text-center w-fit hover:bg-red-700" 
            onClick={handleAddNew}
          >
            Добавить реквизиты {selectedLegalEntity ? `для ${selectedLegalEntity.shortName}` : ''}
          </div>
        )}
        {showAddForm && (
          <>
            <div className="mt-8 text-gray-950 text-2xl font-bold flex items-center gap-3">
              <span>{editingBankDetail ? 'Редактирование реквизитов' : 'Добавление реквизитов'}</span>
              {legalEntities.length === 1 && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F5F8FB] border border-stone-200 text-gray-700">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 9L12 4L21 9V20H15V13H9V20H3V9Z" stroke="#424F60" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="font-medium">{legalEntities[0].shortName}</span>
                  <span className="text-gray-400">·</span>
                  <span className="text-xs font-mono">ИНН {legalEntities[0].inn}</span>
                </div>
              )}
            </div>
            
            {/* Выбор юридического лица */}
            {legalEntities.length > 1 && (
              <div className="flex flex-col mt-4 w-full">
                <div className="text-sm text-gray-950 mb-2">
                  Юридическое лицо
                  {editingBankDetail && (
                    <span className="text-xs text-gray-500 ml-2">
                      (при редактировании можно изменить привязку)
                    </span>
                  )}
                </div>
                <select
                  value={selectedLegalEntityId || ''}
                  onChange={(e) => setSelectedLegalEntityId(e.target.value)}
                  className="gap-2.5 px-6 py-4 w-full bg-white rounded border border-solid border-stone-300 min-h-[52px] text-gray-600 outline-none "
                >
                  <option value="">Выберите юридическое лицо</option>
                  {legalEntities.map((entity) => (
                    <option key={entity.id} value={entity.id}>
                      {entity.shortName} (ИНН: {entity.inn})
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            {/* Если юридическое лицо одно, компактный бейдж уже показан в заголовке */}

            <div className="flex flex-col mt-8 w-full text-sm leading-snug max-md:max-w-full">
              <div className="flex flex-row flex-wrap gap-5 items-start w-full min-h-[78px] max-md:max-w-full">
                <div className="flex flex-col flex-1 shrink basis-0 min-w-[210px]">
                  <div className="text-gray-950 whitespace-nowrap">Название счета</div>
                  <input
                    type="text"
                    value={accountName}
                    onChange={e => setAccountName(e.target.value)}
                    placeholder="Произвольное название"
                    className="gap-2.5 self-stretch px-6 py-4 mt-1.5 w-full text-gray-600 bg-white rounded border border-solid border-stone-300 min-h-[52px] max-md:px-5 outline-none "
                  />
                </div>
                <div className="flex flex-col flex-1 shrink basis-0 min-w-[210px]">
                  <div className="text-gray-950 whitespace-nowrap">№ Расчетного счета</div>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={e => setAccountNumber(e.target.value)}
                    placeholder="20 цифр"
                    className="gap-2.5 self-stretch px-6 py-4 mt-1.5 w-full bg-white rounded border border-solid border-stone-300 min-h-[52px] text-neutral-500 max-md:px-5 outline-none "
                  />
                </div>
                <div className="flex flex-col flex-1 shrink whitespace-nowrap basis-0 min-w-[210px]">
                  <div className="text-gray-950 whitespace-nowrap">БИК</div>
                  <input
                    type="text"
                    value={bik}
                    onChange={e => setBik(e.target.value)}
                    placeholder="9 цифр"
                    className="gap-2.5 self-stretch px-6 py-4 mt-1.5 w-full bg-white rounded border border-solid border-stone-300 min-h-[52px] text-neutral-500 max-md:px-5 outline-none "
                  />
                </div>
                <div className="flex flex-col flex-1 shrink basis-0 min-w-[210px]">
                  <div className="text-gray-950 whitespace-nowrap">Наименование банка</div>
                  <input
                    type="text"
                    value={bankName}
                    onChange={e => setBankName(e.target.value)}
                    placeholder="Наименование банка"
                    className="gap-2.5 self-stretch px-6 py-4 mt-1.5 w-full bg-white rounded border border-solid border-stone-300 min-h-[52px] text-neutral-500 max-md:px-5 outline-none "
                  />
                </div>
                <div className="flex flex-col flex-1 shrink basis-0 min-w-[210px]">
                  <div className="text-gray-950 whitespace-nowrap">Корреспондентский счет</div>
                  <input
                    type="text"
                    value={corrAccount}
                    onChange={e => setCorrAccount(e.target.value)}
                    placeholder="20 цифр"
                    className="gap-2.5 self-stretch px-6 py-4 mt-1.5 w-full bg-white rounded border border-solid border-stone-300 min-h-[52px] text-neutral-500 max-md:px-5 outline-none "
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-8 items-start self-start mt-8 text-base font-medium leading-tight text-center whitespace-nowrap">
              <div 
                className="gap-2.5 self-stretch px-5 py-4 my-auto bg-red-600 rounded-xl min-h-[50px] cursor-pointer text-white hover:bg-red-700" 
                onClick={handleSave}
              >
                {editingBankDetail ? 'Сохранить' : 'Добавить'}
              </div>
              <div 
                className="gap-2.5 self-stretch px-5 py-4 my-auto rounded-xl border border-red-600 min-h-[50px] cursor-pointer bg-white text-gray-950 hover:bg-gray-50" 
                onClick={handleCancel}
              >
                Отменить
              </div>
            </div>
          </>
        )}
      </div>
      <div className="flex overflow-hidden gap-10 items-center px-5 py-4 mt-5 w-full text-lg font-medium leading-tight text-center text-black bg-white rounded-2xl max-md:max-w-full">
        <div 
          className="gap-2.5 self-stretch px-10 py-6 my-auto text-black rounded-xl border cursor-pointer border-red-600 border-solid min-w-[240px] max-md:px-5 hover:bg-gray-50"
          onClick={() => router.push('/profile-set')}
        >
          Управление юридическими лицами
        </div>
      </div>
    </div>
  );
}

export default ProfileRequisitiesMain;
