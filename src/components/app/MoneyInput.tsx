import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { centsToInput, parseMoney } from "@/lib/money";

/** Text input that reports integer cents (null when empty/invalid). */
export function MoneyInput({ value, onChange, id, placeholder = "0,00", ...rest }: { value: number | null; onChange: (c: number | null) => void; id?: string; placeholder?: string; "aria-label"?: string }) {
  const [text, setText] = useState(value != null ? centsToInput(value) : "");
  useEffect(() => { if (value != null && parseMoney(text) !== value) setText(centsToInput(value)); if (value == null && parseMoney(text) != null) setText(""); }, [value]); // eslint-disable-line react-hooks/exhaustive-deps
  const invalid = text !== "" && parseMoney(text) == null;
  return <Input id={id} inputMode="decimal" placeholder={placeholder} value={text} aria-invalid={invalid} aria-label={rest["aria-label"]}
    onChange={(e) => { setText(e.target.value); onChange(parseMoney(e.target.value)); }} />;
}
