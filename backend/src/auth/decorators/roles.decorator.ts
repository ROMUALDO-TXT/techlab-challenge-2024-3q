import { SetMetadata } from '@nestjs/common';

export const Permissions = (...scopes: string[]) =>
  SetMetadata('scopes', scopes);
