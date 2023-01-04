import { Device, DeviceProperty, OekoboilerDevice } from './types';
import { AylaDeviceApiService } from './AylaDeviceService';

export class OekoboilerApi {
  private attributeMap: { [key in keyof OekoboilerDevice]: string } = {
    boilerOn: 'F104',
    alarm: 'F110',
    setWaterTemp: 'F11',
    temperatureDelta: 'F12',
    currentWaterTemp: 'F103',
    pvFunction: 'F62',
    version: 'version',
  };

  protected aylaNetworkService: AylaDeviceApiService;

  constructor(userEmail: string, userPassword: string) {
    this.aylaNetworkService = new AylaDeviceApiService(userEmail, userPassword);
  }

  public getDevices(): Promise<Device[]> {
    return this.aylaNetworkService.getDevices();
  }

  public async updateProperty(key: number, value: unknown) {
    return this.aylaNetworkService.updateDeviceProperty(key, value);
  }

  public async getBoiler(dsn: string): Promise<OekoboilerDevice> {
    const properties = await this.aylaNetworkService.getDeviceProperties(dsn);
    return this.getBoilerFromProperties(properties);
  }

  private getPropertyKeyAndValue = (
    name: string,
    properties: DeviceProperty[],
  ): { value: unknown; key: number } => {
    const deviceProperty = properties.find(
      ({ property: p }) => p.name === name,
    );
    if (!deviceProperty?.property) {
      return { value: '', key: -1 };
    } else {
      return {
        value: deviceProperty.property.value,
        key: deviceProperty.property.key,
      };
    }
  };

  private getBoilerFromProperties = (
    properties: DeviceProperty[],
  ): OekoboilerDevice => {
    const boiler = Object.keys(this.attributeMap).reduce((acc, key) => {
      const { value } = this.getPropertyKeyAndValue(
        this.attributeMap[key as keyof OekoboilerDevice],
        properties,
      );
      Object.assign(acc, {
        [key]: value,
      });
      return acc;
    }, {} as OekoboilerDevice) as OekoboilerDevice;
    return boiler;
  };
}
