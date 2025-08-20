import type { GetServerSideProps } from 'next'

export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: { destination: '/profile-set', permanent: false },
  props: {},
})

export default function RedirectToNewProfile() {
  return null
}

