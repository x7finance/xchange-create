import { useCallback } from "react"
import { hexToString, isHex, stringToHex } from "viem"
import { CommonInputProps, InputBase } from "~~/components/xchange"

export const Bytes32Input = ({
  value,
  onChange,
  name,
  placeholder,
  disabled,
}: CommonInputProps) => {
  const convertStringToBytes32 = useCallback(() => {
    if (!value) {
      return
    }
    onChange(
      isHex(value)
        ? hexToString(value, { size: 32 })
        : stringToHex(value, { size: 32 })
    )
  }, [onChange, value])

  return (
    <InputBase
      name={name}
      value={value}
      placeholder={placeholder}
      onChange={onChange}
      disabled={disabled}
      suffix={
        <div
          className="text-accent cursor-pointer self-center px-4 text-xl font-semibold"
          onClick={convertStringToBytes32}
        >
          #
        </div>
      }
    />
  )
}
