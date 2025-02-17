import Cookies from 'js-cookie';
import { uploadEventCoverImage } from './supabase-client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ApiClientOptions {
  baseUrl?: string;
  credentials?: RequestCredentials;
  headers?: HeadersInit;
}

class ApiClient {
  private baseUrl: string;
  private defaultOptions: RequestInit;
  private abortControllers: Map<string, AbortController>;
  private refreshPromise: Promise<any> | null = null;

  constructor(options: ApiClientOptions = {}) {
    this.baseUrl = options.baseUrl || API_BASE_URL;
    this.defaultOptions = {
      credentials: options.credentials || 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };
    this.abortControllers = new Map();
  }

  private getRequestKey(endpoint: string, options?: RequestInit): string {
    return `${options?.method || 'GET'}-${endpoint}`;
  }

  private abortPreviousRequest(requestKey: string) {
    // Only abort non-GET requests
    if (!requestKey.startsWith('GET-')) {
      const previousController = this.abortControllers.get(requestKey);
      if (previousController) {
        previousController.abort();
        this.abortControllers.delete(requestKey);
      }
    }
  }

  private async refreshToken() {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    const refreshToken = Cookies.get('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      this.refreshPromise = fetch(`${this.baseUrl}/api/users/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      }).then(async (response) => {
        if (!response.ok) {
          throw new Error('Failed to refresh token');
        }
        const data = await response.json();
        Cookies.set('token', data.access_token, {
          expires: 7,
          path: '/',
          sameSite: 'lax',
        });
        Cookies.set('refreshToken', data.refresh_token, {
          expires: 30,
          path: '/',
          sameSite: 'lax',
        });
        return data;
      });

      const result = await this.refreshPromise;
      return result;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const requestKey = this.getRequestKey(endpoint, options);

    // Only set up abort controller for non-GET requests
    let controller: AbortController | undefined;
    if (!requestKey.startsWith('GET-')) {
      this.abortPreviousRequest(requestKey);
      controller = new AbortController();
      this.abortControllers.set(requestKey, controller);
    }

    try {
      const response = await this.executeRequest<T>(endpoint, options, controller?.signal);
      if (controller) {
        this.abortControllers.delete(requestKey);
      }
      return response;
    } catch (error: any) {
      if (controller) {
        this.abortControllers.delete(requestKey);
      }
      if (error.name === 'AbortError') {
        throw new Error('Request was cancelled');
      }
      throw error;
    }
  }

  private async executeRequest<T>(endpoint: string, options?: RequestInit, signal?: AbortSignal, retried = false): Promise<T> {
    const token = Cookies.get('token');
    const url = `${this.baseUrl}${endpoint}`;

    const headers = {
      ...this.defaultOptions.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers || {}),
    };

    try {
      const response = await fetch(url, {
        ...this.defaultOptions,
        ...options,
        headers,
        signal,
      });

      if (response.status === 401 && !retried) {
        // Token expired, try to refresh
        await this.refreshToken();
        // Retry the request with new token
        return this.executeRequest<T>(endpoint, options, signal, true);
      }

      const data = await response.json();

      if (!response.ok) {
        // Throw an error with the server's error message or a default message
        throw new Error(data.message || data.error || 'An error occurred');
      }

      return data;
    } catch (error: any) {
      if (error.message?.includes('refresh token')) {
        // Clear tokens on refresh error
        Cookies.remove('token');
        Cookies.remove('refreshToken');
      }
      // Rethrow the error with a more specific message if it's a fetch error
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Network error. Please check your connection.');
      }
      throw error;
    }
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

  // Events endpoints
  events = {
    create: async (data: RawFormEventData): Promise<Event> => {
      // Ensure we have a valid date
      if (!data.date || !(data.date instanceof Date)) {
        throw new Error("Invalid date format");
      }

      // Ensure we have valid time data
      if (!data.startTime?.hour || !data.startTime?.minute || !data.endTime?.hour || !data.endTime?.minute) {
        throw new Error("Invalid time format");
      }

      try {
        const startTimestamp = new Date(
          `${data.date.toISOString().split('T')[0]}T${data.startTime.hour}:${data.startTime.minute}:00`
        ).toISOString();
        const endTimestamp = new Date(
          `${data.date.toISOString().split('T')[0]}T${data.endTime.hour}:${data.endTime.minute}:00`
        ).toISOString();

        let coverImageUrl;
        if (data.coverImage) {
          coverImageUrl = await uploadEventCoverImage(data.coverImage);
        }

        const eventData: EventData = {
          title: data.title,
          description: data.description || "",
          startTimestamp,
          endTimestamp,
          venue: data.venue,
          address: data.address,
          category: data.category,
          isOnline: data.isOnline,
          capacity: data.capacity,
          coverImage: coverImageUrl,
        };

        return this.fetch('/api/events', {
          method: 'POST',
          body: JSON.stringify(eventData),
        });
      } catch (error) {
        console.error("Error in events.create:", error);
        throw error;
      }
    },

    getMyEvents: async () => {
      return this.fetch('/api/events/my');
    },

    createTicketType: async (eventId: string, data: TicketTypeData) => {
      return this.fetch(`/api/events/${eventId}/ticket-types`, {
        method: 'POST',
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          price: data.type === 'free' ? 0 : data.price,
          quantity: data.quantity,
          type: data.type,
          saleStart: new Date(data.saleStart).toISOString(),
          saleEnd: new Date(data.saleEnd).toISOString(),
          maxPerOrder: data.maxPerOrder,
          minPerOrder: data.minPerOrder
        }),
      });
    },

    updateTicketType: async (eventId: string, ticketTypeId: string, data: TicketTypeData) => {
      return this.fetch(`/api/events/${eventId}/ticket-types/${ticketTypeId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          price: data.type === 'free' ? 0 : data.price,
          quantity: data.quantity,
          type: data.type,
          saleStart: new Date(data.saleStart).toISOString(),
          saleEnd: new Date(data.saleEnd).toISOString(),
          maxPerOrder: data.maxPerOrder,
          minPerOrder: data.minPerOrder
        }),
      });
    },

    getAll: async (params?: { page?: number; limit?: number }) => {
      const queryString = params
        ? `?${new URLSearchParams(params as Record<string, string>).toString()}`
        : '';
      return this.fetch(`/api/events${queryString}`);
    },

    getById: async (id: string): Promise<Event> => {
      return this.fetch<Event & { ticketTypes: Array<{
        id: string;
        name: string;
        description?: string;
        price: number;
        quantity: number;
        type: 'paid' | 'free';
        saleStart: string;
        saleEnd: string;
        maxPerOrder?: number;
        minPerOrder?: number;
        status: 'on-sale' | 'paused' | 'sold-out' | 'scheduled';
        soldCount: number;
      }> }>(`/api/events/${id}`);
    },

    getAnalytics: async (id: string) => {
      return this.fetch(`/api/events/${id}/analytics`);
    },

    update: async (id: string, data: Partial<EventData>): Promise<Event> => {
      return this.fetch(`/api/events/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },

    updateStatus: async (id: string, data: { status: 'draft' | 'published' | 'cancelled' }): Promise<Event> => {
      return this.fetch(`/api/events/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },

    delete: async (id: string) => {
      return this.fetch(`/api/events/${id}`, {
        method: 'DELETE',
      });
    },

    getPublicEvents: async (params?: {
      category?: string;
      query?: string;
      sort?: 'date' | 'price-low' | 'price-high';
      date?: string;
      priceRange?: 'all' | 'free' | 'paid';
      minPrice?: string;
      maxPrice?: string;
      isOnline?: boolean;
      isInPerson?: boolean;
    }) => {
      const searchParams = new URLSearchParams();
      if (params?.category) searchParams.set('category', params.category);
      if (params?.query) searchParams.set('query', params.query);
      if (params?.sort) searchParams.set('sort', params.sort);
      if (params?.date) searchParams.set('date', params.date);
      if (params?.priceRange) searchParams.set('priceRange', params.priceRange);
      if (params?.minPrice) searchParams.set('minPrice', params.minPrice);
      if (params?.maxPrice) searchParams.set('maxPrice', params.maxPrice);
      if (params?.isOnline) searchParams.set('isOnline', params.isOnline.toString());
      if (params?.isInPerson) searchParams.set('isInPerson', params.isInPerson.toString());

      const queryString = searchParams.toString();
      return this.fetch<Event[]>(`/api/events${queryString ? `?${queryString}` : ''}`);
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

  // Stripe endpoints
  stripe = {
    connect: async (data: { organizationId: string }): Promise<{ organization: OrganizationResponse; onboardingUrl: string }> => {
      return this.fetch('/api/stripe/connect', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    getStatus: async (organizationId: string): Promise<{
      isConnected: boolean;
      accountId?: string;
      payoutsEnabled?: boolean;
      detailsSubmitted?: boolean;
    }> => {
      const org = await this.fetch<OrganizationResponse>(`/api/organizations/${organizationId}`);
      return {
        isConnected: !!org.stripeAccountId,
        accountId: org.stripeAccountId,
        payoutsEnabled: org.stripeAccountStatus === 'active',
        detailsSubmitted: org.stripeAccountStatus === 'active',
      };
    },

    refreshOnboarding: async (organizationId: string): Promise<{ onboardingUrl: string }> => {
      return this.fetch(`/api/stripe/onboard/refresh/${organizationId}`, {
        method: 'GET',
      });
    },
  };

  // Tickets endpoints
  tickets = {
    reserveFree: async (data: { eventId: string; tickets: Array<{ id: string; quantity: number }> }) => {
      return this.fetch<{ orderId: string }>('/api/tickets/reserve-free', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
  };

  // Checkout endpoints
  checkout = {
    createSession: async (data: { eventId: string; tickets: Array<{ id: string; quantity: number }> }) => {
      return this.fetch<{ url: string }>('/api/checkout/create-session', {
        method: 'POST',
        body: JSON.stringify(data),
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

export interface EventData {
  title: string;
  description: string;
  startTimestamp: string;
  endTimestamp: string;
  venue: string | null;
  address: string | null;
  category: string;
  isOnline: boolean;
  capacity: number;
  coverImage?: string;
  status?: "draft" | "published" | "cancelled";
}

export interface TicketTypeData {
  name: string;
  description?: string;
  price: number;
  quantity: number;
  type: 'paid' | 'free';
  saleStart: string;
  saleEnd: string;
  maxPerOrder?: number;
  minPerOrder?: number;
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
  stripeAccountId?: string;
  stripeAccountStatus?: 'pending' | 'active' | 'inactive';
  stripeAccountCreatedAt?: string;
  stripeAccountUpdatedAt?: string;
}

interface RawFormEventData {
  title: string;
  description?: string;
  date: Date;
  startTime: {
    hour: string;
    minute: string;
  };
  endTime: {
    hour: string;
    minute: string;
  };
  venue: string | null;
  address: string | null;
  category: string;
  isOnline: boolean;
  capacity: number;
  coverImage?: File;
}

interface FormEventData {
  title: string;
  description?: string;
  startTimestamp: string;
  endTimestamp: string;
  venue: string | null;
  address: string | null;
  category: string;
  isOnline: boolean;
  capacity: number;
  coverImage?: string;
}

export interface Event extends EventData {
  id: string;
  organizationId: string;
  organization?: {
    id: string;
    name: string;
    website?: string;
    socialLinks?: string;
  };
  ticketTypes?: Array<{
    id: string;
    name: string;
    description?: string;
    price: number;
    quantity: number;
    type: 'paid' | 'free';
    saleStart: string;
    saleEnd: string;
    maxPerOrder?: number;
    minPerOrder?: number;
    status?: 'on-sale' | 'paused' | 'sold-out' | 'scheduled';
    soldCount?: number;
  }>;
}

// Create and export a singleton instance
export const apiClient = new ApiClient();

// Export types for use in components
export type { RegisterData, OrganizerApplicationData, RawFormEventData };