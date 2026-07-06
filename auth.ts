import NextAuth from "next-auth";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";

const DOMINIO_PERMITIDO = "@pertec.cl";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [MicrosoftEntraID],
  session: { strategy: "jwt" },
  pages: { signIn: "/dashboard/ingresar" },
  callbacks: {
    signIn({ profile }) {
      const correo = (profile?.email ?? "").toLowerCase();
      return correo.endsWith(DOMINIO_PERMITIDO);
    },
    session({ session }) {
      return session;
    },
  },
});
