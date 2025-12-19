const supabase = require('../config/supabase');

class AuthService {
  // Register a new user
  async register(email, password) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      return { 
        success: true, 
        user: data.user,
        session: data.session 
      };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  // Login user
  async login(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return { 
        success: true, 
        user: data.user,
        session: data.session 
      };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  // Logout user
  async logout() {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  // Get user from session token
  async getUserFromToken(token) {
    try {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (error) throw error;

      return { 
        success: true, 
        user 
      };
    } catch (error) {
      console.error('Token validation error:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  // Refresh session
  async refreshSession(refreshToken) {
    try {
      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: refreshToken
      });

      if (error) throw error;

      return { 
        success: true, 
        session: data.session 
      };
    } catch (error) {
      console.error('Session refresh error:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  }
}

module.exports = new AuthService();