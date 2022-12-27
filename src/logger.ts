import chalk from "chalk";

export default class Logger {
  private readonly moduleName: string;
  private emojiList = {
    success: "✅ ",
    error: "❌ ",
    info: "ℹ️  ",
    warning: "⚠️",
    trace: "🔍",
    log: "📝",
  } as const;
  private format = "[{date}] {moduleName} [{emoji}] {message}"
  constructor(moduleName: string) {
    this.moduleName = moduleName;
  }
  private formatMessage(message: string, title: keyof typeof this.emojiList) {
    return this.format
      .replace("{date}", new Date().toLocaleString())
      .replace("{emoji}", this.emojiList[title])
      .replace("{title}", title.toUpperCase())
      .replace("{message}", message)
      .replace("{moduleName}", this.moduleName);
  }
  public success(message: string) {
    console.log(chalk.green(this.formatMessage(message, "success")));
  }
  public error(message: string) {
    console.log(chalk.red(this.formatMessage(message, "error")));
  }
  public info(message: string) {
    console.log(chalk.cyan(this.formatMessage(message, "info")));
  }
  public warning(message: string) {
    console.log(chalk.yellow(this.formatMessage(message, "warning")));
  }
  public trace(message: string) {
    console.log(chalk.blue(this.formatMessage(message, "trace")));
  }
  public log(message: string) {
    console.log(chalk.gray(this.formatMessage(message, "log")));
  }
}