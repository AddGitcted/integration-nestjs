import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Equal, Repository } from 'typeorm';
import { UserEntity } from './user.entity';
import { IAddUser, IUser, UserId } from './user.interfaces';
import { EmailEntity } from 'src/email/email.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  /**
   * Ajoute un utilisateur
   * @param user Utilisateur à ajouter au système
   */
  async add(user: IAddUser) {
    const addedUser = await this.userRepository.insert({
      ...user,
      status: 'active',
    });
    const userId = addedUser.identifiers[0].id;

    return userId;
  }

  /**
   * Suppression d'un utilisateur (soft delete)
   *
   * @param userId Identifiant de l'utilisateur à désactiver
   * @returns L'identifiant de l'utilisateur désactivé
  */
  async deactivate(userId: UserId) {
    const userExists = await this.userRepository.exist({
      where: { id: Equal(userId) },
    });
    if (!userExists) {
      throw new NotFoundException(`L'utilisateur n'a pas été trouvé`);
    }

    await this.userRepository.update(
      { id: Equal(userId) },
      { status: 'inactive' },
    );

    return userId;
  }

  /**
   * Récupère un utilisateur par rapport à un identifiant
   * @param id Identifiant de l'utilisateur à récupérer
   * @returns L'utilisateur correspondant à l'identifiant ou undefined
  */
  get(id: UserId): Promise<IUser> {
    return this.userRepository.findOneBy({ id: Equal(id) });
  }

  /**
   * Met à jour les adresse emails de l'utilisateur
   * @param id Identifiant de l'utilisateur
  */
  async updateUserEmails(id: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: id }, relations: ['emails'] });
    
    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'id ${id} non trouvé`);
    }
  
    await this.userRepository.save(user);
  }

  /**
   * Récupère un utilisateur avec la liste de ses adresse emails
   * @param id Identifiant de l'utilisateur à récupérer
   * @returns L'utilisateur correspondant à l'identifiant ou undefined
  */
  async getUserWithEmails(userId: string): Promise<UserEntity> {
    return this.userRepository.findOne({
      where: { id: userId },
      relations: ['emails'],
    });
  }
}
