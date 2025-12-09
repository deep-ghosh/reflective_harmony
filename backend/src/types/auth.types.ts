interface user {
  uuid: string;
  id: string;
  userId: string;
  email?: string;
  password: string;
  createdAt?: Date;
}

export type { user };
