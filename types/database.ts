export type UserRole = 'student' | 'teacher' | 'admin'

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          role: UserRole
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          role: UserRole
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          role?: UserRole
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      students: {
        Row: {
          id: string
          profile_id: string
          grade_level: string | null
          package_name: string | null
          remaining_lessons: number
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          grade_level?: string | null
          package_name?: string | null
          remaining_lessons?: number
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          grade_level?: string | null
          package_name?: string | null
          remaining_lessons?: number
          status?: string
          created_at?: string
        }
        Relationships: []
      }
      teachers: {
        Row: {
          id: string
          profile_id: string
          branch: string | null
          bio: string | null
          experience_years: number | null
          rating: number | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          branch?: string | null
          bio?: string | null
          experience_years?: number | null
          rating?: number | null
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          branch?: string | null
          bio?: string | null
          experience_years?: number | null
          rating?: number | null
          status?: string
          created_at?: string
        }
        Relationships: []
      }
      teacher_assignments: {
        Row: {
          id: string
          student_id: string
          teacher_id: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          teacher_id: string
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          teacher_id?: string
          status?: string
          created_at?: string
        }
        Relationships: []
      }
      lessons: {
        Row: {
          id: string
          student_id: string
          teacher_id: string
          starts_at: string
          ends_at: string
          subject: string | null
          status: 'scheduled' | 'completed' | 'cancelled'
          lesson_notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          teacher_id: string
          starts_at: string
          ends_at: string
          subject?: string | null
          status?: 'scheduled' | 'completed' | 'cancelled'
          lesson_notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          teacher_id?: string
          starts_at?: string
          ends_at?: string
          subject?: string | null
          status?: 'scheduled' | 'completed' | 'cancelled'
          lesson_notes?: string | null
          created_at?: string
        }
        Relationships: []
      }
      lesson_packages: {
        Row: {
          id: string
          student_id: string
          package_name: string
          total_lessons: number
          used_lessons: number
          remaining_lessons: number
          starts_at: string | null
          expires_at: string | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          package_name: string
          total_lessons: number
          used_lessons?: number
          remaining_lessons: number
          starts_at?: string | null
          expires_at?: string | null
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          package_name?: string
          total_lessons?: number
          used_lessons?: number
          remaining_lessons?: number
          starts_at?: string | null
          expires_at?: string | null
          status?: string
          created_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          id: string
          sender_profile_id: string
          receiver_profile_id: string
          lesson_id: string | null
          body: string
          flagged: boolean
          created_at: string
        }
        Insert: {
          id?: string
          sender_profile_id: string
          receiver_profile_id: string
          lesson_id?: string | null
          body: string
          flagged?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          sender_profile_id?: string
          receiver_profile_id?: string
          lesson_id?: string | null
          body?: string
          flagged?: boolean
          created_at?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          id: string
          actor_profile_id: string | null
          action: string
          entity_type: string
          entity_id: string | null
          metadata: Record<string, unknown> | null
          created_at: string
        }
        Insert: {
          id?: string
          actor_profile_id?: string | null
          action: string
          entity_type: string
          entity_id?: string | null
          metadata?: Record<string, unknown> | null
          created_at?: string
        }
        Update: {
          id?: string
          actor_profile_id?: string | null
          action?: string
          entity_type?: string
          entity_id?: string | null
          metadata?: Record<string, unknown> | null
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      public_teacher_cards: {
        Row: {
          id: string
          full_name: string
          avatar_url: string | null
          branch: string | null
          bio: string | null
          experience_years: number | null
          rating: number | null
          status: string
        }
        Relationships: []
      }
    }
    Functions: Record<string, never>
    Enums: {
      user_role: UserRole
    }
  }
}

// Convenience row types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Student = Database['public']['Tables']['students']['Row']
export type Teacher = Database['public']['Tables']['teachers']['Row']
export type TeacherAssignment = Database['public']['Tables']['teacher_assignments']['Row']
export type Lesson = Database['public']['Tables']['lessons']['Row']
export type LessonPackage = Database['public']['Tables']['lesson_packages']['Row']
export type Message = Database['public']['Tables']['messages']['Row']
export type AuditLog = Database['public']['Tables']['audit_logs']['Row']
