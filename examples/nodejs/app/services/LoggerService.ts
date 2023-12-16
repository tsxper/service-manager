export class LoggerService {
  log(msg: string, severity = 0): void {
    console.log({ msg, severity });
  }
}
