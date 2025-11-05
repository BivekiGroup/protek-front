'use client';

import React from 'react';
import toast from 'react-hot-toast';
import { useMutation } from '@apollo/client';
import { CREATE_CLIENT_LEGAL_ENTITY, UPDATE_CLIENT_LEGAL_ENTITY } from '@/lib/graphql';

interface LegalEntityFormBlockProps {
  inn: string;
  setInn: (value: string) => void;
  form: string;
  setForm: (value: string) => void;
  isFormOpen: boolean;
  setIsFormOpen: (value: boolean | ((prev: boolean) => boolean)) => void;
  formOptions: string[];
  ogrn: string;
  setOgrn: (value: string) => void;
  kpp: string;
  setKpp: (value: string) => void;
  jurAddress: string;
  setJurAddress: (value: string) => void;
  shortName: string;
  setShortName: (value: string) => void;
  fullName: string;
  setFullName: (value: string) => void;
  factAddress: string;
  setFactAddress: (value: string) => void;
  taxSystem: string;
  setTaxSystem: (value: string) => void;
  isTaxSystemOpen: boolean;
  setIsTaxSystemOpen: (value: boolean | ((prev: boolean) => boolean)) => void;
  taxSystemOptions: string[];
  nds: string;
  setNds: (value: string) => void;
  isNdsOpen: boolean;
  setIsNdsOpen: (value: boolean | ((prev: boolean) => boolean)) => void;
  ndsOptions: string[];
  ndsPercent: string;
  setNdsPercent: (value: string) => void;
  accountant: string;
  setAccountant: (value: string) => void;
  responsible: string;
  setResponsible: (value: string) => void;
  responsiblePosition: string;
  setResponsiblePosition: (value: string) => void;
  responsiblePhone: string;
  setResponsiblePhone: (value: string) => void;
  signatory: string;
  setSignatory: (value: string) => void;
  editingEntity?: {
    id: string;
    shortName: string;
    fullName?: string;
    form?: string;
    legalAddress?: string;
    actualAddress?: string;
    taxSystem?: string;
    responsiblePhone?: string;
    responsiblePosition?: string;
    responsibleName?: string;
    accountant?: string;
    signatory?: string;
    registrationReasonCode?: string;
    ogrn?: string;
    inn: string;
    vatPercent: number;
  } | null;
  onAdd: () => void;
  onCancel: () => void;
}

const labelClass = 'text-[11px] font-semibold uppercase tracking-wide text-gray-500';
const fieldWrapperClass = 'flex flex-col gap-3 rounded-xl border border-slate-200 bg-white px-4 py-4';
const inputClass = 'rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-100';
const inputErrorClass = 'border-red-500 focus:border-red-500 focus:ring-red-200';
const selectButtonClass = 'flex w-full items-center justify-between gap-3 rounded-lg border border-slate-300 bg-white px-4 py-3 text-left text-sm text-gray-900 transition focus:outline-none focus:ring-2 focus:ring-red-100';
const selectErrorClass = 'border-red-500 focus:border-red-500 focus:ring-red-200';
const dropdownClass = 'absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg';
const dropdownItemClass = 'px-4 py-2.5 text-sm text-gray-700 transition hover:bg-red-50';

const LegalEntityFormBlock: React.FC<LegalEntityFormBlockProps> = (props) => {
  const {
    inn,
    setInn,
    form,
    setForm,
    isFormOpen,
    setIsFormOpen,
    formOptions,
    ogrn,
    setOgrn,
    kpp,
    setKpp,
    jurAddress,
    setJurAddress,
    shortName,
    setShortName,
    fullName,
    setFullName,
    factAddress,
    setFactAddress,
    taxSystem,
    setTaxSystem,
    isTaxSystemOpen,
    setIsTaxSystemOpen,
    taxSystemOptions,
    nds,
    setNds,
    isNdsOpen,
    setIsNdsOpen,
    ndsOptions,
    ndsPercent,
    setNdsPercent,
    accountant,
    setAccountant,
    responsible,
    setResponsible,
    responsiblePosition,
    setResponsiblePosition,
    responsiblePhone,
    setResponsiblePhone,
    signatory,
    setSignatory,
    editingEntity,
    onAdd,
    onCancel,
  } = props;

  const [validationErrors, setValidationErrors] = React.useState({
    inn: false,
    shortName: false,
    jurAddress: false,
    form: false,
    taxSystem: false,
  });
  const [daDataError, setDaDataError] = React.useState<string | null>(null);
  const [daDataLoading, setDaDataLoading] = React.useState(false);
  const [hasAutoData, setHasAutoData] = React.useState(false);
  const [showAutoDetails, setShowAutoDetails] = React.useState(false);
  const [isEditingDetails, setIsEditingDetails] = React.useState(false);
  const addButtonRef = React.useRef<HTMLButtonElement | null>(null);

  React.useEffect(() => {
    if (hasAutoData && !isEditingDetails) {
      addButtonRef.current?.focus();
    }
  }, [hasAutoData, isEditingDetails]);

  const [createLegalEntity, { loading: createLoading }] = useMutation(CREATE_CLIENT_LEGAL_ENTITY, {
    onCompleted: () => {
      toast.success('Юр. лицо добавлено');
      onAdd();
    },
    onError: (error) => {
      console.error(error);
      toast.error(error.message || 'Ошибка создания юр. лица');
    },
  });

  const [updateLegalEntity, { loading: updateLoading }] = useMutation(UPDATE_CLIENT_LEGAL_ENTITY, {
    onCompleted: () => {
      toast.success('Юр. лицо обновлено');
      onAdd();
    },
    onError: (error) => {
      console.error(error);
      toast.error(error.message || 'Ошибка обновления юр. лица');
    },
  });

  const loading = createLoading || updateLoading;

  const clearError = (key: keyof typeof validationErrors) => {
    setValidationErrors((prev) => ({ ...prev, [key]: false }));
  };

  const handleSave = async () => {
    const errors = {
      inn: !inn || inn.trim().length < 10,
      shortName: !shortName.trim(),
      jurAddress: !jurAddress.trim(),
      form: form === 'Выбрать',
      taxSystem: taxSystem === 'Выбрать',
    } as const;

    if (Object.values(errors).some(Boolean)) {
      setValidationErrors(errors as any);
      return;
    }

    let vatPercent = 20;
    if (nds === 'Без НДС') vatPercent = 0;
    else if (nds === 'НДС 10%') vatPercent = 10;
    else if (nds === 'НДС 20%') vatPercent = 20;
    else if (ndsPercent) vatPercent = parseFloat(ndsPercent) || 20;

    const input = {
      inn: inn.trim(),
      shortName: shortName.trim(),
      fullName: (fullName || shortName).trim(),
      form,
      legalAddress: jurAddress.trim(),
      actualAddress: factAddress.trim() || null,
      taxSystem,
      vatPercent,
      accountant: accountant.trim() || null,
      responsibleName: responsible.trim() || null,
      responsiblePosition: responsiblePosition.trim() || null,
      responsiblePhone: responsiblePhone.trim() || null,
      signatory: signatory.trim() || null,
      ogrn: ogrn.trim() || null,
      registrationReasonCode: kpp.trim() || null,
    };

    if (editingEntity) {
      await updateLegalEntity({ variables: { id: editingEntity.id, input } });
    } else {
      await createLegalEntity({ variables: { input } });
    }
  };

  const handleFillFromInn = async () => {
    try {
      setDaDataError(null);
      const query = inn.trim();
      if (!query) {
        setDaDataError('Введите ИНН');
        return;
      }
      if (query.length < 10) {
        setDaDataError('ИНН должен быть не короче 10 символов');
        return;
      }

      setDaDataLoading(true);
      const cmsGraphql = process.env.NEXT_PUBLIC_CMS_GRAPHQL_URL || 'http://localhost:3000/api/graphql';
      const cmsDaDataUrl = cmsGraphql.replace(/\/api\/graphql.*/, '/api/dadata/party');
      const response = await fetch(cmsDaDataUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, branch_type: 'MAIN', count: 1 }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || 'DaData error');
      }

      const data = payload?.suggestions?.[0]?.data || {};
      const nameShort = data?.name?.short || data?.name?.short_with_opf;
      const nameFull = data?.name?.full || data?.name?.full_with_opf;
      const opfShort = data?.opf?.short;
      const addr = data?.address?.unrestricted_value || data?.address?.value;

      if (nameShort) setShortName(nameShort);
      if (nameFull) setFullName(nameFull);
      if (data?.ogrn) setOgrn(data.ogrn);
      if (data?.kpp) setKpp(data.kpp);
      if (addr) {
        setJurAddress(addr);
        setFactAddress(addr);
      }

      const mappedForm = opfShort && ['ООО', 'ИП', 'АО', 'ПАО'].includes(opfShort) ? opfShort : 'Другое';
      setForm(mappedForm);

      setHasAutoData(true);
      setShowAutoDetails(true);
      setValidationErrors({ inn: false, shortName: false, jurAddress: false, form: false, taxSystem: false });
      setIsEditingDetails(false);
    } catch (error: any) {
      setHasAutoData(false);
      setShowAutoDetails(false);
      setDaDataError(error?.message || 'Не удалось получить данные по ИНН');
      setIsEditingDetails(true);
    } finally {
      setDaDataLoading(false);
    }
  };

  const handleInnChange = (value: string) => {
    setInn(value);
    clearError('inn');
    setHasAutoData(false);
    setShowAutoDetails(false);
    setDaDataError(null);
    // Не сбрасываем isEditingDetails, чтобы форма оставалась открытой если пользователь редактирует
  };

  // Показываем детальные поля только если:
  // 1. Пользователь редактирует существующее юрлицо (editingEntity)
  // 2. Пользователь нажал "Редактировать вручную" (isEditingDetails)
  const isFullFormVisible = !!editingEntity || isEditingDetails;

  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-8 max-md:px-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-3xl font-bold leading-none text-gray-950">
          {editingEntity ? 'Редактирование юрлица' : 'Новое юридическое лицо'}
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-gray-600">
          <span className="text-gray-400">ИНН</span>
          {inn || '—'}
        </span>
      </div>

      <div className={fieldWrapperClass}>
        <span className={labelClass}>ИНН*</span>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            type="text"
            placeholder="10–12 цифр"
            className={`${inputClass} ${validationErrors.inn ? inputErrorClass : ''} sm:flex-1`}
            value={inn}
            onChange={(event) => handleInnChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && inn.trim().length >= 10 && !daDataLoading) {
                event.preventDefault();
                handleFillFromInn();
              }
            }}
          />
          <button
            type="button"
            onClick={handleFillFromInn}
            disabled={daDataLoading || inn.trim().length < 10}
            className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-colors sm:w-auto ${
              daDataLoading
                ? 'cursor-wait bg-red-600/70 text-white'
                : inn.trim().length < 10
                  ? 'cursor-not-allowed bg-slate-200 text-slate-500'
                  : hasAutoData && !isEditingDetails
                    ? 'bg-red-600 text-white opacity-60 hover:opacity-70 focus-visible:opacity-70'
                    : 'bg-red-600 text-white hover:bg-red-700'
            }`}
            style={{ color: '#FFFFFF' }}
          >
            {daDataLoading ? 'Получаем…' : 'Заполнить по ИНН'}
          </button>
        </div>
        <span className="text-xs text-gray-400">Мы подставим остальные поля автоматически, при необходимости их можно поправить.</span>
        {daDataError && <span className="text-xs text-red-600">{daDataError}</span>}
      </div>

      {!hasAutoData && !isEditingDetails && !editingEntity && (
        <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4">
          <div className="flex items-start gap-3">
            <svg className="h-5 w-5 flex-shrink-0 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">Введите ИНН и нажмите кнопку "Заполнить по ИНН"</p>
              <p className="mt-1 text-xs text-blue-700">Мы автоматически заполним все данные организации. При необходимости их можно будет отредактировать.</p>
              <button
                type="button"
                onClick={() => setIsEditingDetails(true)}
                className="mt-3 text-xs font-medium text-blue-600 underline transition hover:text-blue-700"
              >
                Или заполните форму вручную
              </button>
            </div>
          </div>
        </div>
      )}

      {hasAutoData && (
        <div className="mt-5 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700">✓</span>
              <span className="text-sm font-semibold text-gray-900">Данные найдены по ИНН</span>
            </div>
            <button
              type="button"
              onClick={() => setShowAutoDetails((prev) => !prev)}
              className="text-xs font-medium text-blue-600 transition hover:text-blue-700"
            >
              {showAutoDetails ? 'Скрыть детали' : 'Показать детали'}
            </button>
          </div>
          {showAutoDetails && (
            <div className="mt-4 grid gap-3 text-sm text-gray-700 md:grid-cols-2">
              <div>
                <div className="text-gray-400">Краткое наименование</div>
                <div className="font-medium">{shortName || '—'}</div>
              </div>
              <div>
                <div className="text-gray-400">Полное наименование</div>
                <div className="font-medium">{fullName || '—'}</div>
              </div>
              <div>
                <div className="text-gray-400">Форма</div>
                <div className="font-medium">{form || '—'}</div>
              </div>
              <div>
                <div className="text-gray-400">ОГРН</div>
                <div className="font-medium">{ogrn || '—'}</div>
              </div>
              <div>
                <div className="text-gray-400">КПП</div>
                <div className="font-medium">{kpp || '—'}</div>
              </div>
              <div className="md:col-span-2">
                <div className="text-gray-400">Юридический адрес</div>
                <div className="font-medium">{jurAddress || '—'}</div>
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={() => setIsEditingDetails(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          >
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11.333 2A2.667 2.667 0 0 1 14 4.667v6.666A2.667 2.667 0 0 1 11.333 14H4.667A2.667 2.667 0 0 1 2 11.333V4.667A2.667 2.667 0 0 1 4.667 2h6.666zm0 1.333H4.667c-.736 0-1.333.597-1.333 1.334v6.666c0 .737.597 1.334 1.333 1.334h6.666c.737 0 1.334-.597 1.334-1.334V4.667c0-.737-.597-1.334-1.334-1.334zM9.724 5.61l.943.943-3.781 3.781H5.943V9.39l3.781-3.781zm1.414-1.414a.667.667 0 0 1 0 .943l-.471.471-.943-.943.471-.471a.667.667 0 0 1 .943 0z" fill="currentColor"/>
            </svg>
            Редактировать вручную
          </button>
        </div>
      )}

      {isFullFormVisible && (
        <section className="rounded-2xl border border-slate-200 bg-slate-50/60 px-5 py-6">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">Основная информация</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className={fieldWrapperClass}>
            <span className={labelClass}>Краткое наименование*</span>
            <input
              type="text"
              value={shortName}
              onChange={(event) => {
                setShortName(event.target.value);
                clearError('shortName');
              }}
              className={`${inputClass} ${validationErrors.shortName ? inputErrorClass : ''}`}
              placeholder='Например, ООО "Протек"'
            />
          </div>
          <div className={fieldWrapperClass}>
            <span className={labelClass}>Полное наименование</span>
            <input
              type="text"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              className={inputClass}
              placeholder="По регистрационным документам"
            />
          </div>
          <div className={fieldWrapperClass}>
            <span className={labelClass}>Форма*</span>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsFormOpen((prev) => !prev)}
                onBlur={() => setIsFormOpen(false)}
                className={`${selectButtonClass} ${validationErrors.form ? selectErrorClass : ''}`}
              >
                <span className="truncate">{form}</span>
                <svg className="h-4 w-4 text-gray-400" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {isFormOpen && (
                <ul className={dropdownClass}>
                  {formOptions.map((option) => (
                    <li
                      key={option}
                      className={`${dropdownItemClass} ${option === form ? 'bg-red-50 font-medium text-red-600' : ''}`}
                      onMouseDown={() => {
                        setForm(option);
                        setIsFormOpen(false);
                        clearError('form');
                      }}
                    >
                      {option}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <div className={fieldWrapperClass}>
            <span className={labelClass}>Юридический адрес*</span>
            <textarea
              value={jurAddress}
              onChange={(event) => {
                setJurAddress(event.target.value);
                clearError('jurAddress');
              }}
              className={`${inputClass} h-24 resize-none ${validationErrors.jurAddress ? inputErrorClass : ''}`}
              placeholder="Город, улица, дом, офис"
            />
          </div>
          <div className={fieldWrapperClass}>
            <span className={labelClass}>Фактический адрес</span>
            <textarea
              value={factAddress}
              onChange={(event) => setFactAddress(event.target.value)}
              className={`${inputClass} h-24 resize-none`}
              placeholder="Если отличается от юридического"
            />
          </div>
        </div>
        </section>
      )}

      {isFullFormVisible && (
        <section className="rounded-2xl border border-slate-200 bg-slate-50/60 px-5 py-6">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">Регистрационные данные</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className={fieldWrapperClass}>
            <span className={labelClass}>ОГРН</span>
            <input
              type="text"
              value={ogrn}
              onChange={(event) => setOgrn(event.target.value)}
              className={inputClass}
              placeholder="13 цифр"
            />
          </div>
          <div className={fieldWrapperClass}>
            <span className={labelClass}>КПП</span>
            <input
              type="text"
              value={kpp}
              onChange={(event) => setKpp(event.target.value)}
              className={inputClass}
              placeholder="9 цифр"
            />
          </div>
        </div>
        </section>
      )}

      {isFullFormVisible && (
        <section className="rounded-2xl border border-slate-200 bg-slate-50/60 px-5 py-6">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">Налоги и контакты</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className={fieldWrapperClass}>
            <span className={labelClass}>Система налогообложения*</span>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsTaxSystemOpen((prev) => !prev)}
                onBlur={() => setIsTaxSystemOpen(false)}
                className={`${selectButtonClass} ${validationErrors.taxSystem ? selectErrorClass : ''}`}
              >
                <span className="truncate">{taxSystem}</span>
                <svg className="h-4 w-4 text-gray-400" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {isTaxSystemOpen && (
                <ul className={dropdownClass}>
                  {taxSystemOptions.map((option) => (
                    <li
                      key={option}
                      className={`${dropdownItemClass} ${option === taxSystem ? 'bg-red-50 font-medium text-red-600' : ''}`}
                      onMouseDown={() => {
                        setTaxSystem(option);
                        setIsTaxSystemOpen(false);
                        clearError('taxSystem');
                      }}
                    >
                      {option}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <div className={fieldWrapperClass}>
            <span className={labelClass}>НДС</span>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsNdsOpen((prev) => !prev)}
                onBlur={() => setIsNdsOpen(false)}
                className={selectButtonClass}
              >
                <span className="truncate">{nds}</span>
                <svg className="h-4 w-4 text-gray-400" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {isNdsOpen && (
                <ul className={dropdownClass}>
                  {ndsOptions.map((option) => (
                    <li
                      key={option}
                      className={`${dropdownItemClass} ${option === nds ? 'bg-red-50 font-medium text-red-600' : ''}`}
                      onMouseDown={() => {
                        setNds(option);
                        setIsNdsOpen(false);
                      }}
                    >
                      {option}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {nds === 'Другое' && (
              <div className="flex flex-col gap-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={ndsPercent}
                  onChange={(event) => setNdsPercent(event.target.value)}
                  className={inputClass}
                  placeholder="Укажите процент"
                />
                <span className="text-xs text-gray-400">Укажите размер НДС вручную</span>
              </div>
            )}
          </div>
          <div className={fieldWrapperClass}>
            <span className={labelClass}>Бухгалтер</span>
            <input
              type="text"
              value={accountant}
              onChange={(event) => setAccountant(event.target.value)}
              className={inputClass}
              placeholder="ФИО бухгалтера"
            />
          </div>
          <div className={fieldWrapperClass}>
            <span className={labelClass}>Ответственный</span>
            <input
              type="text"
              value={responsible}
              onChange={(event) => setResponsible(event.target.value)}
              className={inputClass}
              placeholder="ФИО контактного лица"
            />
          </div>
          <div className={fieldWrapperClass}>
            <span className={labelClass}>Должность ответственного</span>
            <input
              type="text"
              value={responsiblePosition}
              onChange={(event) => setResponsiblePosition(event.target.value)}
              className={inputClass}
              placeholder="Например, коммерческий директор"
            />
          </div>
          <div className={fieldWrapperClass}>
            <span className={labelClass}>Телефон ответственного</span>
            <input
              type="tel"
              value={responsiblePhone}
              onChange={(event) => setResponsiblePhone(event.target.value)}
              className={inputClass}
              placeholder="Укажите номер телефона"
            />
          </div>
          <div className={fieldWrapperClass}>
            <span className={labelClass}>Подписант</span>
            <input
              type="text"
              value={signatory}
              onChange={(event) => setSignatory(event.target.value)}
              className={inputClass}
              placeholder="ФИО лица, подписывающего документы"
            />
          </div>
        </div>
        </section>
      )}

      <div className="mt-4 flex flex-wrap justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-slate-200 px-5 py-3 text-base font-medium text-gray-600 transition hover:bg-slate-50"
        >
          Отмена
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={loading}
          ref={addButtonRef}
          className={`rounded-xl px-5 py-3 text-base font-semibold text-white transition focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50 ${
            loading ? 'cursor-wait bg-red-400' : 'bg-red-600 hover:bg-red-700'
          }`}
          style={{ color: '#FFFFFF' }}
        >
          {editingEntity ? 'Сохранить' : 'Добавить'}
        </button>
      </div>
    </div>
  );
};

export default LegalEntityFormBlock;
