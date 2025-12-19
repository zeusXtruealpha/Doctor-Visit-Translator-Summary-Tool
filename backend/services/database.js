const supabase = require('../config/supabase');

class DatabaseService {
  // Test database connection
  async testConnection() {
    try {
      const { data, error } = await supabase
        .from('translations')
        .select('count', { count: 'exact', head: true });
      
      if (error) throw error;
      
      return { success: true, message: 'Database connection successful' };
    } catch (error) {
      console.error('Database connection failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Create a new translation record
  async createTranslation(userId, translationData) {
    try {
      const { data, error } = await supabase
        .from('translations')
        .insert([{
          user_id: userId,
          original_text: translationData.originalText,
          target_language: translationData.targetLanguage,
          condition: translationData.condition,
          medicines: translationData.medicines,
          daily_routine: translationData.dailyRoutine,
          dos: translationData.dos,
          donts: translationData.donts
        }])
        .select()
        .single();

      if (error) throw error;
      
      return { success: true, data };
    } catch (error) {
      console.error('Error creating translation:', error);
      return { success: false, error: error.message };
    }
  }

  // Get user's translation history
  async getUserTranslations(userId, limit = 50, offset = 0) {
    try {
      const { data, error } = await supabase
        .from('translations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching translations:', error);
      return { success: false, error: error.message };
    }
  }

  // Get a specific translation by ID
  async getTranslationById(translationId, userId) {
    try {
      const { data, error } = await supabase
        .from('translations')
        .select('*')
        .eq('id', translationId)
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching translation:', error);
      return { success: false, error: error.message };
    }
  }

  // Delete a translation
  async deleteTranslation(translationId, userId) {
    try {
      const { error } = await supabase
        .from('translations')
        .delete()
        .eq('id', translationId)
        .eq('user_id', userId);

      if (error) throw error;
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting translation:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new DatabaseService();