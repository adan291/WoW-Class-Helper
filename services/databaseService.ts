import { supabase } from '../lib/supabase.ts';
import type { UserRole } from '../types.ts';

// Profile types
export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
}

// User Guide types
export interface UserGuide {
  id: string;
  user_id: string;
  class_id: string;
  spec_id: string;
  content: string;
  created_at: string;
}

// Favorite types
export interface Favorite {
  id: string;
  user_id: string;
  class_id: string;
  created_at: string;
}

// Profile operations
export const profileService = {
  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    return data;
  },

  async createProfile(userId: string, email: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .insert({ id: userId, email, role: 'user' })
      .select()
      .single();

    if (error) {
      console.error('Error creating profile:', error);
      return null;
    }
    return data;
  },

  async updateRole(userId: string, role: UserRole): Promise<boolean> {
    const { error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId);

    if (error) {
      console.error('Error updating role:', error);
      return false;
    }
    return true;
  },
};

// User Guide operations
export const guideService = {
  async getUserGuides(userId: string): Promise<UserGuide[]> {
    const { data, error } = await supabase
      .from('user_guides')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching guides:', error);
      return [];
    }
    return data || [];
  },

  async saveGuide(
    userId: string,
    classId: string,
    specId: string,
    content: string
  ): Promise<UserGuide | null> {
    const { data, error } = await supabase
      .from('user_guides')
      .insert({ user_id: userId, class_id: classId, spec_id: specId, content })
      .select()
      .single();

    if (error) {
      console.error('Error saving guide:', error);
      return null;
    }
    return data;
  },

  async deleteGuide(guideId: string): Promise<boolean> {
    const { error } = await supabase.from('user_guides').delete().eq('id', guideId);

    if (error) {
      console.error('Error deleting guide:', error);
      return false;
    }
    return true;
  },
};

// Favorite operations
export const favoriteService = {
  async getFavorites(userId: string): Promise<Favorite[]> {
    const { data, error } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching favorites:', error);
      return [];
    }
    return data || [];
  },

  async addFavorite(userId: string, classId: string): Promise<Favorite | null> {
    const { data, error } = await supabase
      .from('favorites')
      .insert({ user_id: userId, class_id: classId })
      .select()
      .single();

    if (error) {
      console.error('Error adding favorite:', error);
      return null;
    }
    return data;
  },

  async removeFavorite(userId: string, classId: string): Promise<boolean> {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('class_id', classId);

    if (error) {
      console.error('Error removing favorite:', error);
      return false;
    }
    return true;
  },

  // Migrate localStorage favorites to database
  async migrateFavorites(userId: string, classIds: string[]): Promise<void> {
    for (const classId of classIds) {
      await this.addFavorite(userId, classId);
    }
  },
};
