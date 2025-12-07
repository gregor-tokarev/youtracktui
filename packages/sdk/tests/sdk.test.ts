import { describe, it, expect } from 'bun:test';
import { YouTrackSDK, YouTrackError } from '../index';

describe('YouTrackSDK', () => {
  it('should create an instance with required config', () => {
    const sdk = new YouTrackSDK({
      baseUrl: 'https://test.youtrack.com',
      token: 'test-token',
    });

    expect(sdk).toBeInstanceOf(YouTrackSDK);
    expect(sdk.issues).toBeDefined();
    expect(sdk.projects).toBeDefined();
    expect(sdk.users).toBeDefined();
    expect(sdk.agiles).toBeDefined();
  });

  it('should create an instance with optional config', () => {
    const sdk = new YouTrackSDK({
      baseUrl: 'https://test.youtrack.com',
      token: 'test-token',
      maxRetries: 3,
      timeout: 5000,
    });

    expect(sdk).toBeInstanceOf(YouTrackSDK);
  });

  it('should normalize baseUrl by removing trailing slash', () => {
    const sdk = new YouTrackSDK({
      baseUrl: 'https://test.youtrack.com/',
      token: 'test-token',
    });

    expect(sdk).toBeInstanceOf(YouTrackSDK);
  });
});

describe('YouTrackError', () => {
  it('should create an error with message', () => {
    const error = new YouTrackError('Test error');
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(YouTrackError);
    expect(error.message).toBe('Test error');
    expect(error.name).toBe('YouTrackError');
  });

  it('should create an error with status and statusText', () => {
    const error = new YouTrackError('Not found', 404, 'Not Found');
    expect(error.status).toBe(404);
    expect(error.statusText).toBe('Not Found');
  });

  it('should create an error with response data', () => {
    const responseData = { error: 'Invalid token' };
    const error = new YouTrackError('Unauthorized', 401, 'Unauthorized', responseData);
    expect(error.response).toEqual(responseData);
  });
});

