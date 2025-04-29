import { Controller, Get, Put, Delete, Param, Body } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { UpdateUserDto } from '@app/shared/dto/auth.dto';
// import { ResponseUtil } from '@app/shared/utils/response.util';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.userService.findById(id);
    return user;
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const updatedUser = await this.userService.update(id, updateUserDto);
    return updatedUser;
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.userService.delete(id);
  }
}
