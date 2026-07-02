"use client";

import posthog from 'posthog-js';
import { PostHogProvider as Provider } from 'posthog-js/react';
import React, { useEffect } from 'react';

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_POSTHOG_KEY && process.env.NEXT_PUBLIC_POSTHOG_HOST) {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
        capture_pageview: false, // We'll handle this manually if needed
        capture_pageleave: false,
      });
    }
  }, []);

  return <Provider client={posthog}>{children}</Provider>;
}
