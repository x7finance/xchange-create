import chalk from "chalk";

export const TITLE_TEXT = `
${chalk.bold.green("   $$\\   $$\\           $$\\                                               ")}
${chalk.bold.green("   $$ |  $$ |          $$ |                                              ")}
${chalk.bold.green("   \\$$\\ $$  | $$$$$$$\\ $$$$$$$\\   $$$$$$\\  $$$$$$$\\   $$$$$$\\   $$$$$$\\  ")}
${chalk.bold.green("    \\$$$$  / $$  _____|$$  __$$\\  \\____$$\\ $$  __$$\\ $$  __$$\\ $$  __$$\\ ")}
${chalk.bold.green("    $$  $$<  $$ /      $$ |  $$ | $$$$$$$ |$$ |  $$ |$$ /  $$ |$$$$$$$$ |")}
${chalk.bold.green("   $$  /\\$$\\ $$ |      $$ |  $$ |$$  __$$ |$$ |  $$ |$$ |  $$ |$$   ____|")}
${chalk.bold.green("   $$ /  $$ |\\$$$$$$$\\ $$ |  $$ |\\$$$$$$$ |$$ |  $$ |\\$$$$$$$ |\\$$$$$$$\\ ")}
${chalk.bold.green("   \\__|  \\__| \\_______|\\__|  \\__| \\_______|\\__|  \\__| \\____$$ | \\_______|")}
${chalk.bold.green("                                                     $$\\   $$ |          ")}
${chalk.bold.green("                                                     \\$$$$$$  |          ")}
${chalk.bold.green("                                                      \\______/           ")}

${chalk.dim("🧪 Xchange Create will scaffold and entire project allowing you to deploy your project to Xchange in seconds.")}
${chalk.dim(" ")}
${chalk.dim("Trust No One. Trust Code. Long Live DeFi!")}
`;

export function renderIntroMessage() {
  console.log(TITLE_TEXT);
}