import { requireSupabase } from '../lib/supabase';

export const AuthService = {
  async signIn(email: string, password: string): Promise<void> {
    const { error } = await requireSupabase().auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password
    });

    if (error) {
      throw new Error(error.message);
    }
  },

  async signOut(): Promise<void> {
    const { error } = await requireSupabase().auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
  }
};
