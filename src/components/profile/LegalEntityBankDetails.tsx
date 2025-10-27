import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation } from "@apollo/client";
import {
  CREATE_CLIENT_BANK_DETAILS,
  UPDATE_CLIENT_BANK_DETAILS,
  DELETE_CLIENT_BANK_DETAILS,
} from "@/lib/graphql";
import toast from "react-hot-toast";

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

type FormField = keyof typeof emptyForm;

const LegalEntityBankDetails: React.FC<LegalEntityBankDetailsProps> = ({ entity, onRefetch }) => {
  const [formState, setFormState] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [editingDetail, setEditingDetail] = useState<BankDetail | null>(null);
  const [errors, setErrors] = useState<Partial<Record<FormField, string>>>({});
  const [pendingDelete, setPendingDelete] = useState<BankDetail | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [fetchingBankData, setFetchingBankData] = useState(false);

  const fieldRefs: Record<FormField, React.RefObject<HTMLInputElement | null>> = {
    name: useRef<HTMLInputElement | null>(null),
    accountNumber: useRef<HTMLInputElement | null>(null),
    bankName: useRef<HTMLInputElement | null>(null),
    bik: useRef<HTMLInputElement | null>(null),
    correspondentAccount: useRef<HTMLInputElement | null>(null),
  };

  const [createBankDetails] = useMutation(CREATE_CLIENT_BANK_DETAILS, {
    onCompleted: () => {
      toast.success("Реквизиты добавлены");
      resetForm();
      onRefetch();
    },
    onError: (error) => {
      console.error("Ошибка создания банковских реквизитов:", error);
      toast.error(`Не удалось добавить реквизиты: ${error.message}`);
    },
  });

  const [updateBankDetails] = useMutation(UPDATE_CLIENT_BANK_DETAILS, {
    onCompleted: () => {
      toast.success("Реквизиты обновлены");
      resetForm();
      onRefetch();
    },
    onError: (error) => {
      console.error("Ошибка обновления банковских реквизитов:", error);
      toast.error(`Не удалось обновить реквизиты: ${error.message}`);
    },
  });

  const [deleteBankDetails] = useMutation(DELETE_CLIENT_BANK_DETAILS, {
    onCompleted: () => {
      onRefetch();
    },
    onError: (error) => {
      console.error("Ошибка удаления банковских реквизитов:", error);
    },
  });

  const resetForm = useCallback(() => {
    setFormState(emptyForm);
    setShowForm(false);
    setEditingDetail(null);
    setErrors({});
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

  useEffect(() => {
    if (!pendingDelete) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !deleting) {
        setPendingDelete(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pendingDelete, deleting]);

  const digitsOnly = (value: string, limit?: number) => {
    const stripped = value.replace(/\D/g, "");
    return typeof limit === "number" ? stripped.slice(0, limit) : stripped;
  };

  const fetchBankDataByBik = async (bik: string) => {
    if (bik.length !== 9) return;

    setFetchingBankData(true);
    const toastId = toast.loading("Получаем данные банка...");

    try {
      const cmsGraphql = process.env.NEXT_PUBLIC_CMS_GRAPHQL_URL || 'http://localhost:3000/api/graphql';
      const cmsDaDataBankUrl = cmsGraphql.replace(/\/api\/graphql.*/, '/api/dadata/bank');

      const response = await fetch(cmsDaDataBankUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: bik }),
      });

      if (!response.ok) {
        throw new Error("Не удалось получить данные банка");
      }

      const data = await response.json();

      if (data.suggestions && data.suggestions.length > 0) {
        const bankData = data.suggestions[0].data;
        const bankName = bankData.name?.payment || bankData.value || "";
        const corrAccount = bankData.correspondent_account || "";

        setFormState((prev) => ({
          ...prev,
          bankName: bankName,
          correspondentAccount: corrAccount,
        }));

        // Auto-generate account name if account number is filled
        if (formState.accountNumber.length === 20 && bankName) {
          const last4Digits = formState.accountNumber.slice(-4);
          const generatedName = `${last4Digits} ${bankName}`;
          setFormState((prev) => ({
            ...prev,
            name: generatedName,
          }));
        }

        toast.success("Данные банка загружены", { id: toastId });
      } else {
        toast.error("Банк с таким БИК не найден", { id: toastId });
      }
    } catch (error) {
      console.error("Ошибка при получении данных банка:", error);
      toast.error("Не удалось получить данные банка", { id: toastId });
    } finally {
      setFetchingBankData(false);
    }
  };

  const handleChange = (field: FormField) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = event.target.value;
    let nextValue = rawValue;

    if (field === "accountNumber" || field === "correspondentAccount") {
      nextValue = digitsOnly(rawValue, 20);
    } else if (field === "bik") {
      nextValue = digitsOnly(rawValue, 9);
    }

    setFormState((prev) => ({ ...prev, [field]: nextValue }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));

    // Auto-fetch bank data when BIK is complete
    if (field === "bik" && nextValue.length === 9) {
      fetchBankDataByBik(nextValue);
    }

    // Auto-generate account name when account number is complete and bank name exists
    if (field === "accountNumber" && nextValue.length === 20 && formState.bankName) {
      const last4Digits = nextValue.slice(-4);
      const generatedName = `${last4Digits} ${formState.bankName}`;
      setFormState((prev) => ({
        ...prev,
        name: generatedName,
      }));
    }
  };

  const validateForm = (): boolean => {
    const { accountNumber, bankName, bik, correspondentAccount } = formState;
    const nextErrors: Partial<Record<FormField, string>> = {};

    if (accountNumber.length !== 20) {
      nextErrors.accountNumber = "Номер счёта должен содержать 20 цифр";
    }

    if (bik.length !== 9) {
      nextErrors.bik = "БИК должен содержать 9 цифр";
    }

    if (!bankName.trim()) {
      nextErrors.bankName = "Укажите наименование банка (загрузится автоматически по БИК)";
    }

    if (correspondentAccount.length !== 20) {
      nextErrors.correspondentAccount = "Корреспондентский счёт должен содержать 20 цифр";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      const firstError = Object.keys(nextErrors)[0] as FormField | undefined;
      if (firstError) {
        const ref = fieldRefs[firstError];
        ref?.current?.focus();
      }
      toast.error("Пожалуйста, заполните все обязательные поля");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    // Generate account name if not set
    let accountName = formState.name.trim();
    if (!accountName && formState.accountNumber.length === 20 && formState.bankName) {
      const last4Digits = formState.accountNumber.slice(-4);
      accountName = `${last4Digits} ${formState.bankName.trim()}`;
    }

    const variables = {
      legalEntityId: entity.id,
      input: {
        name: accountName,
        accountNumber: formState.accountNumber,
        bankName: formState.bankName.trim(),
        bik: formState.bik,
        correspondentAccount: formState.correspondentAccount,
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
      accountNumber: digitsOnly(detail.accountNumber, 20),
      bankName: detail.bankName,
      bik: digitsOnly(detail.bik, 9),
      correspondentAccount: digitsOnly(detail.correspondentAccount, 20),
    });
    setShowForm(true);
    setErrors({});
  };

  const handleDeleteRequest = (detail: BankDetail) => {
    setPendingDelete(detail);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    const toastId = toast.loading("Удаляем реквизиты…");
    try {
      await deleteBankDetails({ variables: { id: pendingDelete.id } });
      toast.success(`Реквизиты «${pendingDelete.name}» удалены`, { id: toastId });
      setPendingDelete(null);
    } catch (error) {
      console.error("Ошибка удаления реквизитов:", error);
      toast.error("Не удалось удалить реквизиты", { id: toastId });
    } finally {
      setDeleting(false);
    }
  };

  const details = useMemo(() => entity.bankDetails || [], [entity.bankDetails]);
  const baseInputClass =
    "rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-100";
  const errorInputClass = "border-red-400 focus:border-red-500 focus:ring-red-100 text-red-700 placeholder:text-red-300";

  return (
    <>
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

              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                <button
                  type="button"
                  onClick={() => handleEdit(detail)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-transparent px-3 py-2 text-gray-600 transition-colors hover:border-red-100 hover:bg-red-50 hover:text-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-200"
                >
                  <img src="/images/edit.svg" alt="Редактировать" className="h-4 w-4" />
                  Редактировать
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteRequest(detail)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-transparent px-3 py-2 text-gray-600 transition-colors hover:border-red-100 hover:bg-red-50 hover:text-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-200"
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

            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">№ расчётного счёта</span>
                <input
                  type="text"
                  value={formState.accountNumber}
                  onChange={handleChange("accountNumber")}
                  ref={fieldRefs.accountNumber}
                  className={`${baseInputClass} ${errors.accountNumber ? errorInputClass : ""}`}
                  inputMode="numeric"
                  maxLength={20}
                  placeholder="20 цифр"
                />
                <span className="text-xs text-gray-400">Только цифры, без пробелов</span>
                {errors.accountNumber ? <span className="text-xs font-medium text-red-500">{errors.accountNumber}</span> : null}
              </div>

              <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">БИК</span>
                  {fetchingBankData && (
                    <svg className="h-4 w-4 animate-spin text-red-600" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                      <path className="opacity-75" d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  )}
                </div>
                <input
                  type="text"
                  value={formState.bik}
                  onChange={handleChange("bik")}
                  ref={fieldRefs.bik}
                  className={`${baseInputClass} ${errors.bik ? errorInputClass : ""}`}
                  inputMode="numeric"
                  maxLength={9}
                  placeholder="9 цифр"
                  disabled={fetchingBankData}
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Проверочный код Банка России</span>
                  {formState.bik.length === 9 && !fetchingBankData && (
                    <button
                      type="button"
                      onClick={() => fetchBankDataByBik(formState.bik)}
                      className="text-xs text-red-600 hover:text-red-700 underline"
                    >
                      Обновить
                    </button>
                  )}
                </div>
                {errors.bik ? <span className="text-xs font-medium text-red-500">{errors.bik}</span> : null}
              </div>

              {formState.bankName && (
                <>
                  <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-gray-50 px-4 py-4">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Банк</span>
                    <input
                      type="text"
                      value={formState.bankName}
                      readOnly
                      className={`${baseInputClass} bg-gray-100 cursor-not-allowed text-gray-700`}
                      placeholder="Загружается автоматически по БИК"
                    />
                    <span className="text-xs text-gray-400">Заполняется автоматически</span>
                  </div>

                  <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-gray-50 px-4 py-4">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Корреспондентский счёт</span>
                    <input
                      type="text"
                      value={formState.correspondentAccount}
                      readOnly
                      className={`${baseInputClass} bg-gray-100 cursor-not-allowed text-gray-700`}
                      placeholder="Загружается автоматически по БИК"
                    />
                    <span className="text-xs text-gray-400">Заполняется автоматически</span>
                  </div>
                </>
              )}

              {formState.name && (
                <div className="md:col-span-2 flex flex-col gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-4">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-green-700">Название счёта</span>
                  <input
                    type="text"
                    value={formState.name}
                    readOnly
                    ref={fieldRefs.name}
                    className={`${baseInputClass} bg-green-100 cursor-not-allowed text-gray-900 font-medium border-green-300`}
                    placeholder="Генерируется автоматически"
                  />
                  <span className="text-xs text-green-600">✓ Название сгенерировано автоматически</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleSubmit}
                className="rounded-xl bg-red-600 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/60"
                style={{ color: "#FFFFFF" }}
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
              setErrors({});
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-dashed border-red-300 bg-red-50 px-5 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-100"
          >
            Добавить реквизиты
          </button>
        </div>
      )}
      </div>
      {pendingDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-8 backdrop-blur"
          role="dialog"
          aria-modal="true"
          aria-labelledby="bank-details-delete-title"
          onClick={() => (!deleting ? setPendingDelete(null) : undefined)}
        >
          <div
            className="w-full max-w-lg overflow-hidden rounded-3xl border border-red-100/60 bg-white shadow-[0_40px_80px_-25px_rgba(15,23,42,0.55)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center gap-4 border-b border-red-100/70 bg-red-50/80 px-6 py-5">
              <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-white text-red-600 shadow-[0_8px_16px_-6px_rgba(220,38,38,0.45)]">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M12 8v5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 16h.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M4.93 19.07A10 10 0 1 1 19.07 4.93 10 10 0 0 1 4.93 19.07Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <div>
                <h2 id="bank-details-delete-title" className="text-xl font-semibold leading-tight text-gray-950">
                  Удалить банковские реквизиты
                </h2>
                <p className="mt-1 text-sm text-red-600/80">
                  Реквизиты «{pendingDelete.name}» будут удалены и перестанут отображаться в профиле.
                </p>
              </div>
            </div>
            <div className="px-6 py-6 text-sm text-gray-600">
              Убедитесь, что эти реквизиты больше не нужны для счетов и оплат. При необходимости вы всегда сможете добавить новые данные.
            </div>
            <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/60 px-6 py-5">
              <button
                type="button"
                onClick={() => setPendingDelete(null)}
                disabled={deleting}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-gray-600 transition hover:border-slate-300 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="inline-flex min-w-[140px] items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_24px_-12px_rgba(220,38,38,0.65)] transition hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400 disabled:cursor-not-allowed disabled:opacity-80"
                style={{ color: "#FFFFFF" }}
              >
                {deleting ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                      <path className="opacity-75" d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    Удаляем…
                  </>
                ) : (
                  "Удалить реквизиты"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LegalEntityBankDetails;
