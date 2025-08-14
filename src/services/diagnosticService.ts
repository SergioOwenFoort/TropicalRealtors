import { supabase } from '../config/supabase.config';

export class DiagnosticService {
  private static instance: DiagnosticService;

  private constructor() {}

  public static getInstance(): DiagnosticService {
    if (!DiagnosticService.instance) {
      DiagnosticService.instance = new DiagnosticService();
    }
    return DiagnosticService.instance;
  }

  /**
   * Test the Supabase connection and report any issues
   */
  async testSupabaseConnection(): Promise<{
    success: boolean;
    message: string;
    details?: any;
  }> {
    try {
      console.log('Testing Supabase connection...');
      
      // Test basic query
      const { data: profileCount, error: countError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);

      if (countError) {
        console.error('Failed to count profiles:', countError);
        return {
          success: false,
          message: 'Failed to connect to the profiles table',
          details: countError
        };
      }

      // Test auth
      const { data: authData, error: authError } = await supabase.auth.getSession();
      if (authError) {
        console.error('Failed to get auth session:', authError);
        return {
          success: false,
          message: 'Failed to connect to the authentication service',
          details: authError
        };
      }

      // All tests passed
      return {
        success: true,
        message: 'Supabase connection is working correctly',
        details: {
          profiles: profileCount,
          auth: !!authData.session
        }
      };
    } catch (error) {
      console.error('Supabase connection test failed:', error);
      return {
        success: false,
        message: 'Unexpected error testing Supabase connection',
        details: error
      };
    }
  }

  /**
   * Check if the database schema is properly set up
   */
  async checkDatabaseSchema(): Promise<{
    success: boolean;
    message: string;
    tables: {[key: string]: boolean};
  }> {
    try {
      const tables = {
        profiles: false,
        properties: false,
      };
      
      // Check profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
      
      if (!profileError) {
        tables.profiles = true;
      }

      // Check properties table
      const { data: propertyData, error: propertyError } = await supabase
        .from('properties')
        .select('id')
        .limit(1);
      
      if (!propertyError) {
        tables.properties = true;
      }

      const success = Object.values(tables).every(val => val);
      
      return {
        success,
        message: success 
          ? 'Database schema is correctly configured' 
          : 'Some required tables are missing',
        tables
      };
    } catch (error) {
      console.error('Database schema check failed:', error);
      return {
        success: false,
        message: 'Failed to check database schema',
        tables: {}
      };
    }
  }
}

export const diagnosticService = DiagnosticService.getInstance();
