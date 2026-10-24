import { Component } from 'react'

/**
 * Error Boundary — menangkap error di subtree React,
 * mencegah crash seluruh aplikasi, menampilkan fallback UI.
 * Digunakan di App.jsx membungkus <Outlet /> atau halaman kritis.
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo })

    // Log ke console (development)
    console.error('[ErrorBoundary]', error, errorInfo)

    // Kirim ke layanan monitoring (Sentry, LogRocket, dll) di production
    if (process.env.NODE_ENV === 'production' && window.logError) {
      window.logError(error, errorInfo)
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.resetErrorBoundary.bind(this))
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
          <div className="max-w-md w-full text-center">
            <svg
              className="mx-auto h-16 w-16 text-slate-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h1 className="mt-4 text-xl font-semibold text-slate-900">Terjadi kesalahan</h1>
            <p className="mt-2 text-slate-500">
              Aplikasi mengalami masalah. Tim kami sudah diberitahu.
            </p>
            <button
              onClick={this.resetErrorBoundary}
              className="mt-6 btn-primary"
            >
              Coba lagi
            </button>
            {process.env.NODE_ENV !== 'production' && (
              <details className="mt-4 text-left text-xs text-slate-400">
                <summary>Detail teknis (development)</summary>
                <pre className="mt-2 p-2 bg-slate-100 rounded overflow-auto max-h-64">
                  {this.state.error?.stack || this.state.error?.message}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }

  resetErrorBoundary() {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }
}

export default ErrorBoundary