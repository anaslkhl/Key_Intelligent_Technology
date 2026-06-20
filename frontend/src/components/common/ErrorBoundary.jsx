import { Component } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default class ErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() { return { hasError: true } }

  componentDidCatch(error, info) { console.error('KIT Support Hub runtime error', error, info) }

  render() {
    if (!this.state.hasError) return this.props.children

    return <main className="grid min-h-screen place-items-center bg-slate-50 px-4 text-center"><div className="max-w-md"><span className="state-icon error mx-auto h-16 w-16"><AlertTriangle size={30} /></span><h1 className="mt-6 !text-3xl !font-bold text-slate-900">Something went wrong</h1><p className="mt-3 text-slate-500">The application encountered an unexpected error. Reload the page to continue.</p><button type="button" className="button button-primary mt-7" onClick={() => window.location.reload()}><RefreshCw size={17} />Reload application</button></div></main>
  }
}
