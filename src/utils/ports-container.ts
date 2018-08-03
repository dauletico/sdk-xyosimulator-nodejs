export class PortsContainer {
  public constructor(public readonly http: number, public readonly socket: number) {}

  public toString(): string {
    return JSON.stringify({
      http: this.http,
      socket: this.socket
    }, null, '\t');
  }
}

export default PortsContainer;
