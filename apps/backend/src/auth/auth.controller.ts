import { Body, Controller, Get, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { AppConfigService } from '@nstrct.me/config';
import { NovuService } from '../novu/novu.service';
import { Plan, PrismaService, Subscription } from '@nstrct.me/prisma';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh.guard';
import { JwtAuthGuard } from './guards/jwt.guard';
import { LocalAuthGuard } from './guards/local.guard';
import { VerifyAuthGuard } from './guards/verify.guard';
import { UserContext } from './interfaces/user-context';
import { setAuthCookies } from './utils/cookies';
import { UserCtx } from '../shared/decorators';

@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly authService: AuthService,
    private readonly novuService: NovuService,
    private readonly appConfigService: AppConfigService
  ) {}

  cookieOptions = {
    path: '/',
    sameSite: 'lax',
    httpOnly: true,
  } as any;

  @UseGuards(LocalAuthGuard)
  @Post('/login')
  async login(@Req() req: Request, @Res() res: Response) {
    const tokens = await this.authService.login(req.user as UserContext);
    res = setAuthCookies(res, this.appConfigService.getConfig().front.domain, tokens);

    res.send(tokens);
  }

  @Post('/signup')
  async signup(@Res() res: Response, @Body() signupDto: SignupDto) {
    const user = await this.authService.signup(signupDto);

    if (this.appConfigService.getConfig().general.env === 'production') {
      await this.novuService.sendVerificationEmail(user);
    }

    const tokens = await this.authService.login(user);
    res = setAuthCookies(res, this.appConfigService.getConfig().front.domain, tokens);

    res.send(tokens);
  }

  @UseGuards(JwtRefreshAuthGuard)
  @Post('/refresh')
  async refresh(@Req() req: Request, @Res() res: Response) {
    const userContext = req.user as UserContext;
    let subscription: Subscription;
    try {
      subscription = await this.prismaService.subscription.findFirst({
        where: {
          userId: userContext.id,
        },
      });
    } catch (e) {
      console.error(e);
    }
    const newContext = { ...userContext, plan: subscription?.plan || Plan.FREE };
    const tokens = await this.authService.refreshTokens(newContext);
    res = setAuthCookies(res, this.appConfigService.getConfig().front.domain, tokens);

    res.send(tokens);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/check-auth')
  checkAuth(@Req() req: Request) {
    return { user: req.user };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/resend')
  async resendVerification(@Req() req: Request) {
    const reqUser = req.user as UserContext;
    const user = await this.prismaService.user.findUnique({
      where: {
        id: reqUser.id,
      },
    });
    return this.novuService.sendVerificationEmail(user);
  }

  @UseGuards(VerifyAuthGuard)
  @Get('/verify')
  async verify(@Req() req: Request, @Res() res: Response) {
    const verificationData = await this.authService.verify(req.user as UserContext);

    if (!verificationData.verified) {
      throw new UnauthorizedException();
    }

    const user = await this.prismaService.user.findUnique({
      where: {
        email: (req.user as UserContext).email,
      },
    });

    const tokens = await this.authService.generateTokens(user);
    res = setAuthCookies(res, this.appConfigService.getConfig().front.domain, tokens);

    res.send(verificationData);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/verified')
  async verified(@Req() req: Request) {
    return this.authService.checkVerification(req.user as UserContext);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/delete')
  async delete(@UserCtx() user: UserContext) {
    return this.authService.delete(user);
  }
}
