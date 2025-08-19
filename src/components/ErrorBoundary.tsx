import React from 'react'

type Props = { children: React.ReactNode }
type State = { hasError: boolean; error?: any }

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error }
  }
  componentDidCatch(error: any, info: any) {
    console.error('Global UI ErrorBoundary caught:', error, info)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white">
          <div className="flex flex-col items-center gap-3 text-center px-6">
            <div className="text-2xl font-semibold">Произошла ошибка</div>
            <div className="text-gray-600">Попробуйте обновить страницу. Если проблема повторится — напишите нам.</div>
            <button className="mt-2 rounded bg-black text-white px-4 py-2" onClick={() => location.reload()}>
              Обновить
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
