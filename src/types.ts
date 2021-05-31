import type { Regrest } from "./Regrest";

export type RequestBody = any | Document | BodyInit | null;

export type Options = {
  method?: string;
  url?: string;
  headers?: { [key: string]: string };
  params?: { [key: string]: any };
  data?: RequestBody;

  /**
   * Maximum redirects before error is thrown
   */
  maxRedirects?: number;

  /**
   * Whether cross-site Access-Control requests should be made using credentials
   */
  withCredentials?: boolean;
};

export type OptionsWithUrl = Options & {
  url: string;
};

export type Response = {
  status: number;
  statusText: string;
  headers: { [key: string]: string | string[] | undefined };
  text: string;
  json: any;

  /**
   * The response as an Blob on browser or Buffer on Node js
   */
  arrayBuffer: any;
  blob: any;
};

export type Adapter = {
  (
    this: Regrest,
    method: string,
    url: string,
    data: RequestBody,
    headers: Record<string, string>,
    maxRedirects: number,
    withCredentials: boolean
  ): Promise<Response>;
};

export enum Environment {
  browser,
  node,
  unknown,
}
