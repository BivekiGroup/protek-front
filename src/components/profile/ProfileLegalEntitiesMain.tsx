import React, { useState, forwardRef, useImperativeHandle, useCallback } from "react";
import { useQuery } from '@apollo/client';
import { GET_CLIENT_ME } from '@/lib/graphql';
import LegalEntityListBlock from "./LegalEntityListBlock";
import LegalEntityFormBlock from "./LegalEntityFormBlock";

interface BankDetail {
  id: string;
  name: string;
  accountNumber: string;
  bankName: string;
  bik: string;
  correspondentAccount: string;
  legalEntityId: string;
}

interface LegalEntity {
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
  bankDetails: BankDetail[];
}

interface ClientData {
  id: string;
  legalEntities: LegalEntity[];
}

export interface ProfileLegalEntitiesMainHandle {
  openCreateForm: () => void;
}

const DEFAULT_FORM = "ООО";

const ProfileLegalEntitiesMain = forwardRef<ProfileLegalEntitiesMainHandle>((_, ref) => {
  const [form, setForm] = useState<string>(DEFAULT_FORM);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const formOptions = ["ООО", "ИП", "АО", "ПАО", "Другое"];

  const [taxSystem, setTaxSystem] = useState("УСН");
  const [isTaxSystemOpen, setIsTaxSystemOpen] = useState(false);
  const taxSystemOptions = ["ОСНО", "УСН", "ЕНВД", "ПСН"];

  const [nds, setNds] = useState("НДС 20%");
  const [isNdsOpen, setIsNdsOpen] = useState(false);
  const ndsOptions = ["Без НДС", "НДС 10%", "НДС 20%", "Другое"];

  const [showLegalEntityForm, setShowLegalEntityForm] = useState(false);
  const [editingEntity, setEditingEntity] = useState<LegalEntity | null>(null);
  const [expandedEntityIds, setExpandedEntityIds] = useState<string[]>([]);

  // Поля формы юридического лица
  const [inn, setInn] = useState("");
  const [ogrn, setOgrn] = useState("");
  const [kpp, setKpp] = useState("");
  const [jurAddress, setJurAddress] = useState("");
  const [shortName, setShortName] = useState("");
  const [fullName, setFullName] = useState("");
  const [factAddress, setFactAddress] = useState("");
  const [ndsPercent, setNdsPercent] = useState("20");
  const [accountant, setAccountant] = useState("");
  const [responsible, setResponsible] = useState("");
  const [responsiblePosition, setResponsiblePosition] = useState("");
  const [responsiblePhone, setResponsiblePhone] = useState("");
  const [signatory, setSignatory] = useState("");

  const { data, loading, error, refetch } = useQuery(GET_CLIENT_ME, {
    onError: (err) => {
      console.error('Ошибка загрузки юридических лиц:', err);
    }
  });

  const clientData: ClientData | null = data?.clientMe || null;
  const legalEntities = clientData?.legalEntities || [];

  const resetForm = useCallback(() => {
    setShortName('');
    setFullName('');
    setForm(DEFAULT_FORM);
    setJurAddress('');
    setFactAddress('');
    setInn('');
    setOgrn('');
    setKpp('');
    setTaxSystem('УСН');
    setNds('НДС 20%');
    setNdsPercent('20');
    setAccountant('');
    setResponsible('');
    setResponsiblePosition('');
    setResponsiblePhone('');
    setSignatory('');
  }, []);

  const handleEditEntity = useCallback((entity: LegalEntity) => {
    setEditingEntity(entity);
    setShowLegalEntityForm(true);

    setShortName(entity.shortName);
    setFullName(entity.fullName || entity.shortName || '');
    setForm(entity.form || DEFAULT_FORM);
    setJurAddress(entity.legalAddress || '');
    setFactAddress(entity.actualAddress || '');
    setInn(entity.inn);
    setOgrn(entity.ogrn || '');
    setKpp(entity.registrationReasonCode || '');
    setTaxSystem(entity.taxSystem || 'УСН');
    setNds(entity.vatPercent === 0 ? 'Без НДС' : entity.vatPercent === 10 ? 'НДС 10%' : 'НДС 20%');
    setNdsPercent(String(entity.vatPercent ?? 20));
    setAccountant(entity.accountant || '');
    setResponsible(entity.responsibleName || '');
    setResponsiblePosition(entity.responsiblePosition || '');
    setResponsiblePhone(entity.responsiblePhone || '');
    setSignatory(entity.signatory || '');
  }, []);

  const handleAddEntity = useCallback(() => {
    setEditingEntity(null);
    setShowLegalEntityForm(true);
    resetForm();
  }, [resetForm]);

  const handleFormClose = useCallback(() => {
    setShowLegalEntityForm(false);
    setEditingEntity(null);
  }, []);

  const handleFormSaved = useCallback(() => {
    setShowLegalEntityForm(false);
    setEditingEntity(null);
    refetch();
  }, [refetch]);

  const handleToggleRequisites = useCallback((entityId: string) => {
    setExpandedEntityIds(prev => (
      prev.includes(entityId)
        ? prev.filter(id => id !== entityId)
        : [...prev, entityId]
    ));
  }, []);

  useImperativeHandle(ref, () => ({ openCreateForm: handleAddEntity }), [handleAddEntity]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center p-8 bg-white rounded-2xl">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        <div className="mt-4 text-gray-600">Загрузка юридических лиц...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center p-8 bg-white rounded-2xl">
        <div className="text-red-600 text-center">
          <div className="text-lg font-semibold mb-2">Ошибка загрузки юридических лиц</div>
          <div className="text-sm">{error.message}</div>
          <button
            onClick={() => refetch()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Повторить
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 gap-5">
      <LegalEntityListBlock
        legalEntities={legalEntities}
        onRefetch={refetch}
        onEdit={handleEditEntity}
        expandedEntityIds={expandedEntityIds}
        onToggleRequisites={handleToggleRequisites}
        onAddNew={handleAddEntity}
        formNode={showLegalEntityForm ? (
          <LegalEntityFormBlock
            inn={inn}
            setInn={setInn}
            form={form}
            setForm={setForm}
            isFormOpen={isFormOpen}
            setIsFormOpen={setIsFormOpen}
            formOptions={formOptions}
            ogrn={ogrn}
            setOgrn={setOgrn}
            kpp={kpp}
            setKpp={setKpp}
            jurAddress={jurAddress}
            setJurAddress={setJurAddress}
            shortName={shortName}
            setShortName={setShortName}
            fullName={fullName}
            setFullName={setFullName}
            factAddress={factAddress}
            setFactAddress={setFactAddress}
            taxSystem={taxSystem}
            setTaxSystem={setTaxSystem}
            isTaxSystemOpen={isTaxSystemOpen}
            setIsTaxSystemOpen={setIsTaxSystemOpen}
            taxSystemOptions={taxSystemOptions}
            nds={nds}
            setNds={setNds}
            isNdsOpen={isNdsOpen}
            setIsNdsOpen={setIsNdsOpen}
            ndsOptions={ndsOptions}
            ndsPercent={ndsPercent}
            setNdsPercent={setNdsPercent}
            accountant={accountant}
            setAccountant={setAccountant}
            responsible={responsible}
            setResponsible={setResponsible}
            responsiblePosition={responsiblePosition}
            setResponsiblePosition={setResponsiblePosition}
            responsiblePhone={responsiblePhone}
            setResponsiblePhone={setResponsiblePhone}
            signatory={signatory}
            setSignatory={setSignatory}
            editingEntity={editingEntity}
            onAdd={handleFormSaved}
            onCancel={handleFormClose}
          />
        ) : null}
        editingEntityId={editingEntity?.id ?? null}
        isCreatingNew={showLegalEntityForm && !editingEntity}
        isFormVisible={showLegalEntityForm}
      />
    </div>
  );
});

ProfileLegalEntitiesMain.displayName = 'ProfileLegalEntitiesMain';

export default ProfileLegalEntitiesMain;
