import { Role } from '@nstrct.me/prisma';
import { PLAN_LEVELS } from '@nstrct.me/subscription-manager';

export interface UserContext {
  id: string;
  email: string;
  name: string;
  role: Role;
  plan?: keyof typeof PLAN_LEVELS;
  refreshToken?: string;
  verificationToken?: string;
  verified: boolean;
}
