import { Dispatch, SetStateAction, useEffect, useState } from "react"
import { ContractInput } from "./ContractInput"
import {
  getFunctionInputKey,
  getInitalTupleArrayFormState,
} from "./utilsContract"
import { Button } from "~~/components/ui/button"
import { replacer } from "~~/utils/xchange/common"
import { AbiParameterTuple } from "~~/utils/xchange/contract"

type TupleArrayProps = {
  abiTupleParameter: AbiParameterTuple & { isVirtual?: true }
  setParentForm: Dispatch<SetStateAction<Record<string, any>>>
  parentStateObjectKey: string
  parentForm: Record<string, any> | undefined
}

export const TupleArray = ({
  abiTupleParameter,
  setParentForm,
  parentStateObjectKey,
}: TupleArrayProps) => {
  const [form, setForm] = useState<Record<string, any>>(() =>
    getInitalTupleArrayFormState(abiTupleParameter)
  )
  const [additionalInputs, setAdditionalInputs] = useState<
    Array<typeof abiTupleParameter.components>
  >([abiTupleParameter.components])

  const depth = (abiTupleParameter.type.match(/\[\]/g) || []).length

  useEffect(() => {
    // Extract and group fields based on index prefix
    const groupedFields = Object.keys(form).reduce(
      (acc, key) => {
        const [indexPrefix, ...restArray] = key.split("_")
        const componentName = restArray.join("_")
        if (!acc[indexPrefix]) {
          acc[indexPrefix] = {}
        }
        acc[indexPrefix][componentName] = form[key]
        return acc
      },
      {} as Record<string, Record<string, any>>
    )

    let argsArray: Array<Record<string, any>> = []

    Object.keys(groupedFields).forEach(key => {
      const currentKeyValues = Object.values(groupedFields[key])

      const argsStruct: Record<string, any> = {}
      abiTupleParameter.components.forEach((component, componentIndex) => {
        argsStruct[component.name || `input_${componentIndex}_`] =
          currentKeyValues[componentIndex]
      })

      argsArray.push(argsStruct)
    })

    if (depth > 1) {
      argsArray = argsArray.map(args => {
        return args[abiTupleParameter.components[0].name || "tuple"]
      })
    }

    setParentForm(parentForm => {
      return {
        ...parentForm,
        [parentStateObjectKey]: JSON.stringify(argsArray, replacer),
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(form, replacer)])

  const addInput = () => {
    setAdditionalInputs(previousValue => {
      const newAdditionalInputs = [
        ...previousValue,
        abiTupleParameter.components,
      ]

      // Add the new inputs to the form
      setForm(form => {
        const newForm = { ...form }
        abiTupleParameter.components.forEach((component, componentIndex) => {
          const key = getFunctionInputKey(
            `${newAdditionalInputs.length - 1}_${
              abiTupleParameter.name || "tuple"
            }`,
            component,
            componentIndex
          )
          newForm[key] = ""
        })
        return newForm
      })

      return newAdditionalInputs
    })
  }

  const removeInput = () => {
    // Remove the last inputs from the form
    setForm(form => {
      const newForm = { ...form }
      abiTupleParameter.components.forEach((component, componentIndex) => {
        const key = getFunctionInputKey(
          `${additionalInputs.length - 1}_${abiTupleParameter.name || "tuple"}`,
          component,
          componentIndex
        )
        delete newForm[key]
      })
      return newForm
    })
    setAdditionalInputs(inputs => inputs.slice(0, -1))
  }

  return (
    <div>
      <div className="collapse-arrow border-secondary collapse border-2 bg-zinc-200 py-1.5 pl-4">
        <input type="checkbox" className="peer min-h-fit" />
        <div className="collapse-title text-primary-content/50 min-h-fit p-0 peer-checked:mb-1">
          <p className="m-0 text-[1rem]">{abiTupleParameter.internalType}</p>
        </div>
        <div className="border-secondary/70 collapse-content ml-3 flex-col space-y-2 border-l-2 pl-4">
          {additionalInputs.map((additionalInput, additionalIndex) => (
            <div key={additionalIndex} className="space-y-1">
              <span className="badge badge-sm bg-zinc-300">
                {depth > 1 ? `${additionalIndex}` : `tuple[${additionalIndex}]`}
              </span>
              <div className="space-y-4">
                {additionalInput.map((param, index) => {
                  const key = getFunctionInputKey(
                    `${additionalIndex}_${abiTupleParameter.name || "tuple"}`,
                    param,
                    index
                  )
                  return (
                    <ContractInput
                      setForm={setForm}
                      form={form}
                      key={key}
                      stateObjectKey={key}
                      paramType={param}
                    />
                  )
                })}
              </div>
            </div>
          ))}
          <div className="flex space-x-2">
            <Button variant="outline" onClick={addInput}>
              +
            </Button>
            {additionalInputs.length > 0 && (
              <Button variant="outline" onClick={removeInput}>
                -
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
