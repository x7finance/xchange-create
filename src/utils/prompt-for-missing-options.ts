import config from "../config";
import {
  ContractTypeQuestion,
  Extension,
  ExtensionDescriptor,
  ExtensionQuestion,
  Options,
  RawOptions,
  extensionWithSubextensions,
  isDefined,
  isExtension
} from "../types";
import inquirer, { Answers } from "inquirer";
import { extensionDict } from "./extensions-tree";
import { Contract } from "../../templates/base/packages/nextjs/utils/xchange/contract";

// default values for unspecified args
const defaultOptions: Options = {
  project: "my-project",
  ticker: "TICKER",
  supply: 100000000,
  install: true,
  dev: false,
  extensions: [],
  contractType: "standard-token",
  quote: false,
  network: "sepolia",
  usd: false,
};

const invalidQuestionNames = ["project", "install"];
const nullExtensionChoice = {
  name: 'None',
  value: null
}

export async function promptForMissingOptions(
  options: RawOptions,
  questionType: "create" | "quote"
): Promise<Options> {
  const questions = [];

  if (questionType === "create") {
    questions.push({
      type: "input",
      name: "project",
      message: "Your project name:",
      default: defaultOptions.project,
      validate: (value: string) => value.length > 0,
    });
  
    questions.push({
      type: "input",
      name: "ticker",
      message: "What is your TICKER?",
      default: defaultOptions.ticker,
      validate: (value: string) => value.length > 0,
    });
  
    questions.push({
      type: "number",
      name: "supply",
      message: "What is your token supply?",
      default: defaultOptions.supply,
      validate: (value: number) => value > 0,
    });
  
  
  
    const recurringAddFollowUps = (
      extensions: ExtensionDescriptor[],
      relatedQuestion: string
    ) => {
      extensions.filter(extensionWithSubextensions).forEach((ext) => {
        const nestedExtensions = ext.extensions.map(
          (nestedExt) => extensionDict[nestedExt]
        );
        questions.push({
          // INFO: assuming nested extensions are all optional. To change this,
          // update ExtensionDescriptor adding type, and update code here.
          type: "checkbox",
          name: `${ext.value}-extensions`,
          message: `Select optional extensions for ${ext.name}`,
          choices: nestedExtensions,
          when: (answers: Answers) => {
            const relatedResponse = answers[relatedQuestion];
            const wasMultiselectResponse = Array.isArray(relatedResponse);
            return wasMultiselectResponse
              ? relatedResponse.includes(ext.value)
              : relatedResponse === ext.value;
          },
        });
        recurringAddFollowUps(nestedExtensions, `${ext.value}-extensions`);
      });
    };
  
    config.questions.forEach((question) => {
      if (invalidQuestionNames.includes(question.name)) {
        throw new Error(
          `The name of the question can't be "${
            question.name
          }". The invalid names are: ${invalidQuestionNames
            .map((w) => `"${w}"`)
            .join(", ")}`
        );
      }
    
      if (question.type === "single-select" && question.name === "contract-type") {
        const contractTypes = (question as ContractTypeQuestion).contractTypes;

        questions.push({
          type: "list",
          name: question.name,
          message: question.message,
          choices: contractTypes,
        });
      } else {
        const extensions = (question as ExtensionQuestion).extensions
          .filter(isExtension)
          .map((ext: Extension) => extensionDict[ext])
          .filter(isDefined);
    
          
        const hasNoneOption = (question as ExtensionQuestion).extensions.includes(null);
    
        questions.push({
          type: question.type === "multi-select" ? "checkbox" : "list",
          name: question.name,
          message: question.message,
          choices: hasNoneOption ? [...extensions, nullExtensionChoice] : extensions,
        });
    
        recurringAddFollowUps(extensions, question.name);
      }
    });
    
  
    questions.push({
      type: "confirm",
      name: "install",
      message: "Install packages?",
      default: defaultOptions.install,
    });
  }


  if (questionType === "quote") {
    // Prompt only for the options required for the quote
    questions.push({
      type: "input",
      name: "network",
      message: "Enter the network:",
      validate: (value: string) => ["base", "polygon", "bsc", "eth", "arbitrum", "optimism"].includes(value),
      when: () => !options.network,
    });

    questions.push({
      type: "input",
      name: "contractType",
      message: "Enter the contract name:",
      validate: (value: string) => value.trim() !== "",
      when: () => !options.contractType,
    });
  }

  const answers = await inquirer.prompt(questions);

  

  const mergedOptions: Options = {
    project: options.project ?? answers.project,
    ticker: options.ticker ?? answers.ticker,
    supply: options.supply ?? answers.supply,
    install: options.install ?? answers.install,
    contractType: options.contractType ?? defaultOptions.contractType,
    dev: options.dev ?? defaultOptions.dev,
    quote: options?.quote ?? defaultOptions.quote,
    network: options?.network ?? defaultOptions.network,
    usd: options?.usd ?? defaultOptions.usd,
    extensions: [],
  };
  
  config.questions.forEach((question) => {
    const { name } = question;
    
    if (question.name === "solidity-framework") {
      const choice: Extension[] = [answers[name]].flat().filter(isDefined);
      mergedOptions.extensions.push(...choice);
    } else if (question.type === "single-select" && question.name === "contract-type") {
      mergedOptions.contractType = answers[name];
    }
  });
  
  const recurringAddNestedExtensions = (baseExtensions: Extension[]) => {
    baseExtensions.forEach((extValue) => {
      const nestedExtKey = `${extValue}-extensions`;
      const nestedExtensions = answers[nestedExtKey];
      if (nestedExtensions) {
        mergedOptions.extensions.push(...nestedExtensions);
        recurringAddNestedExtensions(nestedExtensions);
      }
    });
  };
  
  recurringAddNestedExtensions(mergedOptions.extensions);

  
  
  return mergedOptions;
}
