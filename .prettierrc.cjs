/** @type { PrettierConfig  } */
const config = {
  arrowParens: "avoid",
  printWidth: 80,
  singleQuote: false,
  jsxSingleQuote: false,
  semi: false,
  trailingComma: "es5",
  tabWidth: 2,
  importOrder: ["^react$", "<THIRD_PARTY_MODULES>", "^~~/(.*)$"],
}

module.exports = config
