import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { AuthToken } from './AuthToken';
import { Device, DeviceProperty } from './types';

export class AylaDeviceApiService {
  private authToken: AuthToken;
  private client: AxiosInstance;

  constructor(email: string, password: string) {
    this.authToken = new AuthToken({ email, password });
    this.client = this.initClient();
  }

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

  public async getDevices(): Promise<Device[]> {
    const result = await this.client.get<Device[]>('devices');
    return result.data;
  }

  public async getDeviceProperties(dsn: string): Promise<DeviceProperty[]> {
    const result = await this.client.get<DeviceProperty[]>(
      `dsns/${dsn}/properties`,
    );

    return result.data;
  }

  public async updateDeviceProperty(key: number, value: unknown) {
    await this.client.post(`properties/${key}/datapoints`, {
      datapoint: { value },
    });
  }
}
