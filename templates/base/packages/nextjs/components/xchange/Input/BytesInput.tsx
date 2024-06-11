import { useCallback } from "react"
import { bytesToString, isHex, toBytes, toHex } from "viem"
import { CommonInputProps, InputBase } from "~~/components/xchange"

export const BytesInput = ({
  value,
  onChange,
  name,
  placeholder,
  disabled,
}: CommonInputProps) => {
  const convertStringToBytes = useCallback(() => {
    onChange(
      isHex(value) ? bytesToString(toBytes(value)) : toHex(toBytes(value))
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
          onClick={convertStringToBytes}
        >
          #
        </div>
      }
    />
  )
}
