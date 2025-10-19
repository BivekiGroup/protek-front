import * as React from "react";
import { useRouter } from 'next/router';
import LKMenu from '@/components/LKMenu';
import ProfileInfo from '@/components/profile/ProfileInfo';
import CatalogSubscribe from '@/components/CatalogSubscribe';
import MobileMenuBottomSection from '@/components/MobileMenuBottomSection';
import Footer from '@/components/Footer';
import MetaTags from "@/components/MetaTags";
import { getMetaByPath } from "@/lib/meta-config";
import { useQuery, useMutation } from '@apollo/client';
import { SUPPORT_TICKET, ADD_SUPPORT_TICKET_MESSAGE } from '@/lib/graphql';
import toast from 'react-hot-toast';

const TicketViewPage = () => {
  const router = useRouter()
  const { id } = router.query as { id?: string }
  const metaData = getMetaByPath('/profile-support');
  const { data, loading, error, refetch } = useQuery(SUPPORT_TICKET, { variables: { id }, skip: !id })
  const [addMessage] = useMutation(ADD_SUPPORT_TICKET_MESSAGE)
  const [text, setText] = React.useState('')
  const [files, setFiles] = React.useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const messagesEndRef = React.useRef<HTMLDivElement>(null)
  const chatContainerRef = React.useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  React.useEffect(() => {
    scrollToBottom()
  }, [data])

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
    if (!text.trim() && files.length === 0) {
      toast.error('Напишите сообщение или прикрепите файл');
      return;
    }

    setIsSubmitting(true);
    try {
      const attachments = await uploadFiles()
      await addMessage({ variables: { input: { ticketId: id, message: text, attachments } } })
      setText('')
      setFiles([])
      await refetch()
      toast.success('Сообщение отправлено');
      setTimeout(scrollToBottom, 100)
    } catch (err) {
      toast.error('Ошибка отправки сообщения');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const ticket = data?.supportTicket
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
      <div className="flex flex-col pt-10 max-md:px-5">
        <div className="flex relative gap-8 items-start self-stretch max-md:gap-5 max-sm:flex-col max-sm:gap-4 justify-center mx-auto max-w-[1580px] w-full">
          <LKMenu />
          <div className="flex relative flex-col w-full items-start flex-[1_0_0]">
            {loading && (
              <div className="w-full p-8 bg-white rounded-2xl">
                <div className="flex items-center justify-center py-8">
                  <svg className="animate-spin h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              </div>
            )}

            {error && (
              <div className="w-full p-6 bg-white rounded-2xl">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h3 className="font-semibold text-red-900 mb-1">Ошибка загрузки</h3>
                      <p className="text-sm text-red-700">{error.message}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {ticket && (
              <div className="w-full bg-white rounded-2xl flex flex-col" style={{ height: 'calc(100vh - 280px)', minHeight: '500px' }}>
                {/* Заголовок - фиксированный */}
                <div className="px-4 py-3 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    {/* Кнопка назад */}
                    <button
                      onClick={() => router.push('/profile-support')}
                      className="p-1.5 -ml-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Назад"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>

                    {/* Заголовок и статус */}
                    <div className="flex items-center justify-between flex-1 min-w-0">
                      <h1 className="text-base font-semibold text-gray-900 truncate pr-3">{ticket.subject}</h1>
                      {(() => {
                        const status = getStatusConfig(ticket.status);
                        return (
                          <span className={`flex-shrink-0 px-2 py-0.5 text-xs font-medium rounded-full border ${status.bg} ${status.color}`}>
                            {status.label}
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* Сообщения - скроллируемая область */}
                <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4" style={{ scrollBehavior: 'smooth' }}>
                  <div className="space-y-4">
                    {ticket.messages.map((m: any) => {
                      const isSupport = m.authorType === 'ADMIN';
                      return (
                        <div key={m.id} className={`flex ${isSupport ? 'justify-start' : 'justify-end'}`}>
                          <div className={`max-w-[75%] ${isSupport ? '' : 'flex flex-col items-end'}`}>
                            <div className="flex items-center gap-2 mb-1">
                              {isSupport && (
                                <div className="w-7 h-7 bg-red-100 rounded-full flex items-center justify-center">
                                  <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                                  </svg>
                                </div>
                              )}
                              <div className={isSupport ? '' : 'text-right'}>
                                <div className="text-xs font-semibold text-gray-900">
                                  {isSupport ? 'Техподдержка' : 'Вы'}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {new Date(m.createdAt).toLocaleString('ru-RU', {
                                    day: 'numeric',
                                    month: 'long',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </div>
                              </div>
                              {!isSupport && (
                                <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center">
                                  <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <div className={`p-3 rounded-xl ${isSupport ? 'bg-gray-50 border border-gray-200' : 'bg-red-50 border border-red-100'}`}>
                              <div className="text-sm text-gray-900 whitespace-pre-wrap">{m.content}</div>
                              {!!m.attachments?.length && (
                                <div className="grid grid-cols-3 gap-2 mt-2">
                                  {m.attachments.map((a: any) => (
                                    a.contentType?.startsWith('image/') ? (
                                      <a key={a.id} href={a.url} target="_blank" rel="noreferrer" className="block">
                                        <img src={a.url} alt={a.fileName || ''} className="w-full h-16 object-cover rounded border hover:opacity-90 transition-opacity" />
                                      </a>
                                    ) : (
                                      <a key={a.id} href={a.url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 p-2 bg-white border rounded text-xs hover:bg-gray-50 transition-colors">
                                        <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                        </svg>
                                        <span className="truncate flex-1">{a.fileName || 'файл'}</span>
                                      </a>
                                    )
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                {/* Превью файлов - над инпутом */}
                {files.length > 0 && (
                  <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
                    <div className="flex gap-2 overflow-x-auto">
                      {files.map((f, i) => (
                        <div key={i} className="relative group flex-shrink-0">
                          {f.type.startsWith('image/') ? (
                            <>
                              <img
                                src={URL.createObjectURL(f)}
                                alt={f.name}
                                className="h-16 w-16 object-cover rounded border"
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
                            <div className="relative flex items-center gap-2 px-2 py-1.5 bg-white border rounded text-xs max-w-[120px]">
                              <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                  </div>
                )}

                {/* Форма ввода - фиксированная внизу */}
                <div className="p-4 border-t border-gray-200">
                  <div className="flex items-end gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={e => setFiles(prev => [...prev, ...Array.from(e.target.files || [])])}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                      title="Прикрепить файл"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                    </button>
                    <textarea
                      value={text}
                      onChange={e => setText(e.target.value)}
                      onKeyPress={handleKeyPress}
                      rows={1}
                      placeholder="Введите сообщение..."
                      className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-none"
                      style={{ minHeight: '44px', maxHeight: '120px' }}
                    />
                    <button
                      disabled={(!text.trim() && files.length === 0) || isSubmitting}
                      onClick={submit}
                      style={{ color: '#fff' }}
                      className="px-4 py-2.5 bg-red-600 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all !text-white flex-shrink-0"
                    >
                      {isSubmitting ? (
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      )}
                    </button>
                  </div>
                  <div className="text-xs text-gray-400 mt-2">
                    Enter для отправки, Shift+Enter для новой строки
                  </div>
                </div>
              </div>
            )}
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

export default TicketViewPage;
