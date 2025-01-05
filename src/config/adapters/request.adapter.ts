import axios, { AxiosInstance, AxiosResponse } from 'axios';

export class RequestHandlerAdapter {
    private client: AxiosInstance;

    constructor(baseUrl: string) {
        this.client = axios.create({
            baseURL: baseUrl,
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    async get<T>(
        url: string,
        params: Record<string, any> = {},
    ): Promise<[any, T | null]> {
        return axios
            .get(url, { params })
            .then((response): [null, T] => [null, response.data])
            .catch((error): [any, null] => [this.handleError(error), null]);
    }

    async post<T>(url: string, data: any): Promise<[any, T | null]> {
        try {
            const response: AxiosResponse<T> = await this.client.post(
                url,
                data,
            );
            return [null, response.data];
        } catch (error) {
            return [this.handleError(error), null];
        }
    }

    async put<T>(url: string, data: any): Promise<[any, T | null]> {
        try {
            const response: AxiosResponse<T> = await this.client.put(url, data);
            return [null, response.data];
        } catch (error) {
            return [this.handleError(error), null];
        }
    }

    async patch<T>(url: string, data: any): Promise<[any, T | null]> {
        try {
            const response: AxiosResponse<T> = await this.client.patch(
                url,
                data,
            );
            return [null, response.data];
        } catch (error) {
            return [this.handleError(error), null];
        }
    }

    async delete<T>(url: string): Promise<[any, T | null]> {
        try {
            const response: AxiosResponse<T> = await this.client.delete(url);
            return [null, response.data];
        } catch (error) {
            return [this.handleError(error), null];
        }
    }

    private handleError(error: any): any {
        if (error.response) {
            return error.response.data;
        } else if (error.request) {
            return {
                message: 'Not response from server',
                request: error.request,
            };
        } else {
            return {
                message: 'Error in request configuration',
                error: error.message,
            };
        }
    }
}
