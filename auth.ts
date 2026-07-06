import NextAuth from "next-auth";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import { estaAutorizado, obtenerRol, type Rol } from "@/lib/roles";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [MicrosoftEntraID],
  session: { strategy: "jwt" },
  pages: { signIn: "/dashboard/ingresar" },
  callbacks: {
    signIn({ profile }) {
      return estaAutorizado(profile?.email);
    },
    jwt({ token }) {
      token.rol = obtenerRol(token.email);
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.rol = (token.rol as Rol | undefined) ?? null;
      }
      return session;
    },
  },
});
