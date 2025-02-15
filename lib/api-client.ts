import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ApiClientOptions {
  baseUrl?: string;
  credentials?: RequestCredentials;
  headers?: HeadersInit;
}

class ApiClient {
  private baseUrl: string;
  private defaultOptions: RequestInit;

  constructor(options: ApiClientOptions = {}) {
    this.baseUrl = options.baseUrl || API_BASE_URL;
    this.defaultOptions = {
      credentials: options.credentials || 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };
  }

  private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const token = Cookies.get('token');
    const url = `${this.baseUrl}${endpoint}`;

    // Merge headers, ensuring Authorization header is included if token exists
    const headers = {
      ...this.defaultOptions.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers || {}),
    };

    const response = await fetch(url, {
      ...this.defaultOptions,
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'An error occurred');
    }

    return response.json();
  }

  // Auth endpoints
  auth = {
    login: async (email: string) => {
      return this.fetch('/api/users/login', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    },

    verifyLogin: async (email: string, otp: string) => {
      return this.fetch('/api/users/verifyLogin', {
        method: 'POST',
        body: JSON.stringify({ email, otp }),
      });
    },

    register: async (data: RegisterData) => {
      return this.fetch('/api/users/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    verifyRegistration: async (email: string, otp: string) => {
      return this.fetch('/api/users/verifyRegistration', {
        method: 'POST',
        body: JSON.stringify({ email, otp }),
      });
    },

    resendOTP: async (email: string, type: 'login' | 'registration') => {
      const endpoint = type === 'login'
        ? '/api/users/resendLoginOTP'
        : '/api/users/resendRegistrationOTP';
      return this.fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    },

    getCurrentUser: async () => {
      return this.fetch('/api/users/me');
    },
  };

  // Organizer application endpoints
  organizerApplications = {
    create: async (data: OrganizerApplicationData) => {
      return this.fetch('/api/organizer-applications', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    getByUserId: async () => {
      return this.fetch('/api/organizer-applications/me');
    },

    getAll: async () => {
      return this.fetch('/api/organizer-applications');
    },

    getById: async (id: string) => {
      return this.fetch(`/api/organizer-applications/${id}`);
    },

    getPendingStats: async () => {
      return this.fetch('/api/organizer-applications/stats/pending');
    },

    updateStatus: async (id: string, data: { status: 'approved' | 'rejected', rejectionReason?: string }) => {
      return this.fetch(`/api/organizer-applications/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
  };

  // Events endpoints (for future use)
  events = {
    create: async (data: EventData) => {
      return this.fetch('/api/events', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    getAll: async (params?: { page?: number; limit?: number }) => {
      const queryString = params
        ? `?${new URLSearchParams(params as Record<string, string>).toString()}`
        : '';
      return this.fetch(`/api/events${queryString}`);
    },

    getById: async (id: string) => {
      return this.fetch(`/api/events/${id}`);
    },

    update: async (id: string, data: Partial<EventData>) => {
      return this.fetch(`/api/events/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },

    delete: async (id: string) => {
      return this.fetch(`/api/events/${id}`, {
        method: 'DELETE',
      });
    },
  };

  // Organizations endpoints
  organizations = {
    getCurrent: async (): Promise<OrganizationResponse> => {
      return this.fetch('/api/organizations/me');
    },
    update: async (data: UpdateOrganizationData) => {
      // First get the current organization to get its ID
      const currentOrg = await this.fetch<OrganizationResponse>('/api/organizations/me');
      if (!currentOrg) {
        throw new Error('No organization found');
      }

      // Parse eventTypes if it's a string
      const parsedData = {
        ...data,
        eventTypes: typeof data.eventTypes === 'string' ? JSON.parse(data.eventTypes) : data.eventTypes,
        socialLinks: typeof data.socialLinks === 'string' ? JSON.parse(data.socialLinks) : data.socialLinks,
      };

      // Update using the organization ID
      return this.fetch(`/api/organizations/${currentOrg.id}`, {
        method: 'PATCH',
        body: JSON.stringify(parsedData),
      });
    },
  };
}

// Types
interface RegisterData {
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  country: string;
  role: 'user' | 'organizer' | 'admin';
}

interface OrganizerApplicationData {
  organizationName: string;
  organizationType: 'company' | 'individual' | 'non_profit';
  website?: string;
  description: string;
  experience: string;
  eventTypes: Array<
    | 'conference'
    | 'workshop'
    | 'concert'
    | 'exhibition'
    | 'sports'
    | 'networking'
    | 'festival'
    | 'corporate'
  >;
  phoneNumber: string;
  address: string;
  socialLinks: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
}

interface EventData {
  name: string;
  description?: string;
  capacity: number;
  categoryId?: string;
  isVirtual: boolean;
  bannerUrl?: string;
  startTimestamp?: string;
  endTimestamp?: string;
}

export interface OrganizationData {
  name: string;
  organizationType: 'company' | 'individual' | 'non_profit';
  description: string;
  website?: string;
  eventTypes: string;
  phoneNumber: string;
  address: string;
  country: string;
  socialLinks: string;
}

export interface UpdateOrganizationData {
  name: string;
  organizationType: 'company' | 'individual' | 'non_profit';
  description: string;
  website?: string;
  eventTypes: string;
  phoneNumber: string;
  address: string;
  socialLinks: string;
}

interface OrganizationResponse {
  id: string;
  name: string;
  organizationType: 'company' | 'individual' | 'non_profit';
  description: string;
  website?: string;
  eventTypes: string;
  phoneNumber: string;
  address: string;
  socialLinks: string;
  country: string;
}

// Create and export a singleton instance
export const apiClient = new ApiClient();

// Export types for use in components
export type { RegisterData, OrganizerApplicationData, EventData };