// Inspired by https://github.com/shawnjung/homebridge-plugin-dimplex-connex
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { AuthToken } from './AuthToken';
import { Device, DeviceProperty } from './types';

export class AylaDeviceApiService {
  private authToken: AuthToken;
  private client: AxiosInstance;

  /**
   * Ayla Networks API class
   *
   * implements AylaNetworks client, connects
   * to the AylaNetwork Services (EU)
   *
   * @param email: your Ayla Networks User username
   * @param password: your Ayla Networks User password
   */

  constructor(email: string, password: string) {
    this.authToken = new AuthToken({ email, password });
    this.client = this.initClient();
  }

  /**
   * Initializes the Api Client
   *
   * @returns an Axios Instance configured for the API endpoint
   */
  private initClient(): AxiosInstance {
    const instance: AxiosInstance = axios.create({
      baseURL: 'https://ads-eu.aylanetworks.com/apiv1/',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        Accept: 'application/json',
      },
    });

    instance.interceptors.request.use(async (request: AxiosRequestConfig) => {
      if (!this.authToken.active) {
        await this.authToken.init();
      } else if (this.authToken.expired) {
        await this.authToken.refresh();
      }

      if (request.headers) {
        request.headers.Authorization = `auth_token ${this.authToken.getValue()}`;
      }
      return request;
    });

    return instance;
  }

  /**
   * Get all Oekoboiler Devices registered with the current user
   *
   * @returns a list of Oekboiler Devices
   */
  public async getDevices(): Promise<Device[]> {
    const result = await this.client.get<Device[]>('devices');
    return result.data;
  }

  /**
   * Get all Oekoboiler Devices registered with the current user
   *
   * @param dsn: The DSN of the Oekoboiler Device.
   *                      Can be found by iterating over the device list
   *                      returned by {@link getDevices()}
   * @returns a list of Oekboiler Device
   *              Properties (see types.ts for the relevant fields)
   */
  public async getDeviceProperties(dsn: string): Promise<DeviceProperty[]> {
    const result = await this.client.get<DeviceProperty[]>(
      `dsns/${dsn}/properties`,
    );

    return result.data;
  }

  /**
   * Update a specific device property See {@link Device}, {@link DeviceProperty} for details
   *
   * @param key the property key
   * @param value the property value
   */
  public async updateDeviceProperty(key: number, value: unknown) {
    await this.client.post(`properties/${key}/datapoints`, {
      datapoint: { value },
    });
  }
}
