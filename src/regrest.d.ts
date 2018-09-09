declare namespace Regrest {
  export interface IConfig {
    method?: string;
    url?: string;
    headers?: { [key: string]: string };
    params?: { [key: string]: any };
    data?: any | null;
    maxRedirects?: number;
  }

  export interface IConfigWithUrl extends IConfig {
    url: string;
  }

  export interface IResponse {
    status: number;
    statusText: string;
    headers: { [key: string]: string };
    text: string;
    json: () => any;
  }

  export interface INetworkError extends Error {
    name: string;
    response: IResponse;
    request: boolean;
    stack: string;
  }

  export interface IRegrest {
    request(config: IConfigWithUrl): Promise<IResponse>;
    get(url: string, config?: IConfig): Promise<IResponse>;
    delete(url: string, config?: IConfig): Promise<IResponse>;
    head(url: string, config?: IConfig): Promise<IResponse>;
    options(url: string, config?: IConfig): Promise<IResponse>;
    post(url: string, data?: any, config?: IConfig): Promise<IResponse>;
    put(url: string, data?: any, config?: IConfig): Promise<IResponse>;
    patch(url: string, data?: any, config?: IConfig): Promise<IResponse>;
  }
}

declare const Regrest: Regrest.IRegrest;

export default Regrest;
