import {
  ChangeEvent,
  FocusEvent,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
} from "react"
import { CommonInputProps } from "~~/components/xchange"

type InputBaseProps<T> = CommonInputProps<T> & {
  error?: boolean
  prefix?: ReactNode
  suffix?: ReactNode
  reFocus?: boolean
}

export const InputBase = <
  T extends { toString: () => string } | undefined = string,
>({
  name,
  value,
  onChange,
  placeholder,
  error,
  disabled,
  prefix,
  suffix,
  reFocus,
}: InputBaseProps<T>) => {
  const inputReft = useRef<HTMLInputElement>(null)

  let modifier = ""
  if (error) {
    modifier = "border-error"
  } else if (disabled) {
    modifier = "border-disabled bg-zinc-300"
  }

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value as unknown as T)
    },
    [onChange]
  )

  // Runs only when reFocus prop is passed, useful for setting the cursor
  // at the end of the input. Example AddressInput
  const onFocus = (e: FocusEvent<HTMLInputElement, Element>) => {
    if (reFocus !== undefined) {
      e.currentTarget.setSelectionRange(
        e.currentTarget.value.length,
        e.currentTarget.value.length
      )
    }
  }
  useEffect(() => {
    if (reFocus !== undefined && reFocus === true) inputReft.current?.focus()
  }, [reFocus])

  return (
    <div className={`flex ${modifier}`}>
      {prefix}
      <input
        className="bg-input ring-offset-background  placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border border-zinc-300 px-3 py-2 text-[16px] file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700"
        placeholder={placeholder}
        name={name}
        value={value?.toString()}
        onChange={handleChange}
        disabled={disabled}
        autoComplete="off"
        ref={inputReft}
        onFocus={onFocus}
      />
      {suffix}
    </div>
  )
}
