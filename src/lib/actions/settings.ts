"use server";

import { cookies } from "next/headers";
import { FOCUS_COOKIE } from "@/lib/constants";
import { setSetting } from "@/lib/db/queries";

export async function setFocusMode(on: boolean) {
  const store = await cookies();
  store.set(FOCUS_COOKIE, on ? "1" : "0", {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });
  setSetting("focus-mode", on ? "1" : "0");
}
