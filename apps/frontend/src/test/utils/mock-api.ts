import { vi } from 'vitest';

/**
 * Mock API client for testing
 */
export const mockApiClient = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  patch: vi.fn(),
};

/**
 * Sets up mock API responses
 */
export function setupMockApi() {
  vi.mock('../services/api', () => ({
    apiClient: mockApiClient,
    default: mockApiClient,
  }));
}

/**
 * Resets all API mocks
 */
export function resetMockApi() {
  mockApiClient.get.mockReset();
  mockApiClient.post.mockReset();
  mockApiClient.put.mockReset();
  mockApiClient.delete.mockReset();
  mockApiClient.patch.mockReset();
}

/**
 * Mocks a successful API response
 */
export function mockApiSuccess<T>(data: T, status = 200) {
  return {
    data,
    status,
    statusText: 'OK',
    headers: {},
    config: {} as unknown,
  };
}

/**
 * Mocks an API error response
 */
export function mockApiError(
  message: string,
  status = 500,
  data?: unknown,
) {
  const error = new Error(message) as Error & {
    response?: {
      data: unknown;
      status: number;
      statusText: string;
      headers: Record<string, unknown>;
      config: unknown;
    };
    isAxiosError?: boolean;
  };
  error.response = {
    data: data || { message },
    status,
    statusText: 'Error',
    headers: {},
    config: {} as unknown,
  };
  error.isAxiosError = true;
  return error;
}

/**
 * Mocks axios directly (useful for integration tests)
 */
export function mockAxios() {
  const mockGet = vi.fn();
  const mockPost = vi.fn();
  const mockPut = vi.fn();
  const mockDelete = vi.fn();
  const mockPatch = vi.fn();

  vi.mock('axios', () => ({
    default: {
      create: vi.fn(() => ({
        get: mockGet,
        post: mockPost,
        put: mockPut,
        delete: mockDelete,
        patch: mockPatch,
        interceptors: {
          request: { use: vi.fn(), eject: vi.fn() },
          response: { use: vi.fn(), eject: vi.fn() },
        },
      })),
      get: mockGet,
      post: mockPost,
      put: mockPut,
      delete: mockDelete,
      patch: mockPatch,
    },
  }));

  return {
    mockGet,
    mockPost,
    mockPut,
    mockDelete,
    mockPatch,
  };
}

