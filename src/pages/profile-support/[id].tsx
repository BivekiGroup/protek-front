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

const TicketViewPage = () => {
  const router = useRouter()
  const { id } = router.query as { id?: string }
  const metaData = getMetaByPath('/profile-support');
  const { data, loading, error, refetch } = useQuery(SUPPORT_TICKET, { variables: { id }, skip: !id })
  const [addMessage] = useMutation(ADD_SUPPORT_TICKET_MESSAGE)
  const [text, setText] = React.useState('')
  const [files, setFiles] = React.useState<File[]>([])

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
    const attachments = await uploadFiles()
    await addMessage({ variables: { input: { ticketId: id, message: text, attachments } } })
    setText('')
    setFiles([])
    await refetch()
  }

  const ticket = data?.supportTicket
  const statusRu: Record<string, string> = { OPEN: 'Открыт', IN_PROGRESS: 'В работе', RESOLVED: 'Решён', CLOSED: 'Закрыт' }

  return (
    <div className="page-wrapper">
      <MetaTags {...metaData} />
      <ProfileInfo />
      <div className="flex flex-col pt-10 pb-16 max-md:px-5">
        <div className="flex relative gap-8 items-start self-stretch max-md:gap-5 max-sm:flex-col max-sm:gap-4 justify-center mx-auto max-w-[1580px] w-full h-full">
          <LKMenu />
          <div className="flex relative flex-col gap-6 w-full items-start p-8 bg-white rounded-2xl flex-[1_0_0] max-md:gap-5">
            <button onClick={() => router.push('/profile-support')} className="text-sm text-blue-600">← Мои обращения</button>
            {loading && <div className="text-gray-500">Загрузка...</div>}
            {error && <div className="text-red-600">Ошибка: {String(error.message)}</div>}
            {ticket && (
              <>
                <div className="text-2xl font-bold text-gray-950">{ticket.subject}</div>
                <div className="w-full rounded-xl border divide-y">
                  {ticket.messages.map((m: any) => (
                    <div key={m.id} className="p-4">
                      <div className="text-sm text-gray-500">{m.authorType === 'ADMIN' ? 'Поддержка' : 'Вы'} • {new Date(m.createdAt).toLocaleString()}</div>
                      <div className="mt-1 whitespace-pre-wrap">{m.content}</div>
                      {!!m.attachments?.length && (
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {m.attachments.map((a: any) => (
                            a.contentType?.startsWith('image/') ? (
                              <a key={a.id} href={a.url} target="_blank" rel="noreferrer"><img src={a.url} alt={a.fileName || ''} className="h-20 w-20 object-cover rounded border" /></a>
                            ) : (
                              <a key={a.id} href={a.url} target="_blank" rel="noreferrer" className="text-xs px-2 py-1 bg-slate-100 rounded border">{a.fileName || 'файл'}</a>
                            )
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="w-full space-y-3">
                  <textarea value={text} onChange={e => setText(e.target.value)} rows={4} placeholder="Ваш ответ" className="w-full border rounded px-4 py-3" />
                  <div>
                    <input type="file" multiple onChange={e => setFiles(Array.from(e.target.files || []))} />
                    {files.length > 0 && (
                      <div className="flex gap-3 mt-2 flex-wrap">
                        {files.map((f, i) => (
                          f.type.startsWith('image/') ? (
                            <img key={i} src={URL.createObjectURL(f)} alt={f.name} className="h-20 w-20 object-cover rounded border" />
                          ) : (
                            <span key={i} className="text-xs px-2 py-1 bg-slate-100 rounded border">{f.name}</span>
                          )
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end">
                    <button disabled={!text.trim() && files.length === 0} onClick={submit} className="px-5 py-3 bg-red-600 text-white rounded-xl disabled:opacity-50">Отправить</button>
                  </div>
                </div>
              </>
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
