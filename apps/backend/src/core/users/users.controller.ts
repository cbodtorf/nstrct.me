import { Body, Controller, Get, Patch, Query, UseGuards } from '@nestjs/common';
import { Role, User } from '@nstrct.me/prisma';
import { FindAllQueryDto, CountQueryDto } from './dto';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles, UserCtx } from '../../shared/decorators';
import { IPaginationResult, calculateSkip } from '../../shared/utils';
import { UpdateDto } from './dto/update.dto';
import { UserContext } from '../../auth/interfaces/user-context';
import { PROFILE_PICTURE_PREFIX, StorageService } from '../../storage/storage.service';
import { AppLoggerService } from '@nstrct.me/logger';
import { AppConfigService } from '@nstrct.me/config';
import { AuthService } from '../../auth/auth.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller({
  path: 'users',
  version: '1',
})
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly config: AppConfigService,
    private readonly storageService: StorageService,
    private readonly logger: AppLoggerService,
    private readonly authService: AuthService
  ) {}

  @Get()
  @Roles(Role.ADMIN)
  async findAll(@Query() query: FindAllQueryDto): Promise<IPaginationResult<User>> {
    const { page, limit, filter, sort } = query;

    return this.usersService.findAll({
      ...(page && { skip: calculateSkip(page, limit) }), // if page is defined, then calculate skip
      limit,
      filter,
      sort,
    });
  }

  @Get('count')
  @Roles(Role.ADMIN)
  async count(@Query() { startDate, endDate, verified }: CountQueryDto) {
    const filter: Record<string, any> = {};

    if (startDate && endDate) {
      filter.createdAt = { gte: startDate, lte: endDate };
    }

    if (typeof verified === 'boolean') {
      filter.verified = verified;
    }

    // Perform the count operation with the dynamic filter
    const count = await this.usersService.count(filter);

    return { count };
  }

  @Patch('update')
  @Roles(Role.ADMIN, Role.USER)
  async update(@UserCtx() user: UserContext, @Body() { displayName, profilePicture }: UpdateDto) {
    // Update the user's name if 'displayName' is provided
    if (displayName) {
      const updatedUser = await this.usersService.updateById(user.id, { name: displayName });
      user = { ...user, ...updatedUser };
    }

    // Handle profile picture upload if 'profilePicture' is provided
    if (profilePicture && this.config.getConfig().storage.enable) {
      try {
        const base64Data = profilePicture.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        await this.storageService.uploadImage({
          name: `${PROFILE_PICTURE_PREFIX}/${user.id}`,
          file: buffer,
        });
      } catch (error) {
        this.logger.error('Failed to upload profile picture.', error);
      }
    }

    const tokens = await this.authService.generateTokens(user);
    return tokens;
  }
}
