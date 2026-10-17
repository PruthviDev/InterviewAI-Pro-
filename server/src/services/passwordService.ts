import { hash, verify } from '@node-rs/argon2';

export interface PasswordOptions {
  memoryCost: number;
  timeCost: number;
  parallelism: number;
}

// OWASP-recommended Argon2id minimum: 19 MiB, 2 iterations, 1 lane.
const DEFAULTS: PasswordOptions = { memoryCost: 19_456, timeCost: 2, parallelism: 1 };

export class PasswordService {
  constructor(private readonly options: PasswordOptions = DEFAULTS) {}

  hash(password: string): Promise<string> {
    return hash(password, this.options);
  }

  async verify(passwordHash: string, password: string): Promise<boolean> {
    try {
      return await verify(passwordHash, password);
    } catch {
      return false;
    }
  }
}
