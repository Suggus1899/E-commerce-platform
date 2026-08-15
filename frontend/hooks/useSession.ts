"use client";

import { useEffect, useState } from "react";
import type { SessionResponse } from "@/lib/types";

export interface UseSessionState extends SessionResponse {
  loading: boolean;
}

/**
 * Reads the current session from `/api/auth/session` (a server-side Route
 * Handler that inspects the httpOnly `auth_token` cookie). The JWT itself is
 * never exposed to this hook or any other client-side code.
 */
export function useSession(): UseSessionState {
  const [state, setState] = useState<UseSessionState>({ authenticated: false, loading: true });

  useEffect(() => {
    let cancelled = false;

    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data: SessionResponse) => {
        if (!cancelled) setState({ ...data, loading: false });
      })
      .catch(() => {
        if (!cancelled) setState({ authenticated: false, loading: false });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
