"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** Called once when the scene (or its lazy chunk) fails, so the parent can show the fallback. */
  onError: () => void;
};

type State = { failed: boolean };

/** Keeps a broken 3D scene (lost GPU, missing texture, failed chunk) from taking the page down. */
export class SceneErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[three] Scene failed, showing fallback.", error, info);
    }
    this.props.onError();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}
