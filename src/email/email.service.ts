import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Equal, Repository } from 'typeorm';

import { EmailEntity } from './email.entity';
import { EmailId } from './email.interfaces';
import { UserEmail } from './email.types';

@Injectable()
export class EmailService {
  constructor(
    @InjectRepository(EmailEntity)
    private readonly emailRepository: Repository<EmailEntity>
  ) {}

  /**
   * Récupère un email par rapport à un identifiant
   * @param id Identifiant de l'email à récupérer
   * @returns L'email correspondant à l'identifiant ou undefined
   */
  get(id: EmailId): Promise<UserEmail> {
    return this.emailRepository.findOneBy({ id: Equal(id) });
  }
}