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

const ProfileSupportPage = () => {
  const router = useRouter()
  const metaData = getMetaByPath('/profile-support');
  const { data, loading, error, refetch } = useQuery(MY_SUPPORT_TICKETS, { variables: { limit: 50, offset: 0 } })
  const [createTicket] = useMutation(CREATE_SUPPORT_TICKET)
  const [subject, setSubject] = React.useState('')
  const [message, setMessage] = React.useState('')
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
    const { data } = await createTicket({ variables: { input: { subject, message, attachments } } })
    setSubject('')
    setMessage('')
    setFiles([])
    await refetch()
    if (data?.createSupportTicket?.id) router.push(`/profile-support/${data.createSupportTicket.id}`)
  }

  const tickets = data?.mySupportTickets || []
  const statusRu: Record<string, string> = { OPEN: 'Открыт', IN_PROGRESS: 'В работе', RESOLVED: 'Решён', CLOSED: 'Закрыт' }

  return (
    <div className="page-wrapper">
      <MetaTags {...metaData} />
      <ProfileInfo />
      <div className="flex flex-col pt-10 pb-16 max-md:px-5">
        <div className="flex relative gap-8 items-start self-stretch max-md:gap-5 max-sm:flex-col max-sm:gap-4 justify-center mx-auto max-w-[1580px] w-full h-full">
          <LKMenu />
          <div className="flex relative flex-col gap-6 w-full items-start p-8 bg-white rounded-2xl flex-[1_0_0] max-md:gap-5">
            <div className="text-2xl font-bold text-gray-950">Техподдержка</div>

            <div className="w-full space-y-3">
              <div className="text-lg font-semibold">Мои обращения</div>
              <div className="divide-y rounded-xl border">
                {loading && <div className="p-4 text-gray-500">Загрузка...</div>}
                {error && <div className="p-4 text-red-600">Ошибка: {String(error.message)}</div>}
                {tickets.map((t: any) => (
                  <div key={t.id} onClick={() => router.push(`/profile-support/${t.id}`)} className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-slate-50">
                    <div className="font-medium">{t.subject}</div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <span className="px-2 py-1 bg-slate-100 rounded text-xs">{statusRu[t.status] || t.status}</span>
                      <span className="text-xs">{new Date(t.lastMessageAt).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
                {!loading && tickets.length === 0 && (
                  <div className="p-4 text-gray-500">Обращений пока нет</div>
                )}
              </div>
            </div>

            <div className="w-full space-y-3">
              <div className="text-lg font-semibold">Новое обращение</div>
              <div className="space-y-3">
                <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Тема" className="w-full border rounded px-4 py-3" />
                <textarea value={message} onChange={e => setMessage(e.target.value)} rows={4} placeholder="Опишите вашу проблему" className="w-full border rounded px-4 py-3" />
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
                  <button disabled={!subject.trim() || !message.trim()} onClick={submit} className="px-5 py-3 bg-red-600 text-white rounded-xl disabled:opacity-50">Отправить</button>
                </div>
              </div>
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
