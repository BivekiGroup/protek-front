import React from 'react'
import toast from 'react-hot-toast'
import { useMutation } from '@apollo/client'
import { CREATE_CLIENT_LEGAL_ENTITY, UPDATE_CLIENT_LEGAL_ENTITY } from '@/lib/graphql'

interface LegalEntityFormBlockProps {
  inn: string
  setInn: (v: string) => void
  form: string
  setForm: (v: string) => void
  isFormOpen: boolean
  setIsFormOpen: (v: boolean | ((prev: boolean) => boolean)) => void
  formOptions: string[]
  ogrn: string
  setOgrn: (v: string) => void
  kpp: string
  setKpp: (v: string) => void
  jurAddress: string
  setJurAddress: (v: string) => void
  shortName: string
  setShortName: (v: string) => void
  fullName: string
  setFullName: (v: string) => void
  factAddress: string
  setFactAddress: (v: string) => void
  taxSystem: string
  setTaxSystem: (v: string) => void
  isTaxSystemOpen: boolean
  setIsTaxSystemOpen: (v: boolean | ((prev: boolean) => boolean)) => void
  taxSystemOptions: string[]
  nds: string
  setNds: (v: string) => void
  isNdsOpen: boolean
  setIsNdsOpen: (v: boolean | ((prev: boolean) => boolean)) => void
  ndsOptions: string[]
  ndsPercent: string
  setNdsPercent: (v: string) => void
  accountant: string
  setAccountant: (v: string) => void
  responsible: string
  setResponsible: (v: string) => void
  responsiblePosition: string
  setResponsiblePosition: (v: string) => void
  responsiblePhone: string
  setResponsiblePhone: (v: string) => void
  signatory: string
  setSignatory: (v: string) => void
  editingEntity?: {
    id: string
    shortName: string
    fullName?: string
    form?: string
    legalAddress?: string
    actualAddress?: string
    taxSystem?: string
    responsiblePhone?: string
    responsiblePosition?: string
    responsibleName?: string
    accountant?: string
    signatory?: string
    registrationReasonCode?: string
    ogrn?: string
    inn: string
    vatPercent: number
  } | null
  onAdd: () => void
  onCancel: () => void
}

const LegalEntityFormBlock: React.FC<LegalEntityFormBlockProps> = (props) => {
  const {
    inn, setInn,
    form, setForm, isFormOpen, setIsFormOpen, formOptions,
    ogrn, setOgrn,
    kpp, setKpp,
    jurAddress, setJurAddress,
    shortName, setShortName,
    fullName, setFullName,
    factAddress, setFactAddress,
    taxSystem, setTaxSystem, isTaxSystemOpen, setIsTaxSystemOpen, taxSystemOptions,
    nds, setNds, isNdsOpen, setIsNdsOpen, ndsOptions, ndsPercent, setNdsPercent,
    accountant, setAccountant,
    responsible, setResponsible,
    responsiblePosition, setResponsiblePosition,
    responsiblePhone, setResponsiblePhone,
    signatory, setSignatory,
    editingEntity, onAdd, onCancel,
  } = props

  const [validationErrors, setValidationErrors] = React.useState({
    inn: false,
    shortName: false,
    jurAddress: false,
    form: false,
    taxSystem: false,
  })
  const clearError = (field: keyof typeof validationErrors) => setValidationErrors(prev => ({ ...prev, [field]: false }))

  const [autoFilled, setAutoFilled] = React.useState<{ [key: string]: boolean }>({})
  const [hasAutoData, setHasAutoData] = React.useState(false)
  const [showAutoEdit, setShowAutoEdit] = React.useState(false)
  const [daDataError, setDaDataError] = React.useState<string | null>(null)
  const [daDataLoading, setDaDataLoading] = React.useState(false)

  const [createLegalEntity, { loading: createLoading }] = useMutation(CREATE_CLIENT_LEGAL_ENTITY, {
    onCompleted: () => { toast.success('Юр. лицо добавлено'); onAdd() },
    onError: (error) => { console.error(error); toast.error('Ошибка создания юр. лица') },
  })
  const [updateLegalEntity, { loading: updateLoading }] = useMutation(UPDATE_CLIENT_LEGAL_ENTITY, {
    onCompleted: () => { toast.success('Юр. лицо обновлено'); onAdd() },
    onError: (error) => { console.error(error); toast.error('Ошибка обновления юр. лица') },
  })
  const loading = createLoading || updateLoading

  const handleSave = async () => {
    setValidationErrors({ inn: false, shortName: false, jurAddress: false, form: false, taxSystem: false })
    const errors = {
      inn: !inn || inn.length < 10,
      shortName: !shortName.trim(),
      jurAddress: !jurAddress.trim(),
      form: form === 'Выбрать',
      taxSystem: taxSystem === 'Выбрать',
    }
    if (Object.values(errors).some(Boolean)) { setValidationErrors(errors as any); return }

    let vatPercent = 20
    if (nds === 'Без НДС') vatPercent = 0
    else if (nds === 'НДС 10%') vatPercent = 10
    else if (nds === 'НДС 20%') vatPercent = 20
    else if (ndsPercent) vatPercent = parseFloat(ndsPercent) || 20

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
    }

    if (editingEntity) await updateLegalEntity({ variables: { id: editingEntity.id, input } })
    else await createLegalEntity({ variables: { input } })
  }

  const handleFillFromInn = async () => {
    try {
      setDaDataError(null)
      const q = inn.trim()
      if (!q) { setDaDataError('Введите ИНН'); return }
      if (q.length < 10) { setDaDataError('ИНН должен быть не короче 10 символов'); return }
      setDaDataLoading(true)
      const cmsGraphql = process.env.NEXT_PUBLIC_CMS_GRAPHQL_URL || 'http://localhost:3000/api/graphql'
      const cmsDaDataUrl = cmsGraphql.replace(/\/api\/graphql.*/, '/api/dadata/party')
      const resp = await fetch(cmsDaDataUrl, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q, branch_type: 'MAIN', count: 1 })
      })
      const data = await resp.json()
      if (!resp.ok) throw new Error(data?.error || 'DaData error')
      const d = data?.suggestions?.[0]?.data || {}
      const nameShort = d?.name?.short || d?.name?.short_with_opf
      const nameFull = d?.name?.full || d?.name?.full_with_opf
      const opfShort = d?.opf?.short
      const addr = d?.address?.unrestricted_value || d?.address?.value

      const flags: { [key: string]: boolean } = {}
      if (nameShort) { setShortName(nameShort); flags.shortName = true }
      if (nameFull) { setFullName(nameFull); flags.fullName = true }
      if (d?.ogrn) { setOgrn(d.ogrn); flags.ogrn = true }
      if (d?.kpp) { setKpp(d.kpp); flags.kpp = true }
      if (addr) { setJurAddress(addr); setFactAddress(addr); flags.jurAddress = true }
      const mappedForm = opfShort && ["ООО", "ИП", "АО", "ПАО"].includes(opfShort) ? opfShort : 'Другое'
      setForm(mappedForm); flags.form = true
      setAutoFilled(flags)
      setHasAutoData(true)
      setValidationErrors({ inn: false, shortName: false, jurAddress: false, form: false, taxSystem: false })
    } catch (e: any) {
      setDaDataError(e?.message || 'Не удалось получить данные по ИНН')
    } finally {
      setDaDataLoading(false)
    }
  }

  return (
    <div className="flex overflow-hidden flex-col p-8 mt-5 w-full bg-white rounded-2xl max-md:px-5 max-md:max-w-full">
      <div className="text-3xl font-bold leading-none text-gray-950">
        {editingEntity ? 'Редактирование юридического лица' : 'Данные юридического лица'}
      </div>

      {/* Блок ИНН и кнопка получения */}
      <div className="flex flex-wrap gap-5 items-end mt-8 w-full max-md:max-w-full">
        <div className="flex flex-col flex-1 min-w-[260px]">
          <div className="text-gray-950">ИНН</div>
          <div className={`gap-2.5 self-stretch px-6 py-3.5 mt-1.5 w-full bg-white rounded border border-solid min-h-[46px] ${validationErrors.inn ? 'border-red-500' : 'border-stone-300'}`}>
            <input
              type="text"
              placeholder="ИНН"
              className="w-full bg-transparent outline-none text-gray-600"
              value={inn}
              onChange={e => { setInn(e.target.value); clearError('inn'); setAutoFilled({}); setHasAutoData(false); setDaDataError(null) }}
            />
          </div>
          {daDataError && <div className="text-red-600 text-xs mt-2">{daDataError}</div>}
        </div>
        <div className="flex flex-col">
          <button
            onClick={handleFillFromInn}
            disabled={daDataLoading || inn.trim().length < 10}
            className={`gap-2.5 px-5 py-4 my-auto rounded-xl border min-h-[50px] min-w-[240px] cursor-pointer bg-white ${
              daDataLoading ? 'opacity-60 cursor-wait' : ''
            } ${inn.trim().length < 10 ? 'border-stone-300 text-stone-400' : 'border-red-600 text-gray-950'}`}
            type="button"
          >
            {daDataLoading ? 'Получаем…' : 'Получить по ИНН'}
          </button>
        </div>
      </div>

      {/* Превью авто-полей */}
      {hasAutoData && (
        <div className="mt-5 p-4 rounded-xl border border-stone-200 bg-stone-50">
          <div className="text-gray-900 font-semibold mb-2">Автоматически заполнено (DaData)</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700">
            <div><span className="text-gray-500">Краткое наименование:</span> {shortName || '—'}</div>
            <div><span className="text-gray-500">Полное наименование:</span> {fullName || '—'}</div>
            <div><span className="text-gray-500">Форма:</span> {form || '—'}</div>
            <div><span className="text-gray-500">ОГРН:</span> {ogrn || '—'}</div>
            <div><span className="text-gray-500">КПП:</span> {kpp || '—'}</div>
            <div className="md:col-span-2"><span className="text-gray-500">Юридический адрес:</span> {jurAddress || '—'}</div>
          </div>
          <div className="mt-3">
            <button className="text-blue-600 text-sm underline" onClick={() => setShowAutoEdit(v => !v)}>
              {showAutoEdit ? 'Скрыть редактирование авто-полей' : 'Изменить эти поля'}
            </button>
          </div>
        </div>
      )}

      {/* Редактирование авто-полей по желанию */}
      {hasAutoData && showAutoEdit && (
        <div className="flex flex-wrap gap-5 items-start mt-5 w-full max-md:max-w-full">
          <div className="flex flex-col flex-1 min-w-[240px]">
            <div className="text-gray-950">Форма</div>
            <div className="relative mt-1.5">
              <div className={`flex gap-10 justify-between items-center px-6 py-3.5 w-full bg-white rounded border border-solid min-h-[46px] text-neutral-500 cursor-pointer select-none ${validationErrors.form ? 'border-red-500' : 'border-stone-300'}`}
                onClick={() => setIsFormOpen((prev: boolean) => !prev)} tabIndex={0} onBlur={() => setIsFormOpen(false)}>
                <span className="self-stretch my-auto text-neutral-500">{form}</span>
                <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><path d="M6 8l4 4 4-4" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              {isFormOpen && (
                <ul className="absolute left-0 right-0 z-10 bg-white border-x border-b border-stone-300 rounded-b-lg shadow-lg">
                  {formOptions.map(option => (
                    <li key={option} className={`px-6 py-3.5 cursor-pointer hover:bg-blue-100 ${option === form ? 'bg-blue-50 font-semibold' : ''}`}
                      onMouseDown={() => { setForm(option); setIsFormOpen(false); clearError('form') }}>
                      {option}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <div className="flex flex-col flex-1 min-w-[240px]">
            <div className="text-gray-950">ОГРН</div>
            <div className="gap-2.5 self-stretch px-6 py-3.5 mt-1.5 w-full bg-white rounded border border-solid border-stone-300 min-h-[46px] text-neutral-500">
              <input type="text" placeholder="ОГРН" className="w-full bg-transparent outline-none text-neutral-500"
                value={ogrn} onChange={e => setOgrn(e.target.value)} />
            </div>
          </div>
          <div className="flex flex-col flex-1 min-w-[240px]">
            <div className="text-gray-950">КПП</div>
            <div className="gap-2.5 self-stretch px-6 py-3.5 mt-1.5 w-full bg-white rounded border border-solid border-stone-300 min-h-[46px] text-neutral-500">
              <input type="text" placeholder="КПП" className="w-full bg-transparent outline-none text-neutral-500"
                value={kpp} onChange={e => setKpp(e.target.value)} />
            </div>
          </div>
          <div className="flex flex-col flex-1 min-w-[240px]">
            <div className="text-gray-950">Юридический адрес</div>
            <div className={`gap-2.5 self-stretch px-6 py-3.5 mt-1.5 w-full bg-white rounded border border-solid min-h-[46px] text-neutral-500 ${validationErrors.jurAddress ? 'border-red-500' : 'border-stone-300'}`}>
              <input type="text" placeholder="Юридический адрес" className="w-full bg-transparent outline-none text-neutral-500"
                value={jurAddress} onChange={e => { setJurAddress(e.target.value); clearError('jurAddress') }} />
            </div>
          </div>
          <div className="flex flex-col flex-1 min-w-[240px]">
            <div className="text-gray-950">Краткое наименование</div>
            <div className={`gap-2.5 self-stretch px-6 py-3.5 mt-1.5 w-full bg-white rounded border border-solid min-h-[46px] text-neutral-500 ${validationErrors.shortName ? 'border-red-500' : 'border-stone-300'}`}>
              <input type="text" placeholder="Краткое наименование" className="w-full bg-transparent outline-none text-neutral-500"
                value={shortName} onChange={e => { setShortName(e.target.value); clearError('shortName') }} />
            </div>
          </div>
          <div className="flex flex-col flex-1 min-w-[240px]">
            <div className="text-gray-950">Полное наименование</div>
            <div className="gap-2.5 self-stretch px-6 py-3.5 mt-1.5 w-full bg-white rounded border border-solid border-stone-300 min-h-[46px] text-neutral-500">
              <input type="text" placeholder="Полное наименование" className="w-full bg-transparent outline-none text-neutral-500"
                value={fullName} onChange={e => setFullName(e.target.value)} />
            </div>
          </div>
        </div>
      )}

      {/* Остальные поля показываем только после получения данных по ИНН */}
      {hasAutoData && (
        <>
          <div className="flex flex-wrap gap-5 items-start mt-5 w-full max-md:max-w-full">
            <div className="flex flex-col flex-1 min-w-[240px]">
              <div className="text-gray-950">Система налогоблажения</div>
              <div className="relative mt-1.5">
                <div className={`flex gap-10 justify-between items-center px-6 py-3.5 w-full whitespace-nowrap bg-white rounded border border-solid min-h-[46px] text-neutral-500 cursor-pointer select-none ${validationErrors.taxSystem ? 'border-red-500' : 'border-stone-300'}`}
                  onClick={() => setIsTaxSystemOpen((prev: boolean) => !prev)} tabIndex={0} onBlur={() => setIsTaxSystemOpen(false)}>
                  <span className="self-stretch my-auto text-neutral-500">{taxSystem}</span>
                  <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><path d="M6 8l4 4 4-4" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                {isTaxSystemOpen && (
                  <ul className="absolute left-0 right-0 z-10 bg-white border-x border-b border-stone-300 rounded-b-lg shadow-lg">
                    {taxSystemOptions.map(option => (
                      <li key={option} className={`px-6 py-3.5 cursor-pointer hover:bg-blue-100 ${option === taxSystem ? 'bg-blue-50 font-semibold' : ''}`}
                        onMouseDown={() => { setTaxSystem(option); setIsTaxSystemOpen(false); clearError('taxSystem') }}>
                        {option}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <div className="flex flex-col flex-1 min-w-[240px]">
              <div className="text-gray-950">НДС</div>
              <div className="relative mt-1.5">
                <div className="flex gap-10 justify-between items-center px-6 py-3.5 w-full bg-white rounded border border-solid border-stone-300 min-h-[46px] text-neutral-500 cursor-pointer select-none"
                  onClick={() => setIsNdsOpen((prev: boolean) => !prev)} tabIndex={0} onBlur={() => setIsNdsOpen(false)}>
                  <span className="self-stretch my-auto text-neutral-500">{nds || 'Выбрать'}</span>
                  <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><path d="M6 8l4 4 4-4" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                {isNdsOpen && (
                  <ul className="absolute left-0 right-0 z-10 bg-white border-x border-b border-stone-300 rounded-b-lg shadow-lg">
                    {ndsOptions.map(option => (
                      <li key={option} className={`px-6 py-3.5 cursor-pointer hover:bg-blue-100 ${option === nds ? 'bg-blue-50 font-semibold' : ''}`}
                        onMouseDown={() => { setNds(option); setIsNdsOpen(false) }}>
                        {option}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <div className="flex flex-col flex-1 min-w-[240px]">
              <div className="text-gray-950">НДС (%)</div>
              <div className="gap-2.5 self-stretch px-6 py-3.5 mt-1.5 w-full bg-white rounded border border-solid border-stone-300 min-h-[46px] text-neutral-500">
                <input type="number" placeholder="Процент НДС" className="w-full bg-transparent outline-none text-neutral-500"
                  value={ndsPercent} onChange={e => setNdsPercent(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-5 items-start mt-5 w-full max-md:max-w-full">
            <div className="flex flex-col flex-1 min-w-[240px]">
              <div className="text-gray-950">ФИО ответственного</div>
              <div className="gap-2.5 self-stretch px-6 py-3.5 mt-1.5 w-full bg-white rounded border border-solid border-stone-300 min-h-[46px] text-neutral-500">
                <input type="text" placeholder="ФИО ответственного" className="w-full bg-transparent outline-none text-neutral-500"
                  value={responsible} onChange={e => setResponsible(e.target.value)} />
              </div>
            </div>
            <div className="flex flex-col flex-1 min-w-[240px]">
              <div className="text-gray-950">Должность ответственного</div>
              <div className="gap-2.5 self-stretch px-6 py-3.5 mt-1.5 w-full bg-white rounded border border-solid border-stone-300 min-h-[46px] text-neutral-500">
                <input type="text" placeholder="Должность ответственного" className="w-full bg-transparent outline-none text-neutral-500"
                  value={responsiblePosition} onChange={e => setResponsiblePosition(e.target.value)} />
              </div>
            </div>
            <div className="flex flex-col flex-1 min-w-[240px]">
              <div className="text-gray-950">Телефон ответственного</div>
              <div className="gap-2.5 self-stretch px-6 py-3.5 mt-1.5 w-full bg-white rounded border border-solid border-stone-300 min-h-[46px] text-neutral-500">
                <input type="tel" placeholder="Телефон ответственного" className="w-full bg-transparent outline-none text-neutral-500"
                  value={responsiblePhone} onChange={e => setResponsiblePhone(e.target.value)} />
              </div>
            </div>
            <div className="flex flex-col flex-1 min-w-[240px]">
              <div className="text-gray-950">Подписант</div>
              <div className="gap-2.5 self-stretch px-6 py-3.5 mt-1.5 w-full bg-white rounded border border-solid border-stone-300 min-h-[46px] text-neutral-500">
                <input type="text" placeholder="Подписант" className="w-full bg-transparent outline-none text-neutral-500"
                  value={signatory} onChange={e => setSignatory(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end mt-6">
            <button onClick={onCancel} className="px-5 py-3 rounded-xl border border-stone-300">Отмена</button>
            <button onClick={handleSave} disabled={loading} className="px-5 py-3 rounded-xl bg-red-600 text-white">{editingEntity ? 'Сохранить' : 'Добавить'}</button>
          </div>
        </>
      )}
    </div>
  )
}

export default LegalEntityFormBlock
