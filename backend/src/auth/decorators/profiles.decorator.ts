import { SetMetadata } from '@nestjs/common';
import { Profiles } from 'src/domain/constants/profiles';

export const ProfilesAllowed = (...profiles: Profiles[]) =>
  SetMetadata('profiles', profiles);
