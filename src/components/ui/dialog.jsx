import {useEffect} from "react";
import {cn} from "../../lib/utils";

export function Dialog({open, onClose, children}) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose?.();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className={cn(
          "relative z-10 w-[95vw] max-w-lg rounded-[var(--radius)] border border-border bg-card shadow-xl"
        )}>
        {children}
      </div>
    </div>
  );
}

export function DialogHeader({children}) {
  return <div className="p-6 border-b border-border">{children}</div>;
}

export function DialogContent({children, className}) {
  return <div className={cn("p-6", className)}>{children}</div>;
}

export function DialogTitle({children}) {
  return <h1 className="text-lg font-semibold leading-none tracking-tight">{children}</h1>;
}

export function DialogFooter({children}) {
  return (
    <div className="p-6 border-t border-border flex justify-end gap-2">
      {children}
    </div>
  );
}
