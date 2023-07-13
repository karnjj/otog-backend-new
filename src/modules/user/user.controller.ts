import { Controller, Get, Patch, Put, UseGuards } from '@nestjs/common';
import { Role } from 'src/core/constants';
import { Roles } from 'src/core/decorators/roles.decorator';
import { User } from 'src/core/decorators/user.decorator';
import { RolesGuard } from 'src/core/guards/roles.guard';
import { UserService } from './user.service';
import {
  TsRestHandler,
  nestControllerContract,
  tsRestHandler,
} from '@ts-rest/nest';
import { userRouter } from 'src/api';
import { z } from 'zod';
import { UserDTO } from './dto/user.dto';

const c = nestControllerContract(userRouter);

@Controller()
@UseGuards(RolesGuard)
export class UserController {
  constructor(private userService: UserService) {}

  @TsRestHandler(c.getUsers)
  @Roles(Role.Admin)
  @Get()
  getUsers() {
    return tsRestHandler(c.getUsers, async () => {
      const users = await this.userService.findAll();
      return { status: 200, body: users };
    });
  }

  @TsRestHandler(c.getUsers)
  @Get('/online')
  getOnlineUsers() {
    return tsRestHandler(c.getUsers, async () => {
      const users = await this.userService.onlineUser();
      return { status: 200, body: users };
    });
  }

  @TsRestHandler(c.getUserProfile)
  @Get('/:userId/profile')
  getUserProfile() {
    return tsRestHandler(c.getUserProfile, async ({ params: { userId } }) => {
      const id = z.coerce.number().parse(userId);
      const user = await this.userService.getUserProfileById(id);
      if (!user) {
        return { status: 404, body: { message: 'Not Found' } };
      }
      return { status: 200, body: user };
    });
  }

  @TsRestHandler(c.updateUser)
  @Roles(Role.Admin)
  @Put('/:userId')
  updateUser() {
    return tsRestHandler(c.updateUser, async ({ params: { userId }, body }) => {
      const id = z.coerce.number().parse(userId);
      const user = await this.userService.updateUser(id, body);
      return { status: 200, body: user };
    });
  }

  @TsRestHandler(c.updateShowName)
  @Roles(Role.Admin, Role.User)
  @Patch('/:userId/name')
  updateShowName(@User() user: UserDTO) {
    return tsRestHandler(
      c.updateShowName,
      async ({ params: { userId }, body }) => {
        const id = z.coerce.number().parse(userId);
        if (user.role !== Role.Admin && user.id !== id) {
          return { status: 403, body: { message: 'Forbidden' } };
        }
        const showName = await this.userService.updateShowNameById(
          body.showName,
          id,
        );
        return { status: 200, body: showName };
      },
    );
  }
}
