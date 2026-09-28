/** No response. `sent` tells whether the request body may have reached the server (unknown result). */
export class NetworkError extends Error {
  constructor(
    readonly offline: boolean,
    readonly sent: boolean,
    readonly timedOut: boolean,
  ) {
    super(offline ? 'offline' : timedOut ? 'timeout' : 'network');
    this.name = 'NetworkError';
  }
}
