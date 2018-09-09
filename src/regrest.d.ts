interface IConfig {
  method?: string;
  url?: string;
  headers?: { [key: string]: string };
  params?: { [key: string]: any };
  data?: any | null;
  maxRedirects?: number;
}

interface IConfigWithUrl {
  url: string;
}

interface IResponse {
  status: number;
  statusText: string;
  headers: { [key: string]: string };
  text: string;
  json: () => any;
}

interface INetworkError extends Error {
  name: string;
  response: IResponse;
  request: boolean;
  stack: string;
}

interface IRegrest {
  request(config: IConfig & IConfigWithUrl): Promise<IResponse>;
  get(url: string, config?: IConfig): Promise<IResponse>;
  delete(url: string, config?: IConfig): Promise<IResponse>;
  head(url: string, config?: IConfig): Promise<IResponse>;
  options(url: string, config?: IConfig): Promise<IResponse>;
  post(url: string, data?: any, config?: IConfig): Promise<IResponse>;
  put(url: string, data?: any, config?: IConfig): Promise<IResponse>;
  patch(url: string, data?: any, config?: IConfig): Promise<IResponse>;
}

declare namespace Regrest {
  type NetworkError = INetworkError;
}

declare const Regrest: IRegrest;

export = Regrest;
