import { networkInterfaces } from 'os';

export class NetworkHelperService {

  public getLocalIPAddress(): string | null {
    const networkMap = networkInterfaces();
    let localIP: string | null = null;

    for (const key in networkMap) {
      if (networkMap.hasOwnProperty(key)) {
        const networks = networkMap[key];

        for (let i = 0; i < networks.length; i = i + 1) { // tslint:disable-line:prefer-for-of
          const networkDetails = networks[i];
          if (networkDetails.family === 'IPv4' && !networkDetails.internal) {
            localIP = networkDetails.address;
            break;
          }
        }

        if (localIP) {
          break;
        }
      }
    }

    return localIP;
  }
}

export default NetworkHelperService;
