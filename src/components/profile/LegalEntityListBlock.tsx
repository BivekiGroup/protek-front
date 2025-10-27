import React from "react";
import type { ReactNode } from "react";
import toast from "react-hot-toast";
import { useMutation } from "@apollo/client";
import { DELETE_CLIENT_LEGAL_ENTITY } from "@/lib/graphql";
import LegalEntityBankDetails from "./LegalEntityBankDetails";

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
  bankDetails: Array<{
    id: string;
    name: string;
    accountNumber: string;
    bankName: string;
    bik: string;
    correspondentAccount: string;
    legalEntityId: string;
  }>;
}

interface LegalEntityListBlockProps {
  legalEntities: LegalEntity[];
  onRefetch: () => void;
  onEdit?: (entity: LegalEntity) => void;
  expandedEntityIds?: string[];
  onToggleRequisites?: (entityId: string) => void;
  onAddNew?: () => void;
  formNode?: ReactNode | null;
  editingEntityId?: string | null;
  isCreatingNew?: boolean;
  isFormVisible?: boolean;
}

const LegalEntityListBlock: React.FC<LegalEntityListBlockProps> = ({
  legalEntities,
  onRefetch,
  onEdit,
  expandedEntityIds = [],
  onToggleRequisites,
  onAddNew,
  formNode,
  editingEntityId,
  isCreatingNew,
  isFormVisible,
}) => {
  const [deleteLegalEntity] = useMutation(DELETE_CLIENT_LEGAL_ENTITY, {
    onCompleted: () => {
      console.log("Юридическое лицо удалено");
      onRefetch();
    },
    onError: (error) => {
      console.error("Ошибка удаления юридического лица:", error);
    },
  });

  const [deleteTarget, setDeleteTarget] = React.useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  const handleDelete = (id: string, name: string) => {
    setDeleteTarget({ id, name });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const toastId = toast.loading("Удаляем юрлицо…");
    try {
      await deleteLegalEntity({ variables: { id: deleteTarget.id } });
      toast.success(`Юрлицо «${deleteTarget.name}» удалено`, { id: toastId });
      setDeleteTarget(null);
    } catch (error) {
      console.error("Ошибка удаления:", error);
      toast.error("Не удалось удалить юрлицо", { id: toastId });
    } finally {
      setDeleting(false);
    }
  };

  React.useEffect(() => {
    if (!deleteTarget) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !deleting) {
        setDeleteTarget(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [deleteTarget, deleting]);

  if (legalEntities.length === 0) {
    return (
      <div className="flex relative flex-col mt-5 gap-6 items-start self-stretch p-8 pl-8 bg-white rounded-2xl max-md:gap-5 max-md:p-5 max-sm:gap-4 max-sm:p-4">
        <div className="text-3xl font-bold leading-8 text-gray-950 max-md:text-2xl max-sm:text-xl">
          Юридические лица
        </div>
        <div className="text-gray-600">
          У вас пока нет добавленных юридических лиц. Нажмите кнопку ниже, чтобы добавить первое.
        </div>
        {onAddNew && (
          <button
            type="button"
            onClick={onAddNew}
            disabled={Boolean(formNode)}
            className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-5 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M5 12H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Добавить юридическое лицо
          </button>
        )}
        {formNode && (
          <div className="w-full rounded-2xl border border-dashed border-red-200 bg-white px-6 py-6 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-gray-500">
              <span className="text-lg font-semibold text-gray-950">Новое юридическое лицо</span>
              <span className="hidden h-3 w-px bg-slate-200 md:inline" aria-hidden="true" />
              <span className="text-xs uppercase tracking-wide text-gray-400">Заполните форму и сохраните</span>
            </div>
            {formNode}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      layer-name="Frame 2087324698"
      className="flex relative flex-col mt-5 gap-6 items-start self-stretch p-8 pl-8 bg-white rounded-2xl max-md:gap-5 max-md:p-5 max-sm:gap-4 max-sm:p-4"
    >
      <div className="flex w-full flex-wrap items-center justify-between gap-4">
        <div
          layer-name="Юридические лица"
          className="text-3xl font-bold leading-8 text-gray-950 max-md:text-2xl max-sm:text-xl"
        >
          Юридические лица
        </div>
        {onAddNew && (
          <button
            type="button"
            onClick={onAddNew}
            disabled={isFormVisible}
            className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M5 12H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Добавить юрлицо
          </button>
        )}
      </div>

      {formNode && isCreatingNew && (
        <div className="w-full rounded-2xl border border-dashed border-red-200 bg-white px-6 py-6 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-gray-500">
            <span className="text-lg font-semibold text-gray-950">Новое юридическое лицо</span>
            <span className="hidden h-3 w-px bg-slate-200 md:inline" aria-hidden="true" />
            <span className="text-xs uppercase tracking-wide text-gray-400">Заполните форму и сохраните</span>
          </div>
          {formNode}
        </div>
      )}

      <div className="flex relative flex-col gap-3 items-start self-stretch">
        {legalEntities.map((entity) => {
          const isEditingThis = Boolean(formNode && editingEntityId === entity.id);
          const isExpanded = expandedEntityIds.includes(entity.id);

          return (
            <div
              key={entity.id}
              layer-name="legal"
              className="flex w-full flex-col gap-4 rounded-lg bg-slate-50 px-5 py-4 transition-colors hover:bg-slate-200 md:py-5"
            >
              {isEditingThis ? (
                <div className="rounded-2xl border border-slate-200 bg-white px-6 py-6 shadow-sm">
                  <div className="mb-3 flex flex-wrap items-center gap-2 text-sm text-gray-500">
                    <span className="text-lg font-semibold text-gray-950">Редактирование</span>
                    <span className="hidden h-3 w-px bg-slate-200 md:inline" aria-hidden="true" />
                    <span className="text-xs uppercase tracking-wide text-gray-400">{entity.shortName}</span>
                  </div>
                  {formNode}
                </div>
              ) : (
                <>
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-wrap items-center gap-2 text-gray-600 md:gap-3">
                      <span className="text-xl font-semibold leading-6 text-gray-950 md:text-lg">
                        {entity.shortName}
                      </span>
                      <span className="hidden text-gray-300 sm:inline">•</span>
                      <span className="text-sm leading-5 text-gray-500">
                        ИНН {entity.inn}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-sm leading-5 text-gray-600">
                      <button
                        type="button"
                        onClick={() => onToggleRequisites && onToggleRequisites(entity.id)}
                        className={`group inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                          entity.bankDetails.length === 0
                            ? 'border-red-200 bg-red-50 text-red-600 hover:border-red-300 hover:bg-red-100'
                            : 'border-slate-200 text-gray-600 hover:border-red-200 hover:text-red-600'
                        }`}
                        aria-expanded={isExpanded}
                      >
                        <svg
                          width="16"
                          height="15"
                          viewBox="0 0 16 15"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className={`transition-colors ${
                            entity.bankDetails.length === 0
                              ? 'text-red-600'
                              : 'text-gray-500 group-hover:text-red-600'
                          }`}
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M1.778 3.162c0-.116.047-.227.13-.309c.083-.082.196-.128.314-.128h9.333c.236 0 .462-.092.629-.256c.167-.164.261-.387.261-.619s-.094-.222-.261-.386c-.167-.164-.393-.256-.629-.256H2.222c-.589 0-1.155.23-1.571.64C.234 2.026 0 2.582 0 3.162v10.062c0 .464.187.909.521 1.237c.333.328.785.512 1.257.512h12.444c.472 0 .924-.184 1.258-.512c.333-.329.52-.774.52-1.238V5.35c0-.464-.187-.909-.52-1.237c-.334-.329-.786-.513-1.258-.513H2.222a.443.443 0 0 1-.314-.128a.443.443 0 0 1-.13-.309Zm9.333 7.438c.353 0 .693-.138.943-.384c.25-.246.39-.58.39-.928c0-.348-.14-.681-.39-.927a1.33 1.33 0 0 0-.943-.384c-.353 0-.692.138-.943.384c-.25.246-.39.58-.39.928c0 .348.14.682.39.928c.251.246.59.384.943.384Z"
                            fill="currentColor"
                          />
                        </svg>
                        <span>{isExpanded ? "Скрыть реквизиты" : entity.bankDetails.length === 0 ? "Добавить реквизиты" : `Реквизиты (${entity.bankDetails.length})`}</span>
                      </button>

                      <div className="flex items-center gap-3 text-sm leading-5 text-gray-600">
                        <button
                          type="button"
                          onClick={() => onEdit && onEdit(entity)}
                          className="group inline-flex items-center gap-1.5 text-gray-600 transition-colors hover:text-red-600"
                          aria-label="Редактировать юридическое лицо"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-slate-400 transition-colors group-hover:text-red-600"
                            aria-hidden="true"
                          >
                            <path
                              d="m16.862 3.487 3.651 3.651m-2.575-1.076-10.53 10.53a4.125 4.125 0 0 1-1.62 1.011l-3.068.86.86-3.068a4.125 4.125 0 0 1 1.011-1.62l10.53-10.53a2.625 2.625 0 1 1 3.712 3.712Z"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M10.5 6h-5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V13.5"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <span>Редактировать</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(entity.id, entity.shortName)}
                          className="group inline-flex items-center gap-1.5 text-gray-600 transition-colors hover:text-red-600"
                          aria-label="Удалить юридическое лицо"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-slate-400 transition-colors group-hover:text-red-600"
                            aria-hidden="true"
                          >
                            <path
                              d="M3 6h18"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M8.25 6V4.5A2.25 2.25 0 0 1 10.5 2.25h3a2.25 2.25 0 0 1 2.25 2.25V6"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M18.75 6V19.5A2.25 2.25 0 0 1 16.5 21.75h-9A2.25 2.25 0 0 1 5.25 19.5V6"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M10.5 11.25v6"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M13.5 11.25v6"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <span>Удалить</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-slate-200 pt-4">
                      <LegalEntityBankDetails entity={entity} onRefetch={onRefetch} />
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-8 backdrop-blur"
          role="dialog"
          aria-modal="true"
          aria-labelledby="legal-entity-delete-title"
          onClick={() => (!deleting ? setDeleteTarget(null) : undefined)}
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
                <h2 id="legal-entity-delete-title" className="text-xl font-semibold leading-tight text-gray-950">
                  Удалить юридическое лицо
                </h2>
                <p className="mt-1 text-sm text-red-600/80">
                  Проверьте, что «{deleteTarget.name}» действительно нужно удалить — действие необратимо.
                </p>
              </div>
            </div>
            <div className="px-6 py-6 text-sm text-gray-600">
              После удаления карточка исчезнет из списка, а реквизиты станут недоступны для оформления счетов и печатных форм. 
              Если нужно сохранить данные, скачайте документы заранее или отредактируйте карточку вместо удаления.
            </div>
            <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/60 px-6 py-5">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
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
                  "Удалить навсегда"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LegalEntityListBlock;
