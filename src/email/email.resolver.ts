import {
  Args,
  ID,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { EmailFiltersArgs, EmailIdArgs, IAddEmail, UserEmail } from './email.types';
import { User } from '../user/user.types';
import { EmailService } from './email.service';
import { UserService } from '../user/user.service';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailEntity } from './email.entity';
import { Repository } from 'typeorm';
import { createEmailFilter } from './email.utils';
import { EmailId } from './email.interfaces';
import { ForbiddenException } from '@nestjs/common';

@Resolver(() => UserEmail)
export class EmailResolver {
  constructor(
    private readonly _service: EmailService,
    private readonly _userService: UserService,
    @InjectRepository(EmailEntity)
    private readonly emailRepository: Repository<EmailEntity>
  ) { }

  @Query(() => UserEmail, { name: 'email' })
  getEmail(@Args() { emailId }: EmailIdArgs): Promise<UserEmail> {
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

  @Mutation(() => UserEmail)
  async addEmail(
    @Args('newEmail') newEmail: IAddEmail,
  ): Promise<UserEmail> {
    return this._service.addEmail(newEmail);
  }
  
  @Mutation(() => ID)
  async removeEmail(@Args() { emailId }: EmailIdArgs): Promise<EmailId> {
    return this._service.removeEmail(emailId);
  }

}
