export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          role: 'user' | 'admin'
          email: string | null
          full_name: string | null
          child_name: string | null
          age: number | null
          city: string | null
          phone: string | null
          consent_terms: boolean
          consent_privacy: boolean
          consent_personal_data: boolean
          consent_given_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          role?: 'user' | 'admin'
          email?: string | null
          full_name?: string | null
          child_name?: string | null
          age?: number | null
          city?: string | null
          phone?: string | null
          consent_terms?: boolean
          consent_privacy?: boolean
          consent_personal_data?: boolean
          consent_given_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role?: 'user' | 'admin'
          email?: string | null
          full_name?: string | null
          child_name?: string | null
          age?: number | null
          city?: string | null
          phone?: string | null
          consent_terms?: boolean
          consent_privacy?: boolean
          consent_personal_data?: boolean
          consent_given_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      contests: {
        Row: {
          id: string
          title: string
          description: string
          cover_url: string | null
          start_date: string
          end_date: string
          status: 'active' | 'upcoming' | 'finished'
          audiences: string[]
          submission_email: string | null
          phase: 'draft' | 'active' | 'closed' | 'results' | null
          results_published: boolean | null
          results_date: string | null
          results_text: string | null
          created_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          title: string
          description: string
          cover_url?: string | null
          start_date: string
          end_date: string
          status?: 'active' | 'upcoming' | 'finished'
          audiences?: string[]
          submission_email?: string | null
          phase?: 'draft' | 'active' | 'closed' | 'results' | null
          results_published?: boolean | null
          results_date?: string | null
          results_text?: string | null
          created_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string
          cover_url?: string | null
          start_date?: string
          end_date?: string
          status?: 'active' | 'upcoming' | 'finished'
          audiences?: string[]
          submission_email?: string | null
          phase?: 'draft' | 'active' | 'closed' | 'results' | null
          results_published?: boolean | null
          results_date?: string | null
          results_text?: string | null
          created_at?: string
          created_by?: string | null
        }
      }
      contest_photos: {
        Row: {
          id: string
          contest_id: string
          image_url: string
          category: 'winner' | 'participant'
          name: string
          surname_initial: string
          age: number
          city: string
          approved: boolean
          uploaded_at: string
          access_token: string | null
          award: 'participant' | 'prize' | 'winner' | null
          certificate_number: string | null
          certificate_url: string | null
          issued_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          id?: string
          contest_id: string
          image_url: string
          category?: 'winner' | 'participant'
          name: string
          surname_initial: string
          age: number
          city: string
          approved?: boolean
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Update: {
          id?: string
          contest_id?: string
          image_url?: string
          category?: 'winner' | 'participant'
          name?: string
          surname_initial?: string
          age?: number
          city?: string
          approved?: boolean
          uploaded_at?: string
          uploaded_by?: string | null
        }
      }
      
      courses: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          title: string
          description: string
          status: 'draft' | 'published'
          format: 'online' | 'offline'
          formats: string[]
          price_type: 'free' | 'paid'
          price: number | null
          location: string | null
          starts_at: string | null
          ends_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          title: string
          description?: string
          status?: 'draft' | 'published'
          format?: 'online' | 'offline'
          formats?: string[]
          price_type?: 'free' | 'paid'
          price?: number | null
          location?: string | null
          starts_at?: string | null
          ends_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          title?: string
          description?: string
          status?: 'draft' | 'published'
          format?: 'online' | 'offline'
          formats?: string[]
          price_type?: 'free' | 'paid'
          price?: number | null
          location?: string | null
          starts_at?: string | null
          ends_at?: string | null
        }
      }

      course_applications: {
        Row: {
          id: string
          created_at: string
          course_id: string
          full_name: string
          email: string
          phone: string | null
          city: string | null
          selected_format: 'online' | 'offline'
          comment: string | null
          status: 'new' | 'in_progress' | 'done'
        }
        Insert: {
          id?: string
          created_at?: string
          course_id: string
          full_name: string
          email: string
          phone?: string | null
          city?: string | null
          selected_format: 'online' | 'offline'
          comment?: string | null
          status?: 'new' | 'in_progress' | 'done'
        }
        Update: {
          id?: string
          created_at?: string
          course_id?: string
          full_name?: string
          email?: string
          phone?: string | null
          city?: string | null
          selected_format?: 'online' | 'offline'
          comment?: string | null
          status?: 'new' | 'in_progress' | 'done'
        }
      }
news: {
        Row: {
          id: string
          title: string
          content: string
          image_url: string | null
          published_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          image_url?: string | null
          published_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          image_url?: string | null
          published_at?: string
        }
      }

      contest_documents: {
        Row: {
          work_id: string
          access_token: string
          certificate_number: string | null
          certificate_path: string | null
          issued_at: string | null
          award: 'participant' | 'prize' | 'winner' | null
          created_at: string
          updated_at: string
        }
        Insert: {
          work_id: string
          access_token: string
          certificate_number?: string | null
          certificate_path?: string | null
          issued_at?: string | null
          award?: 'participant' | 'prize' | 'winner' | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          work_id?: string
          access_token?: string
          certificate_number?: string | null
          certificate_path?: string | null
          issued_at?: string | null
          award?: 'participant' | 'prize' | 'winner' | null
          created_at?: string
          updated_at?: string
        }
      }
      faq: {
        Row: {
          id: string
          question: string
          answer: string
          order: number
        }
        Insert: {
          id?: string
          question: string
          answer: string
          order?: number
        }
        Update: {
          id?: string
          question?: string
          answer?: string
          order?: number
        }
      }
    }
  }
}