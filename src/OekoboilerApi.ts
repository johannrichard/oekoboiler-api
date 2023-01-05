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

  /**
   * Main Oekboiler Api Class
   *
   * implements an Oekoboiler Api client, connects
   * to the AylaNetwork Services (EU) and wraps it into
   *
   *
   * @param userEmail: your Oekoboiler App username
   * @param userPassword: your Oekoboiler App password
   */
  constructor(userEmail: string, userPassword: string) {
    this.aylaNetworkService = new AylaDeviceApiService(userEmail, userPassword);
  }

  /**
   * Get Oekoboiler devices
   *
   * @returns Oekoboiler devices
   */
  public getDevices(): Promise<Device[]> {
    return this.aylaNetworkService.getDevices();
  }

  /**
   *
   * @param key property key (See {@link Device})
   * @param value
   * @returns
   */
  public async updateProperty(key: number, value: unknown) {
    return this.aylaNetworkService.updateDeviceProperty(key, value);
  }

  /**
   * Get Oekoboiler Data mapped into {@link OekoboilerDevice}
   *
   * @param dsn Boiler DSN
   * @returns an Oekoboiler properties type
   */
  public async getBoiler(dsn: string): Promise<OekoboilerDevice> {
    const properties = await this.aylaNetworkService.getDeviceProperties(dsn);
    return this.getBoilerFromProperties(properties);
  }

  /**
   * Properties helper function
   *
   * @remarks
   * Returns key:value pair for a specific, named property
   *
   * @param name device property name
   * @param properties device properties
   * @returns device property key:value pair
   */
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

  /**
   * Helper function
   *
   * @remarks
   * folds the raw properties into a Oekboiler device
   *
   * @param properties array of a devices' raw properties
   * @returns an Oekoboiler device
   */
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
