export interface Database {
  public: {
    Tables: {
      leads: {
        Row: {
          id: string;
          created_at: string;
          name: string;
          email: string;
          phone: string;
          address: string;
          is_active: boolean;
          status: 'Open' | 'Close' | 'Pending';
          last_followup_remarks: string | null;
          next_steps: string | null;
          priority: 'high' | 'normal' | 'low';
          target_type: 'Target' | 'Non-Target';
          user_id: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          name: string;
          email: string;
          phone: string;
          address: string;
          is_active?: boolean;
          status?: 'Open' | 'Close' | 'Pending';
          last_followup_remarks?: string | null;
          next_steps?: string | null;
          priority?: 'high' | 'normal' | 'low';
          target_type?: 'Target' | 'Non-Target';
          user_id: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          name?: string;
          email?: string;
          phone?: string;
          address?: string;
          is_active?: boolean;
          status?: 'Open' | 'Close' | 'Pending';
          last_followup_remarks?: string | null;
          next_steps?: string | null;
          priority?: 'high' | 'normal' | 'low';
          target_type?: 'Target' | 'Non-Target';
          user_id?: string;
        };
      };
    };
    Functions: {};
    Enums: {};
  };
  auth: {
    Tables: {};
    Functions: {};
    Enums: {};
  };
}

export type Lead = Database['public']['Tables']['leads']['Row'];
export type NewLead = Database['public']['Tables']['leads']['Insert'];
export type UpdateLead = Database['public']['Tables']['leads']['Update'];