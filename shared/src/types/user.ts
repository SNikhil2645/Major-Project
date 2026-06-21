export enum UserRole {
  Student = 'student',
  Admin = 'admin',
}

export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  isVerified: boolean;
  avatar?: string;
  profile: {
    education?: string;
    skills?: string[];
    links?: {
      github?: string;
      linkedin?: string;
      portfolio?: string;
    };
    bio?: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IUserPublic extends Omit<IUser, 'password'> {}
