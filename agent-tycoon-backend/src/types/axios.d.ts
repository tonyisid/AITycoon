declare module 'axios' {
  export interface AxiosInstance {
    get<T = any>(url: string, config?: any): Promise<any>;
    post<T = any>(url: string, data?: any, config?: any): Promise<any>;
    put<T = any>(url: string, data?: any, config?: any): Promise<any>;
    delete<T = any>(url: string, config?: any): Promise<any>;
  }
}
