import { INPUT_CLASS } from "./styles";

interface TimeFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export function TimeField({ label, value, onChange }: TimeFieldProps) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1.5">
        {label}
        <input
          type="time"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${INPUT_CLASS} mt-1.5 font-normal`}
        />
      </label>
    </div>
  );
}
