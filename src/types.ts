import type { Question } from "inquirer"
import { ChainId } from "./utils/consts"

export type Args = string[]

export type RawOptions = {
  project: string | null
  ticker: string | null
  supply: number | null
  install: boolean | null
  dev: boolean
  extensions: Extension[] | null
  contractType: ContractType | null
  help?: boolean
  usd?: boolean
  quote: boolean
  deployChain: ChainId | null
}

type NonNullableRawOptions = {
  [Prop in keyof RawOptions]: NonNullable<RawOptions[Prop]>
}

export type Options = NonNullableRawOptions

export type Extension = "hardhat" | "foundry"

export type ContractType =
  | "standard-token"
  | "burn-token"
  | "tax-token"
  | "deflationary-token"
  | "test-erc20"
  | "my-custom-contract"

type NullExtension = null
export type ExtensionOrNull = Extension | NullExtension

// corresponds to inquirer question types:
//  - multi-select -> checkbox
//  - single-select -> list
type QuestionType = "multi-select" | "single-select"
export interface ExtensionQuestion<
  T extends ExtensionOrNull[] = ExtensionOrNull[]
> {
  type: QuestionType
  extensions: T
  name: string
  message: Question["message"]
  default?: T[number]
}

export interface ContractTypeQuestion {
  type: "single-select"
  contractTypes: ContractType[]
  name: string
  message: Question["message"]
  default?: ContractType
}

export const isExtension = (item: ExtensionOrNull): item is Extension =>
  item !== null

export const isContractType = (
  item: ContractType | null
): item is ContractType => item !== null

/**
 * This function makes sure that the `T` generic type is narrowed down to
 * whatever `extensions` are passed in the question prop. That way we can type
 * check the `default` prop is not using any valid extension, but only one
 * already provided in the `extensions` prop.
 *
 * Questions can be created without this function, just using a normal object,
 * but `default` type will be any valid Extension.
 */
export const typedQuestion = <T extends ExtensionOrNull[]>(
  question: ExtensionQuestion<T>
) => question

export const typedContractTypeQuestion = (question: ContractTypeQuestion) =>
  question

export type Config = {
  questions: (ExtensionQuestion | ContractTypeQuestion)[]
}

export const isDefined = <T>(item: T | undefined | null): item is T =>
  item !== undefined && item !== null

export type ExtensionDescriptor = {
  name: string
  value: Extension
  path: string
  extensions?: Extension[]
  extends?: Extension
}

export type ExtensionBranch = ExtensionDescriptor & {
  extensions: Extension[]
}

export type ExtensionDict = {
  [extension in Extension]: ExtensionDescriptor
}

export const extensionWithSubextensions = (
  extension: ExtensionDescriptor | undefined
): extension is ExtensionBranch => {
  return Object.prototype.hasOwnProperty.call(extension, "extensions")
}

export type TemplateDescriptor = {
  path: string
  fileUrl: string
  relativePath: string
  source: string
}
