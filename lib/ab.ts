/*
 * A/B test dock_pill_v1 (AB_TEST_DOCK.md): the phones' floating WhatsApp
 * button as a labelled "Get a quote" pill or the 52px icon. proxy.ts splits
 * visitors 50/50 into a cookie that sticks for 90 days; the dock and the
 * lead and contact events read it here.
 */

export const DOCK_EXPERIMENT_ID = "dock_pill_v1";
export const DOCK_COOKIE = "ab_dock";
export type DockVariant = "pill" | "icon";

/** This visitor's variant, from the cookie; "icon" when there's none. */
export function readDockVariant(): DockVariant {
  if (typeof document === "undefined") return "icon";
  return (document.cookie.match(/(?:^|; )ab_dock=(pill|icon)/)?.[1] ??
    "icon") as DockVariant;
}
