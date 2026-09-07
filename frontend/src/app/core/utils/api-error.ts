import { HttpErrorResponse } from '@angular/common/http';

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (!(error instanceof HttpErrorResponse)) {
    return fallback;
  }

  if (error.status === 0) {
    return 'Could not reach the API. Make sure the backend is running on http://localhost:5090.';
  }

  const fromBody = extractSafeMessage(error.error);
  if (fromBody) {
    return fromBody;
  }

  if (error.status === 401) {
    return 'Invalid username or password.';
  }

  if (error.status === 403) {
    return 'You do not have permission to perform this action.';
  }

  if (error.status === 404) {
    return 'The requested resource was not found.';
  }

  if (error.status === 409) {
    return 'Username is already taken.';
  }

  return fallback;
}

function extractSafeMessage(body: unknown): string | null {
  // Ignore raw string bodies (HTML error pages, stack traces, etc.).
  if (!body || typeof body !== 'object') {
    return null;
  }

  const record = body as Record<string, unknown>;
  const message = record['message'];
  const errors = record['errors'];
  const title = record['title'];

  if (typeof message === 'string' && message.trim()) {
    return sanitizeClientMessage(message.trim());
  }

  if (errors && typeof errors === 'object') {
    const messages = Object.values(errors as Record<string, unknown>)
      .flatMap((value) => (Array.isArray(value) ? value : [value]))
      .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
      .map((value) => value.trim());

    if (messages.length > 0) {
      return sanitizeClientMessage(messages.join(' '));
    }
  }

  if (typeof title === 'string' && title.trim()) {
    return sanitizeClientMessage(title.trim());
  }

  return null;
}

/** Drop messages that look like they contain secrets; never echo passwords/tokens. */
function sanitizeClientMessage(message: string): string | null {
  if (
    /password\s*[:=]|bearer\s+[a-z0-9._\-]+|eyJ[a-zA-Z0-9_\-]+\.[a-zA-Z0-9_\-]+/i.test(
      message,
    )
  ) {
    return null;
  }

  return message;
}
