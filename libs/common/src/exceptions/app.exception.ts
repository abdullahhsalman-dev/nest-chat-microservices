export class AppException extends Error {
  constructor(
    message: string,
    public readonly code?: string,
  ) {
    super(message);
    this.name = 'AppException';

    // This fixes inheritance chain issues in TypeScript
    Object.setPrototypeOf(this, AppException.prototype);
  }
}

// You can also create specific error types
export class AuthException extends AppException {
  constructor(message: string, code?: string) {
    super(message, code || 'AUTH_ERROR');
    this.name = 'AuthException';

    Object.setPrototypeOf(this, AuthException.prototype);
  }
}

export class DatabaseException extends AppException {
  constructor(message: string, code?: string) {
    super(message, code || 'DB_ERROR');
    this.name = 'DatabaseException';

    Object.setPrototypeOf(this, DatabaseException.prototype);
  }
}
