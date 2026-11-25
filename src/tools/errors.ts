export type ToolErrorCode =
  | 'ENCRYPTED' | 'CORRUPT' | 'UNSUPPORTED' | 'TOO_LARGE'
  | 'OUT_OF_MEMORY' | 'CANCELLED' | 'UNKNOWN';

export class ToolError extends Error {
  constructor(public code: ToolErrorCode, public userMessage: string) {
    super(userMessage);
  }
}
