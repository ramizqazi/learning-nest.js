import { Injectable } from '@nestjs/common';

@Injectable()
export class CommentService {
  findUserComments(userId) {
    return `Comments of user ${userId}`;
  }
}
