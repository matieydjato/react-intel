/**
 * Typed error classes so the CLI can surface clear, actionable messages (FR-05).
 */

export class ReactIntelError extends Error {
  constructor(
    message: string,
    public readonly hint?: string,
  ) {
    super(message);
    this.name = "ReactIntelError";
  }
}

export class ParseError extends ReactIntelError {
  constructor(message: string, hint?: string) {
    super(message, hint);
    this.name = "ParseError";
  }
}

export class AnalysisError extends ReactIntelError {
  constructor(message: string, hint?: string) {
    super(message, hint);
    this.name = "AnalysisError";
  }
}

export class GenerationError extends ReactIntelError {
  constructor(message: string, hint?: string) {
    super(message, hint);
    this.name = "GenerationError";
  }
}

export class IOError extends ReactIntelError {
  constructor(message: string, hint?: string) {
    super(message, hint);
    this.name = "IOError";
  }
}
