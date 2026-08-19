"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Eye, EyeOff } from "lucide-react";
import { setFocusMode } from "@/lib/actions/settings";

export function FocusToggle({ initial }: { initial: boolean }) {
  const [on, setOn] = useState(initial);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      type="button"
      className="btn btn-ghost"
      aria-pressed={on}
      aria-label={on ? "Fokus-Modus ausschalten" : "Fokus-Modus einschalten"}
      disabled={pending}
      onClick={() => {
        const next = !on;
        setOn(next);
        document.documentElement.classList.toggle("focus-mode", next);
        startTransition(async () => {
          await setFocusMode(next);
          router.refresh();
        });
      }}
    >
      {on ? <EyeOff aria-hidden={true} size={18} /> : <Eye aria-hidden={true} size={18} />}
      <span className="hidden sm:inline">{on ? "Fokus an" : "Fokus"}</span>
    </button>
  );
}
