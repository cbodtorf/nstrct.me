import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AppConfigService } from '@nstrct.me/config';
import { Prisma, PrismaService, ProviderType, Role } from '@nstrct.me/prisma';
import * as bcrypt from 'bcryptjs';
import { SignupDto } from './dto/signup.dto';
import { UserContext } from './interfaces/user-context';
import { PROFILE_PICTURE_PREFIX, StorageService } from '../storage/storage.service';
import { BillingService } from '../billing/billing.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly storageService: StorageService,
    private readonly appConfigService: AppConfigService,
    private readonly billingService: BillingService
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
      include: {
        subscription: true,
      },
    });
    if (!user) {
      return null;
    }

    const verified = await bcrypt.compare(password, user.password);
    if (verified) {
      const { ...result } = user;
      return {
        ...result,
        plan: user.subscription?.plan || 'FREE',
      };
    }

    return null;
  }

  async login(user: UserContext) {
    return this.generateTokens(user);
  }

  async signup(signupDto: SignupDto): Promise<UserContext> {
    const hash = await bcrypt.hash(signupDto.password, 10);

    const userInformation = {
      name: signupDto.name,
      email: signupDto.email,
    };

    const createOptions = {
      data: {
        ...userInformation,
        password: hash,
        role: Role.USER,
      },
      select: {
        id: true,
        email: true,
        name: true,
        refreshToken: true,
        role: true,
        verificationToken: true,
        verified: true,
      },
    };

    if (signupDto.provider) {
      const authProviders: Prisma.AuthProviderCreateManyUserInput = {
        providerId: signupDto.password, // We use the password field to store the providerId
        provider: signupDto.provider,
      };

      createOptions.data['authProviders'] = {
        create: authProviders,
      };

      // If the user is created with a provider, we set the user as verified
      createOptions.data['verified'] = true;
    } else {
      // If the user is not created with a provider, we create a verification token
      createOptions.data['verificationToken'] = this.jwtService.sign(userInformation, {
        expiresIn: '1d',
      });
    }

    createOptions.data['usage'] = {
      create: {
        linksCount: 0,
        clicksCount: 0,
      },
    };

    const createdUser = await this.prisma.user.create(createOptions);
    return createdUser;
  }

  async verify(user: UserContext): Promise<{ verified: boolean }> {
    const fetchedUser = await this.prisma.user.findUnique({
      where: {
        email: user.email,
      },
    });
    if (!fetchedUser || !fetchedUser.verificationToken) {
      throw new UnauthorizedException();
    }

    const updatedUser = await this.prisma.user.update({
      where: { email: user.email },
      data: {
        verified: true,
        verificationToken: null,
      },
    });

    return { verified: updatedUser.verified };
  }

  async checkVerification({ id }: UserContext) {
    const fetchedUser = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!fetchedUser) {
      throw new UnauthorizedException();
    }

    return { verified: fetchedUser.verified };
  }

  async refreshTokens(user: UserContext) {
    return this.generateTokens(user);
  }

  async validateRefreshToken(userId: string, refreshToken: string): Promise<any> {
    if (!refreshToken) {
      return false;
    }

    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return null;
    }

    const verified = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!verified) {
      return null;
    }

    return user;
  }

  async generateTokens(user: UserContext): Promise<{ accessToken: string; refreshToken: string }> {
    const tokens = {
      accessToken: this.generateToken(user),
      refreshToken: this.generateToken(user, '7d', this.appConfigService.getConfig().auth.jwt.refreshSecret),
    };

    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        refreshToken: await bcrypt.hash(tokens.refreshToken, 10),
      },
    });

    return tokens;
  }

  generateToken(user: UserContext, expiresIn?: string, secret?: string) {
    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      plan: user.plan || 'FREE',
      verified: user.verified,
      iss: 'nstrct.me',
    };

    return this.jwtService.sign(payload, {
      ...(expiresIn && { expiresIn }),
      ...(secret && { secret }),
    });
  }

  async delete(userCtx: UserContext) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userCtx.id,
      },
      include: {
        subscription: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const promises: any[] = [this.storageService.delete(`${PROFILE_PICTURE_PREFIX}/${user.id}`)];

    if (user.subscription) {
      promises.push(this.billingService.cancelSubscription(user.id));
    }

    try {
      await Promise.all(promises);
    } catch (error) {
      // Ignore error
    }

    return this.prisma.user.delete({
      where: {
        id: user.id,
      },
      include: {
        authProviders: true,
        links: true,
      },
    });
  }
}
