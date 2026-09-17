"use client";

import { AnimatePresence, motion } from "framer-motion";

export function QuantityStepper({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (value: number) => void;
  label: string;
}) {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <motion.button
        type="button"
        whileTap={{ scale: 0.85 }}
        onClick={() => onChange(value - 1)}
        disabled={value <= 0}
        aria-label={`-1 ${label}`}
        className="grid size-8 place-items-center border-2 border-line text-stellar-white transition-colors hover:border-stellar-pink disabled:cursor-not-allowed disabled:opacity-30"
      >
        −
      </motion.button>
      <span className="relative grid w-5 place-items-center overflow-hidden text-sm tabular-nums text-stellar-white">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={value}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="col-start-1 row-start-1"
          >
            {value}
          </motion.span>
        </AnimatePresence>
      </span>
      <motion.button
        type="button"
        whileTap={{ scale: 0.85 }}
        onClick={() => onChange(value + 1)}
        aria-label={`+1 ${label}`}
        className="grid size-8 place-items-center border-2 border-line text-stellar-white transition-colors hover:border-stellar-pink"
      >
        +
      </motion.button>
    </div>
  );
}
