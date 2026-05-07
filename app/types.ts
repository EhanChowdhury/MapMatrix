export interface Job {
  id: string;
  name: string;
  date: string;
  status: string;
  data: {
    keywords?: string[];
    lang?: string;
    zoom?: number;
    lat?: string;
    lon?: string;
    fast_mode?: boolean;
    radius?: number;
    depth?: number;
    email?: boolean;
    max_time?: number;
    proxies?: string[];
    [key: string]: unknown;
  };
}
