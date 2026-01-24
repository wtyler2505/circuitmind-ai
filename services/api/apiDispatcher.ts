import { ActionIntent } from '../../types';

export interface APIRequest {
  method: 'GET' | 'POST' | 'DELETE' | 'PUT';
  path: string;
  body?: any;
  headers: Record<string, string>;
}

export interface APIResponse {
  status: number;
  body: any;
}

class APIDispatcher {
  private handlers: Map<string, (req: APIRequest) => Promise<APIResponse>> = new Map();

  /**
   * Dispatches a virtual API request to the correct handler.
   */
  async dispatch(req: APIRequest): Promise<APIResponse> {
    const handler = this.handlers.get(`${req.method} ${req.path}`);
    if (handler) {
      return await handler(req);
    }
    return { status: 404, body: { error: 'Not Found' } };
  }

  /**
   * Registers a handler for a specific path.
   */
  register(method: APIRequest['method'], path: string, handler: (req: APIRequest) => Promise<APIResponse>) {
    this.handlers.set(`${method} ${path}`, handler);
  }
}

export const apiDispatcher = new APIDispatcher();
