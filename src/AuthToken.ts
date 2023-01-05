// Inspired by https://github.com/shawnjung/homebridge-plugin-dimplex-connex
import { DateTime } from 'luxon';
import axios, { AxiosInstance } from 'axios';

// Pulled from traffic between the devices,
// the app and the services
const APP_ID = 'Ob-Ng-id';
const APP_SECRET = 'Ob-Y1Ngeac9TzrS0fIfDo6u-wAgWDs';

interface AuthInformation {
  email: string;
  password: string;
}

interface AuthResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export class AuthToken {
  private value = '';
  private refreshToken = '';
  private expiryAt: DateTime;
  private client: AxiosInstance;

  constructor(private authInfo: AuthInformation) {
    this.expiryAt = DateTime.local();
    this.client = axios.create({
      baseURL: 'https://user-field-eu.aylanetworks.com/users',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  }

  get active(): boolean {
    return Boolean(this.value);
  }

  get expired(): boolean {
    return this.expiryAt < DateTime.local();
  }

  public getValue(): string {
    return this.value;
  }

  public async refresh(): Promise<void> {
    const body = {
      user: {
        refresh_token: this.refreshToken,
      },
    };
    const headers = {
      Authorization: `auth_token ${this.value}`,
    };

    const { data }: { data: AuthResponse } = await this.client.post(
      'refresh_token.json',
      body,
      { headers },
    );

    this.refreshAttributes(data);
  }

  public async init(): Promise<void> {
    const body = {
      user: {
        application: {
          app_id: APP_ID,
          app_secret: APP_SECRET,
        },
        ...this.authInfo,
      },
    };
    const { data }: { data: AuthResponse } = await this.client.post(
      'sign_in.json',
      body,
    );

    this.refreshAttributes(data);
  }

  private refreshAttributes(data: AuthResponse): void {
    this.value = data.access_token;
    this.refreshToken = data.refresh_token;
    this.expiryAt = DateTime.local().plus({ seconds: data.expires_in - 3600 });
  }
}
