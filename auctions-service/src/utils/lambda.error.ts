export class LambdaError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message)
  }

  /**
   * Create a {@link LambdaError} with error code 500
   * @param message
   * @returns LambdaError
   */
  public static internalServer(message: string) {
    return new LambdaError(500, message)
  }
}
