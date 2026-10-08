"use client";

import * as RadixDialog from "@radix-ui/react-dialog";
import type { ReactNode } from "react";

export const Dialog = RadixDialog.Root;
export const DialogTrigger = RadixDialog.Trigger;

export function DialogContent({ children }: { children: ReactNode }) {
  return (
    <RadixDialog.Portal>
      <RadixDialog.Overlay className="fixed inset-0 z-50 bg-stellar-black/80 backdrop-blur-sm data-[state=open]:animate-[fadeIn_0.15s_ease-out]" />
      <RadixDialog.Content className="fixed top-1/2 left-1/2 z-50 max-h-[88vh] w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-line bg-stellar-black-soft p-6 shadow-[0_0_60px_rgba(255,112,224,0.08)] focus:outline-none data-[state=open]:animate-[dialogIn_0.2s_ease-out] sm:p-8">
        {children}
        <RadixDialog.Close className="absolute top-4 right-4 flex size-8 items-center justify-center rounded-full border border-line text-stellar-white/60 transition-colors hover:border-stellar-pink hover:text-stellar-pink">
          <span aria-hidden="true">✕</span>
          <span className="sr-only">Cerrar</span>
        </RadixDialog.Close>
      </RadixDialog.Content>
    </RadixDialog.Portal>
  );
}

export const DialogTitle = RadixDialog.Title;
export const DialogDescription = RadixDialog.Description;
