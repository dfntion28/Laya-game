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
      <div className="flex min-h-dvh items-center justify-center p-6">
        <div className="max-w-sm rounded-3xl border-[4px] border-ink bg-paper p-6 text-center pop-shadow">
          <h1 className="font-display text-3xl">Something broke</h1>
          <p className="mt-2 text-sm font-bold text-ink-soft">{String(this.state.error?.message || this.state.error)}</p>
          <button type="button" onClick={() => { this.props.onReset?.(); this.setState({ error: null }); }} className="press pop-shadow mt-4 rounded-2xl border-[3px] border-ink bg-mustard px-6 py-3 font-display text-lg">
            Start a new game
          </button>
        </div>
      </div>
    );
  }
}
