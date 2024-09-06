import {
  Args,
  ID,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { EmailFiltersArgs, UserEmail } from './email.types';
import { User } from '../user/user.types';
import { EmailService } from './email.service';
import { UserService } from '../user/user.service';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailEntity } from './email.entity';
import { Repository } from 'typeorm';
import { createEmailFilter } from './email.utils';

@Resolver(() => UserEmail)
export class EmailResolver {
  constructor(
    private readonly _service: EmailService,
    private readonly _userService: UserService,
    @InjectRepository(EmailEntity)
    private readonly emailRepository: Repository<EmailEntity>
  ) { }

  @Query(() => UserEmail, { name: 'email' })
  getEmail(@Args({ name: 'emailId', type: () => ID }) emailId: string) {
    return this._service.get(emailId);
  }

  @Query(() => [UserEmail], { name: 'emailsList' })
  async getEmails(@Args() filters: EmailFiltersArgs): Promise<UserEmail[]> {
    const where = createEmailFilter(filters);
  
     return this.emailRepository.find({
      where,
      order: { address: 'asc' },
    });
  }
  
  @ResolveField(() => User, { name: 'user' })
  async getUser(@Parent() parent: UserEmail): Promise<User> {
    return this._userService.get(parent.userId);
  }
}
