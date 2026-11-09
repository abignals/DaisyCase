import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = { children: ReactNode };
type State = { hasError: boolean; attempt: number };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, attempt: 0 };

  static getDerivedStateFromError(): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[Daisy] Le widget a rencontré une erreur :', error, info.componentStack);
  }

  // Changer la clé force React à reconstruire toute l'application de zéro
  retry = () => this.setState((s) => ({ hasError: false, attempt: s.attempt + 1 }));

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-xl border border-gray-200 p-4 text-sm" role="alert">
          <p className="font-medium">Un problème est survenu lors de l'affichage de la réservation.</p>
          <p className="mt-1 text-gray-600">Réessayez, ou contactez directement l'atelier.</p>
          <button onClick={this.retry} className="mt-3 rounded-lg border border-gray-300 px-3 py-1.5">
            Réessayer
          </button>
        </div>
      );
    }
    return <div key={this.state.attempt}>{this.props.children}</div>;
  }
}