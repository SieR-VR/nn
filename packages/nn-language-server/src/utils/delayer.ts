export class Delayer<T> {
  constructor(  
    public defaultDelay: number,
    private timeout: NodeJS.Timeout | null = null,
    private completionPromise: Promise<T> | null = null,
    private onSuccess: ((value: T) => void) | null = null,
    private task: (() => T) | null = null,
  )
  {
  }

  public trigger(task: () => T, delay: number = this.defaultDelay): Promise<T> {
    this.task = task;
    
    if (delay >= 0) {
      this.cancelTimeout();
    }

    if (!this.completionPromise) {
      this.completionPromise = new Promise<T>((resolve) => {
        this.onSuccess = resolve;
      }).then(() => {
        this.completionPromise = null;
        const result = this.task!();
        this.task = null;
        return result;
      });
    }

    if (delay >= 0 || this.timeout === null) {
      this.timeout = setTimeout(() => {
        this.timeout = null;
        this.onSuccess!(null!);
      }, delay >= 0 ? delay : this.defaultDelay);
    }

    return this.completionPromise;
  }

  public cancelTimeout(): void {
    if (this.timeout !== null) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
  }
}
