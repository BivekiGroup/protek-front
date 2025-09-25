import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation } from "@apollo/client";
import {
  CREATE_CLIENT_BANK_DETAILS,
  UPDATE_CLIENT_BANK_DETAILS,
  DELETE_CLIENT_BANK_DETAILS,
} from "@/lib/graphql";

interface BankDetail {
  id: string;
  name: string;
  accountNumber: string;
  bankName: string;
  bik: string;
  correspondentAccount: string;
  legalEntityId: string;
}

interface LegalEntityBankDetailsProps {
  entity: {
    id: string;
    shortName: string;
    inn: string;
    bankDetails: BankDetail[];
  };
  onRefetch: () => void;
}

const emptyForm = {
  name: "",
  accountNumber: "",
  bankName: "",
  bik: "",
  correspondentAccount: "",
};

const LegalEntityBankDetails: React.FC<LegalEntityBankDetailsProps> = ({ entity, onRefetch }) => {
  const [formState, setFormState] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [editingDetail, setEditingDetail] = useState<BankDetail | null>(null);

  const [createBankDetails] = useMutation(CREATE_CLIENT_BANK_DETAILS, {
    onCompleted: () => {
      resetForm();
      onRefetch();
    },
    onError: (error) => {
      console.error("Ошибка создания банковских реквизитов:", error);
      alert(`Ошибка создания банковских реквизитов: ${error.message}`);
    },
  });

  const [updateBankDetails] = useMutation(UPDATE_CLIENT_BANK_DETAILS, {
    onCompleted: () => {
      resetForm();
      onRefetch();
    },
    onError: (error) => {
      console.error("Ошибка обновления банковских реквизитов:", error);
      alert(`Ошибка обновления банковских реквизитов: ${error.message}`);
    },
  });

  const [deleteBankDetails] = useMutation(DELETE_CLIENT_BANK_DETAILS, {
    onCompleted: () => {
      onRefetch();
    },
    onError: (error) => {
      console.error("Ошибка удаления банковских реквизитов:", error);
      alert(`Ошибка удаления банковских реквизитов: ${error.message}`);
    },
  });

  const resetForm = useCallback(() => {
    setFormState(emptyForm);
    setShowForm(false);
    setEditingDetail(null);
  }, []);

  useEffect(() => {
    if (!editingDetail) {
      return;
    }
    const stillExists = entity.bankDetails.some((detail) => detail.id === editingDetail.id);
    if (!stillExists) {
      resetForm();
    }
  }, [entity.bankDetails, editingDetail, resetForm]);

  const handleChange = (field: keyof typeof formState) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormState((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const validateForm = (): boolean => {
    const { name, accountNumber, bankName, bik, correspondentAccount } = formState;

    if (!name.trim()) {
      alert("Введите название счёта");
      return false;
    }
    if (!accountNumber.trim() || accountNumber.replace(/\D/g, "").length < 20) {
      alert("Введите корректный номер расчётного счёта");
      return false;
    }
    if (!bik.trim() || bik.replace(/\D/g, "").length !== 9) {
      alert("Введите корректный БИК (9 цифр)");
      return false;
    }
    if (!bankName.trim()) {
      alert("Введите наименование банка");
      return false;
    }
    if (!correspondentAccount.trim() || correspondentAccount.replace(/\D/g, "").length < 20) {
      alert("Введите корректный корреспондентский счёт");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    const variables = {
      legalEntityId: entity.id,
      input: {
        name: formState.name.trim(),
        accountNumber: formState.accountNumber.trim(),
        bankName: formState.bankName.trim(),
        bik: formState.bik.trim(),
        correspondentAccount: formState.correspondentAccount.trim(),
      },
    };

    try {
      if (editingDetail) {
        await updateBankDetails({
          variables: {
            id: editingDetail.id,
            ...variables,
          },
        });
      } else {
        await createBankDetails({ variables });
      }
      setShowForm(false);
    } catch (error) {
      console.error("Ошибка сохранения реквизитов:", error);
    }
  };

  const handleEdit = (detail: BankDetail) => {
    setEditingDetail(detail);
    setFormState({
      name: detail.name,
      accountNumber: detail.accountNumber,
      bankName: detail.bankName,
      bik: detail.bik,
      correspondentAccount: detail.correspondentAccount,
    });
    setShowForm(true);
  };

  const handleDelete = async (detail: BankDetail) => {
    if (window.confirm(`Удалить реквизиты «${detail.name}»?`)) {
      try {
        await deleteBankDetails({ variables: { id: detail.id } });
      } catch (error) {
        console.error("Ошибка удаления реквизитов:", error);
      }
    }
  };

  const details = useMemo(() => entity.bankDetails || [], [entity.bankDetails]);
  const inputClass = "rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-100";

  return (
    <div className="flex flex-col gap-5">
      {details.length === 0 && !showForm && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-5 py-6 text-sm text-gray-600">
          У {entity.shortName} пока нет банковских реквизитов. Добавьте первый счёт, чтобы можно было оплачивать ваши заказы быстрее.
        </div>
      )}

      {details.length > 0 && (
        <div className="grid gap-3 md:grid-cols-2">
          {details.map((detail) => (
            <div
              key={detail.id}
              className="flex h-full flex-col justify-between rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm"
            >
              <div className="flex flex-col gap-3 text-sm text-gray-600">
                <div>
                  <div className="text-base font-semibold text-gray-950">{detail.name}</div>
                  <div className="mt-0.5 text-xs uppercase tracking-wide text-gray-400">{entity.shortName}</div>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-gray-500">
                  <span className="font-medium text-gray-700">№ р/с {detail.accountNumber}</span>
                  <span className="text-gray-300">•</span>
                  <span>{detail.bankName}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-gray-500">
                  <span>БИК {detail.bik}</span>
                  <span className="text-gray-300">•</span>
                  <span>Корр. счёт {detail.correspondentAccount}</span>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
                <button
                  type="button"
                  onClick={() => handleEdit(detail)}
                  className="inline-flex items-center gap-1.5 text-gray-600 transition-colors hover:text-red-600"
                >
                  <img src="/images/edit.svg" alt="Редактировать" className="h-4 w-4" />
                  Редактировать
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(detail)}
                  className="inline-flex items-center gap-1.5 text-gray-600 transition-colors hover:text-red-600"
                >
                  <img src="/images/delete.svg" alt="Удалить" className="h-4 w-4" />
                  Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-7 shadow-sm">
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center gap-3">
              <div className="text-lg font-semibold text-gray-950">
                {editingDetail ? "Редактирование реквизитов" : "Новые реквизиты"}
              </div>
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-gray-600">
                <span className="text-gray-400">ЮЛ</span>
                {entity.shortName}
                <span className="hidden text-gray-300 md:inline">•</span>
                <span className="hidden text-gray-500 md:inline">ИНН {entity.inn}</span>
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Название счёта</span>
                <input
                  type="text"
                  value={formState.name}
                  onChange={handleChange("name")}
                  className={inputClass}
                  autoComplete="off"
                  placeholder="Основной расчётный счёт"
                />
                <span className="text-xs text-gray-400">Отображается в списке счетов</span>
              </div>

              <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">№ расчётного счёта</span>
                <input
                  type="text"
                  value={formState.accountNumber}
                  onChange={handleChange("accountNumber")}
                  className={inputClass}
                  inputMode="numeric"
                  placeholder="20 цифр"
                />
                <span className="text-xs text-gray-400">Только цифры, без пробелов</span>
              </div>

              <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Банк</span>
                <input
                  type="text"
                  value={formState.bankName}
                  onChange={handleChange("bankName")}
                  className={inputClass}
                  placeholder="Наименование банка"
                />
                <span className="text-xs text-gray-400">Полное или краткое наименование</span>
              </div>

              <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">БИК</span>
                <input
                  type="text"
                  value={formState.bik}
                  onChange={handleChange("bik")}
                  className={inputClass}
                  inputMode="numeric"
                  maxLength={9}
                  placeholder="9 цифр"
                />
                <span className="text-xs text-gray-400">Проверочный код Банка России</span>
              </div>

              <div className="md:col-span-2 flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Корреспондентский счёт</span>
                <input
                  type="text"
                  value={formState.correspondentAccount}
                  onChange={handleChange("correspondentAccount")}
                  className={inputClass}
                  inputMode="numeric"
                  placeholder="20 цифр"
                />
                <span className="text-xs text-gray-400">Обязателен для расчётов по БИК</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleSubmit}
                className="rounded-xl bg-red-600 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-red-700"
              >
                {editingDetail ? "Сохранить" : "Добавить"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-slate-200 px-6 py-3 text-base font-medium text-gray-600 transition-colors hover:bg-slate-50"
              >
                Отменить
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-4">
          <button
            type="button"
            onClick={() => {
              setShowForm(true);
              setEditingDetail(null);
              setFormState(emptyForm);
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-dashed border-red-300 bg-red-50 px-5 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-100"
          >
            Добавить реквизиты
          </button>
        </div>
      )}
    </div>
  );
};

export default LegalEntityBankDetails;
