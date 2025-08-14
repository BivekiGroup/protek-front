import type { GetServerSideProps, GetServerSidePropsContext } from 'next'

export const getServerMetaProps: GetServerSideProps = async (ctx: GetServerSidePropsContext) => {
  try {
    const base = process.env.CMS_BASE_URL || process.env.NEXT_PUBLIC_CMS_BASE_URL
    if (!base) return { props: {} }
    const path = (ctx.resolvedUrl || '/').split('?')[0]
    const res = await fetch(`${base.replace(/\/$/, '')}/api/seo-meta?path=${encodeURIComponent(path)}`)
    if (!res.ok) return { props: {} }
    const data = await res.json()
    return { props: { metaFromCms: data?.meta || null } }
  } catch {
    return { props: {} }
  }
}

