import NextAuth from "next-auth";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import { estaAutorizado, obtenerRol, type Rol } from "@/lib/roles";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [MicrosoftEntraID],
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  pages: { signIn: "/dashboard/ingresar" },
  callbacks: {
    async signIn({ profile }) {
      return await estaAutorizado(profile?.email);
    },
    async jwt({ token, trigger }) {
      // Solo consultamos SharePoint al iniciar sesión, no en cada request:
      // así un cambio de acceso se aplica la próxima vez que la persona entre.
      if (trigger === "signIn") {
        token.rol = await obtenerRol(token.email);
      }
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
