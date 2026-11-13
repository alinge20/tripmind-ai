import type { ComponentProps, ReactNode } from "react";

/*
  Piezas de formulario accesibles: cada campo tiene <label>, mensaje de ayuda y de error
  enlazados con aria-describedby, y aria-invalid cuando hay un error.
*/

const inputBase =
  "block w-full rounded-xl border bg-white px-3.5 py-2.5 text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200";

export function inputClasses(hasError: boolean) {
  return `${inputBase} ${hasError ? "border-red-400" : "border-slate-300"}`;
}

type FieldProps = {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  className?: string;
  children: (describedBy: string | undefined) => ReactNode;
};

export function Field({ id, label, error, hint, optional, className = "", children }: FieldProps) {
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(" ") || undefined;
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-slate-800">
        {label}
        {optional ? <span className="ml-1 font-normal text-slate-500">(opcional)</span> : null}
      </label>
      {children(describedBy)}
      {hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-slate-500">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-sm font-medium text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}

type SelectProps = ComponentProps<"select"> & { options: { value: string; label: string }[]; hasError?: boolean };

export function Select({ options, hasError = false, ...props }: SelectProps) {
  return (
    <select className={inputClasses(hasError)} {...props}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
