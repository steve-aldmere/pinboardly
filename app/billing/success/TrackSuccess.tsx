"use client";

import { useEffect } from "react";
import { track } from "@/app/components/PlausibleTrack";

export default function TrackSuccess() {
  useEffect(() => {
    track("checkout_success");
  }, []);

  return null;
}
