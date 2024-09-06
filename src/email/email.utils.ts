
import { EmailFiltersArgs } from './email.types';
import { Equal, FindOptionsWhere, In } from 'typeorm';
import { EmailEntity } from './email.entity';

// Méthode pour créer un filtre sur les emails et éviter de dupliquer le code dans les resolvers
export function createEmailFilter(filters: EmailFiltersArgs): FindOptionsWhere<EmailEntity> {
    const where: FindOptionsWhere<EmailEntity> = {};

    if (filters.address?.equal) {
      where.address = Equal(filters.address.equal);
    }
  
    if (filters.address?.in?.length > 0) {
      if (filters.address.equal) {
        where.address = In([filters.address.equal, ...filters.address.in]);
      } else {
        where.address = In(filters.address.in);
      }
    }
  
    return where;
}