import { DefaultSession } from 'next-auth';

export type Membership = {
  projectId: string;
  role: 'admin' | 'member';
};

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      memberships: Membership[];
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    memberships: Membership[];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    memberships: Membership[];
  }
}
