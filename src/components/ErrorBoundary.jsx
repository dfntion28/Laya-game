import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
        <div className="text-5xl">😵</div>
        <h1 className="font-display text-2xl font-bold">May nasirang bahagi</h1>
        <p className="max-w-sm text-sm text-muted">{String(this.state.error?.message || this.state.error)}</p>
        <button type="button" onClick={() => { this.props.onReset?.(); this.setState({ error: null }); }} className="rounded-2xl bg-gold px-6 py-3 font-display font-bold text-night">
          I-reset ang laro
        </button>
      </div>
    );
  }
}
