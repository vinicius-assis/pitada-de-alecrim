import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: "ADMIN" | "GARCOM";
    };
  }

  interface User {
    role: "ADMIN" | "GARCOM";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: "ADMIN" | "GARCOM";
  }
}

