import type { DefaultSession } from "next-auth";
import type { Rol } from "@/lib/roles";

declare module "next-auth" {
  interface Session {
    user: {
      rol: Rol | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    rol?: Rol | null;
  }
}
