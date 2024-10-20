import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/createUserDto';

@Injectable()
export class UserService {
  findOne(id: string) {
    return {
      id,
      name: 'John Doe',
      email: 'john.doe@example.com',
    };
  }

  create(createUserDto: CreateUserDto) {
    return 'User has been created' + createUserDto.name;
  }
}
