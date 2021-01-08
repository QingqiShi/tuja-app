declare namespace Global {
  export interface ProcessEnv {
    EOD_API_KEY?: string;
  }
  export interface Process {
    env: ProcessEnv;
  }
}

declare const process: Global.Process;
