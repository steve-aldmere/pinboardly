"use client";

import Link from "next/link";
import { ReactNode } from "react";

declare global {
  interface Window {
    plausible?: (eventName: string, options?: { props?: Record<string, any> }) => void;
  }
}

export function track(eventName: string, props?: Record<string, any>) {
  if (typeof window === "undefined") return;
  if (typeof window.plausible === "function") {
    window.plausible(eventName, props ? { props } : undefined);
  }
}

export function PlausibleLink({
  href,
  event,
  props,
  className,
  children,
}: {
  href: string;
  event: string;
  props?: Record<string, any>;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={className} onClick={() => track(event, props)}>
      {children}
    </Link>
  );
}
