import { useCallback, useEffect, useState } from "react"
import { SquareAsteriskIcon } from "lucide-react"
import { IconButton } from "~~/components/ui/iconbutton"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~~/components/ui/tooltip"
import {
  CommonInputProps,
  InputBase,
  IntegerVariant,
  isValidInteger,
} from "~~/components/xchange"
import { cn } from "~~/utils/xchange/cn"

type IntegerInputProps = CommonInputProps<string | bigint> & {
  variant?: IntegerVariant
  disableMultiplyBy1e18?: boolean
}

export const IntegerInput = ({
  value,
  onChange,
  name,
  placeholder,
  disabled,
  variant = IntegerVariant.UINT256,
  disableMultiplyBy1e18 = false,
}: IntegerInputProps) => {
  const [inputError, setInputError] = useState(false)
  const multiplyBy1e18 = useCallback(() => {
    if (!value) {
      return
    }
    if (typeof value === "bigint") {
      return onChange(value * 10n ** 18n)
    }
    return onChange(BigInt(Math.round(Number(value) * 10 ** 18)))
  }, [onChange, value])

  useEffect(() => {
    if (isValidInteger(variant, value, false)) {
      setInputError(false)
    } else {
      setInputError(true)
    }
  }, [value, variant])

  return (
    <InputBase
      name={name}
      value={value}
      placeholder={placeholder}
      error={inputError}
      onChange={onChange}
      disabled={disabled}
      suffix={
        !inputError &&
        !disableMultiplyBy1e18 && (
          <Tooltip>
            <TooltipTrigger tabIndex={-1}>
              <IconButton
                name="multiply"
                size={"lg"}
                icon={SquareAsteriskIcon}
                className={cn(
                  disabled ? "cursor-not-allowed" : "cursor-pointer",
                  "p-1 text-sky-500"
                )}
                onClick={multiplyBy1e18}
                disabled={disabled}
              />
            </TooltipTrigger>
            <TooltipContent>Multiply by 10^18 (wei)</TooltipContent>
          </Tooltip>
        )
      }
    />
  )
}
