import * as React from "react";
import LKMenu from '@/components/LKMenu';
import ProfileInfo from '@/components/profile/ProfileInfo';
import CatalogSubscribe from '@/components/CatalogSubscribe';
import MobileMenuBottomSection from '@/components/MobileMenuBottomSection';
import Footer from '@/components/Footer';
import MetaTags from "@/components/MetaTags";
import { getMetaByPath } from "@/lib/meta-config";
import { useQuery, useMutation } from '@apollo/client';
import { MY_SUPPORT_TICKETS, CREATE_SUPPORT_TICKET } from '@/lib/graphql';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';

const ProfileSupportPage = () => {
  const router = useRouter()
  const metaData = getMetaByPath('/profile-support');
  const { data, loading, error, refetch } = useQuery(MY_SUPPORT_TICKETS, { variables: { limit: 50, offset: 0 } })
  const [createTicket] = useMutation(CREATE_SUPPORT_TICKET)
  const [subject, setSubject] = React.useState('')
  const [message, setMessage] = React.useState('')
  const [files, setFiles] = React.useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [showNewTicket, setShowNewTicket] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const uploadFiles = async () => {
    const results: { url: string; fileName?: string; contentType?: string; size?: number }[] = []
    for (const f of files) {
      const fd = new FormData()
      fd.append('file', f)
      fd.append('prefix', 'support')
      const g = process.env.NEXT_PUBLIC_CMS_GRAPHQL_URL || 'http://localhost:3000/api/graphql'
      const cmsUpload = g.replace(/\/api\/graphql$/, '/api/upload')
      const res = await fetch(cmsUpload, { method: 'POST', body: fd })
      const json = await res.json()
      if (!json?.data?.url) throw new Error('Ошибка загрузки файла')
      results.push({ url: json.data.url, fileName: f.name, contentType: f.type, size: f.size })
    }
    return results
  }

  const submit = async () => {
    if (!subject.trim() || !message.trim()) {
      toast.error('Заполните тему и описание проблемы');
      return;
    }

    setIsSubmitting(true);
    try {
      const attachments = await uploadFiles()
      const { data } = await createTicket({ variables: { input: { subject, message, attachments } } })
      setSubject('')
      setMessage('')
      setFiles([])
      setShowNewTicket(false)
      await refetch()
      toast.success('Обращение успешно создано');
      if (data?.createSupportTicket?.id) router.push(`/profile-support/${data.createSupportTicket.id}`)
    } catch (err) {
      toast.error('Ошибка при создании обращения');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  React.useEffect(() => {
    if (!router.isReady) return
    const presetSubject = typeof router.query.subject === 'string' ? router.query.subject.trim() : ''
    if (presetSubject) {
      setSubject((prev) => (prev ? prev : presetSubject))
      setShowNewTicket(true)
    }
  }, [router.isReady, router.query.subject])

  const tickets = data?.mySupportTickets || []
  const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    OPEN: { label: 'Открыт', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
    IN_PROGRESS: { label: 'В работе', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200' },
    RESOLVED: { label: 'Решён', color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
    CLOSED: { label: 'Закрыт', color: 'text-gray-700', bg: 'bg-gray-50 border-gray-200' }
  }

  const getStatusConfig = (status: string) => statusConfig[status] || { label: status, color: 'text-gray-700', bg: 'bg-gray-50 border-gray-200' }

  return (
    <div className="page-wrapper">
      <MetaTags {...metaData} />
      <ProfileInfo />
      <div className="flex flex-col pt-10 pb-16 max-md:px-5">
        <div className="flex relative gap-8 items-start self-stretch max-md:gap-5 max-sm:flex-col max-sm:gap-4 justify-center mx-auto max-w-[1580px] w-full h-full">
          <LKMenu />
          <div className="flex relative flex-col gap-6 w-full items-start flex-[1_0_0]">
            {/* Кнопка создания обращения */}
            {!showNewTicket && (
              <div className="w-full">
                <button
                  onClick={() => setShowNewTicket(true)}
                  className="w-full p-5 bg-white border border-gray-300 rounded-xl hover:border-red-400 hover:bg-red-50 transition-all"
                >
                  <div className="flex items-center justify-center gap-2 text-gray-700 font-medium">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Создать новое обращение
                  </div>
                </button>
              </div>
            )}

            {/* Форма нового обращения */}
            {showNewTicket && (
              <div className="w-full p-6 bg-white rounded-2xl border border-gray-200">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold text-gray-900">Новое обращение</h2>
                  <button
                    onClick={() => {
                      setShowNewTicket(false);
                      setSubject('');
                      setMessage('');
                      setFiles([]);
                    }}
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Тема обращения</label>
                    <input
                      value={subject}
                      onChange={e => setSubject(e.target.value)}
                      placeholder="Кратко опишите проблему"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Описание проблемы</label>
                    <textarea
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      rows={5}
                      placeholder="Подробно опишите проблему"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Файлы</label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={e => setFiles(prev => [...prev, ...Array.from(e.target.files || [])])}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                      Прикрепить файлы
                    </button>

                    {files.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 mt-3">
                        {files.map((f, i) => (
                          <div key={i} className="relative group">
                            {f.type.startsWith('image/') ? (
                              <>
                                <img
                                  src={URL.createObjectURL(f)}
                                  alt={f.name}
                                  className="w-full h-20 object-cover rounded border"
                                />
                                <button
                                  onClick={() => removeFile(i)}
                                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </>
                            ) : (
                              <div className="relative flex items-center gap-2 p-2 bg-gray-50 border rounded text-xs">
                                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                                <span className="truncate flex-1">{f.name}</span>
                                <button
                                  onClick={() => removeFile(i)}
                                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={submit}
                      disabled={!subject.trim() || !message.trim() || isSubmitting}
                      style={{ color: '#fff' }}
                      className="flex-1 px-5 py-3 bg-red-600 rounded-xl font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all !text-white"
                    >
                      {isSubmitting ? 'Отправка...' : 'Отправить обращение'}
                    </button>
                    <button
                      onClick={() => {
                        setShowNewTicket(false);
                        setSubject('');
                        setMessage('');
                        setFiles([]);
                      }}
                      disabled={isSubmitting}
                      className="px-5 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 disabled:opacity-50 transition-all"
                    >
                      Отмена
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Список обращений */}
            <div className="w-full p-6 bg-white rounded-2xl">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Мои обращения</h2>

              {loading && (
                <div className="py-8 text-center text-gray-500">Загрузка...</div>
              )}

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  Ошибка: {error.message}
                </div>
              )}

              {!loading && !error && tickets.length === 0 && (
                <div className="py-12 text-center">
                  <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p className="text-gray-500">Обращений пока нет</p>
                </div>
              )}

              {!loading && !error && tickets.length > 0 && (
                <div className="space-y-2">
                  {tickets.map((t: any) => {
                    const status = getStatusConfig(t.status);
                    return (
                      <div
                        key={t.id}
                        onClick={() => router.push(`/profile-support/${t.id}`)}
                        className="p-4 border border-gray-200 rounded-lg hover:border-red-300 hover:bg-gray-50 transition-all cursor-pointer group"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900 truncate">{t.subject}</h3>
                              <span className={`flex-shrink-0 px-2 py-0.5 text-xs font-medium rounded-full border ${status.bg} ${status.color}`}>
                                {status.label}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(t.lastMessageAt).toLocaleString('ru-RU', {
                                day: 'numeric',
                                month: 'long',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                          <svg className="w-5 h-5 text-gray-400 group-hover:text-red-600 transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <section className="section-3">
        <CatalogSubscribe />
      </section>
      <MobileMenuBottomSection />
      <Footer />
    </div>
  );
};

export default ProfileSupportPage;
