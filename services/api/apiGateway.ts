import { apiDispatcher, APIRequest, APIResponse } from './apiDispatcher';
import { tokenService } from './tokenService';
import { gitService } from '../gitService';

/**
 * Initializes the virtual API layer.
 */
export const initAPIGateway = (getContext: () => any) => {
  // GET /v1/projects
  apiDispatcher.register('GET', '/v1/projects', async (req) => {
    if (!validateAuth(req)) return unauthorized();
    const history = await gitService.log();
    return { status: 200, body: history };
  });

  // GET /v1/inventory
  apiDispatcher.register('GET', '/v1/inventory', async (req) => {
    if (!validateAuth(req)) return unauthorized();
    const { inventory } = getContext();
    return { status: 200, body: inventory };
  });

  // POST /v1/actions
  apiDispatcher.register('POST', '/v1/actions', async (req) => {
    const token = validateAuth(req);
    if (!token) return unauthorized();
    
    // External tools can only trigger safe actions if not admin
    const { executeAction } = getContext();
    const result = await executeAction(req.body, false);
    
    return { status: result.success ? 200 : 400, body: result };
  });
};

const validateAuth = (req: APIRequest) => {
  const authHeader = req.headers['Authorization'] || '';
  const secret = authHeader.replace('Bearer ', '');
  return tokenService.validateToken(secret);
};

const unauthorized = (): APIResponse => ({
  status: 401,
  body: { error: 'Unauthorized: Invalid or missing API Token' }
});
