import { UserEmail } from "../email/email.types";

export type IUser = {
  id: string;
  name: string;
  birthdate?: Date | null;
  emails?: UserEmail[];
  status?: string;
};

export type IAddUser = Omit<IUser, 'id'>;

export type UserId = IUser['id'];
