import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Equal, Repository } from 'typeorm';

import { EmailEntity } from './email.entity';
import { EmailId } from './email.interfaces';
import { IAddEmail, UserEmail } from './email.types';
import { UserService } from '../user/user.service';

@Injectable()
export class EmailService {
  constructor(
    @InjectRepository(EmailEntity)
    private readonly emailRepository: Repository<EmailEntity>,
    private readonly userService: UserService
  ) { }

  /**
   * Récupère un email par rapport à un identifiant
   * @param id Identifiant de l'email à récupérer
   * @returns L'email correspondant à l'identifiant ou undefined
  */
  get(id: EmailId): Promise<UserEmail> {
    return this.emailRepository.findOneBy({ id: Equal(id) });
  }

  /**
   * Ajoute un email à un utilisateur
   * @param newEmail Email à ajouter
   * @returns L'email ajouté
  */
  async addEmail(newEmail: IAddEmail): Promise<UserEmail> {
    const user = await this.userService.get(newEmail.userId);
  
    if (user.status === 'inactive') {
      throw new ForbiddenException(
        `Impossible d'ajouter un e-mail à un utilisateur inactif`,
      );
    }
  
    const userEmail = this.emailRepository.create(newEmail);
    const savedUserEmail = await this.emailRepository.save(userEmail);
  
    if (!user.emails) {
      user.emails = [];
    }
    user.emails.push(savedUserEmail);
  
    await this.userService.updateUserEmails(user.id);
  
    return savedUserEmail;
  }
  
  
  /**
   * Supprime un email d'un utilisateur
   * @param emailId Identifiant de l'email à supprimer
   * @returns L'identifiant de l'email supprimé
   */
  async removeEmail(emailId: EmailId): Promise<EmailId> {
    const email = await this.get(emailId);
    if (!email) {
      throw new NotFoundException(`L'e-mail avec l'identifiant ${emailId} n'existe pas`);
    }
  
    const user = await this.userService.getUserWithEmails(email.userId);
  
    if (user.status === 'inactive') {
      throw new ForbiddenException(
        `Impossible de supprimer un e-mail d'un utilisateur inactif`,
      );
    }
  
    user.emails = user.emails.filter(e => e.id !== emailId);
  
    await this.userService.updateUserEmails(user.id);
  
    await this.emailRepository.delete(emailId);
  
    return emailId;
  }
  
}