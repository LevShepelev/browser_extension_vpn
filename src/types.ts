export type ProxyScheme = 'http' | 'https' | 'socks4' | 'socks5';

export interface ProxyConfig {
  host: string;
  port: number;
  scheme: ProxyScheme;
  username?: string;
  password?: string;
  bypassList: string[];
}

export interface ExtensionState {
  enabled: boolean;
  config: ProxyConfig;
}

export const DEFAULT_STATE: ExtensionState = {
  enabled: false,
  config: {
    host: '',
    port: 1080,
    scheme: 'socks5',
    username: '',
    password: '',
    bypassList: ['localhost', '127.0.0.1']
  }
};
