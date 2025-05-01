import Cookies from 'js-cookie';
import { uploadEventCoverImage } from './supabase-client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ApiClientOptions {
  baseUrl?: string;
  credentials?: RequestCredentials;
  headers?: HeadersInit;
}

// Define types for token refresh response and error objects
interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
}

interface ApiError {
  status: number;
  statusText?: string;
  message: string;
  error?: any; // Keep 'any' for the raw error, but use message for display
  endpoint?: string;
}

// Define type for verifyRegistration response
interface VerifyRegistrationResponse {
  access_token: string;
  refresh_token: string;
  // Add other potential properties if needed
}

// Define type for reserveTickets response
interface ReserveTicketsResponse {
  success: boolean;
  message: string;
  tickets: Array<{ id: string; /* ... other ticket properties */ }>;
}

// Define type for countries response
interface CountriesResponse {
  countries: Array<{ code: string; name: string }>;
  defaultCountry: string;
}

class ApiClient {
  private baseUrl: string;
  private defaultOptions: RequestInit;
  private abortControllers: Map<string, AbortController>;
  private refreshPromise: Promise<RefreshTokenResponse> | null = null;

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

  private async refreshToken(): Promise<RefreshTokenResponse> {
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
        const data: RefreshTokenResponse = await response.json();
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
    } catch (error: unknown) { // Use unknown instead of any
      if (controller) {
        this.abortControllers.delete(requestKey);
      }
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request was cancelled');
      }
      // Re-throw other errors to be handled by executeRequest
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

      // Try to parse the JSON, but handle potential parsing errors
      let data: any; // Keep any here for initial parsing flexibility
      try {
        data = await response.json();
      } catch (parseError) { // Catch specific error
        // If parsing fails, create a specific error object
        const parseErrorObject: ApiError = {
          status: response.status, // Use original response status
          statusText: response.statusText,
          message: 'Invalid response format from server',
          error: parseError,
          endpoint
        };
        console.error(`API Parse Error (${response.status}):`, parseErrorObject);
        throw parseErrorObject;
      }

      if (!response.ok) {
        // Enhanced error object with specific handling for common status codes
        const errorObject: ApiError = {
          status: response.status,
          statusText: response.statusText,
          message: data?.message || data?.error?.message || this.getDefaultErrorMessage(response.status),
          error: data?.error || data, // Include the full error object if available
          endpoint
        };

        console.error(`API Error (${response.status}):`, errorObject);
        throw errorObject;
      }

      return data as T; // Assert type T here after success
    } catch (error: unknown) { // Use unknown instead of any
      // If the error is already our enhanced error object, just rethrow it
      if (error && typeof error === 'object' && 'status' in error && 'message' in error) {
        throw error as ApiError;
      }

      // Handle refresh token errors
      if (error instanceof Error && error.message?.includes('refresh token')) {
        // Clear tokens on refresh error
        Cookies.remove('token');
        Cookies.remove('refreshToken');
        // Throw a specific ApiError for refresh failure
        const refreshError: ApiError = {
          status: 401, // Typically 401
          message: 'Session expired. Please log in again.',
          error: error,
          endpoint
        };
        throw refreshError;
      }

      // Handle network errors
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        const networkError: ApiError = {
          status: 0,
          message: 'Network error. Please check your connection.',
          error: error,
          endpoint
        };
        throw networkError;
      }

      // Otherwise wrap in our standard error format
      const wrappedError: ApiError = {
        status: 0,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        error: error,
        endpoint
      };
      throw wrappedError;
    }
  }

  // Helper function to get default error messages by status code
  private getDefaultErrorMessage(status: number): string {
    switch (status) {
      case 400: return 'Invalid request parameters';
      case 401: return 'Authentication required';
      case 403: return 'You don\'t have permission to access this resource';
      case 404: return 'The requested resource was not found';
      case 409: return 'Conflict with the current state of the resource';
      case 422: return 'Validation failed';
      case 429: return 'Too many requests, please try again later';
      case 500: return 'Server error, please try again later';
      default: return `Error ${status}`;
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

    verifyRegistration: async (email: string, otp: string): Promise<VerifyRegistrationResponse> => {
      return this.fetch<VerifyRegistrationResponse>('/api/users/verifyRegistration', {
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
        // First, get the user's selected date components in local timezone
        const year = data.date.getFullYear();
        const month = data.date.getMonth();
        const day = data.date.getDate();

        // Create the dates properly in local timezone by using the local date components
        // and explicitly setting hours and minutes
        const startTime = new Date(year, month, day,
          parseInt(data.startTime.hour),
          parseInt(data.startTime.minute), 0);

        const endTime = new Date(year, month, day,
          parseInt(data.endTime.hour),
          parseInt(data.endTime.minute), 0);

        // Validate that end time is after start time
        if (endTime <= startTime) {
          throw new Error("End time must be after start time");
        }

        // Convert to UTC timestamps for storage
        const startTimestamp = startTime.toISOString();
        const endTimestamp = endTime.toISOString();

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
          categoryId: data.categoryId,
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
        // Ensure the error is re-thrown or handled appropriately
        if (error instanceof Error) {
          throw new Error(`Event creation failed: ${error.message}`);
        } else {
          throw new Error('An unknown error occurred during event creation.');
        }
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
      startDate?: string; // Changed from date
      endDate?: string; // Added endDate
      priceRange?: 'all' | 'free' | 'paid';
      minPrice?: string;
      maxPrice?: string;
      isOnline?: boolean;
      isInPerson?: boolean;
      limit?: number;
    }) => {
      const searchParams = new URLSearchParams();
      if (params?.category) searchParams.set('category', params.category);
      if (params?.query) searchParams.set('query', params.query);
      if (params?.sort) searchParams.set('sort', params.sort);
      if (params?.startDate) searchParams.set('startDate', params.startDate);
      if (params?.endDate) searchParams.set('endDate', params.endDate);
      if (params?.priceRange) searchParams.set('priceRange', params.priceRange);
      if (params?.minPrice) searchParams.set('minPrice', params.minPrice);
      if (params?.maxPrice) searchParams.set('maxPrice', params.maxPrice);
      if (params?.isOnline) searchParams.set('isOnline', params.isOnline.toString());
      if (params?.isInPerson) searchParams.set('isInPerson', params.isInPerson.toString());
      if (params?.limit) searchParams.set('limit', params.limit.toString());

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
    getAnalytics: async (): Promise<OrganizationAnalytics> => {
      return this.fetch('/api/organizations/me/analytics');
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
    getAvailable: async (eventId: string, ticketTypeId: string) => {
      return this.fetch<Array<{ id: string; status: string }>>(`/api/tickets/events/${eventId}/ticket-types/${ticketTypeId}`);
    },
    purchase: async (data: {
      eventId: string;
      tickets: Array<{ ticketTypeId: string; quantity: number }>;
      specificTicketIds?: string[];
    }) => {
      return this.fetch<PurchaseResult>('/api/tickets/purchase', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    getMyTickets: async () => {
      return this.fetch<Array<{
        ticket: {
          id: string;
          status: string;
          price: number;
          bookedAt?: string;
        };
        event: {
          id: string;
          title: string;
          startTimestamp: string;
          endTimestamp: string;
          venue: string | null;
          address: string | null;
          isOnline: boolean;
          coverImage?: string;
          organization?: {
            name: string;
          };
        };
        ticketType: {
          id: string;
          name: string;
          type: 'paid' | 'free';
        };
      }>>('/api/tickets/my');
    },
    reserve: async (data: { eventId: string; tickets: Array<{ ticketTypeId: string; quantity: number }> }): Promise<ReserveTicketsResponse> => {
      return this.fetch<ReserveTicketsResponse>('/api/tickets/reserve', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    releaseReservations: async () => {
      return this.fetch<{ success: boolean; message: string }>('/api/tickets/release-reservations', {
        method: 'POST',
        body: JSON.stringify({}), // Add empty object body to avoid Fastify error
      });
    },
    getAccessToken: async (eventId: string, ticketId: string) => {
      return this.fetch<{ accessToken: string }>(
        `/api/tickets/events/${eventId}/tickets/${ticketId}/access-token`
      );
    },
    verifyTicket: async (eventId: string, ticketId: string, accessToken: string) => {
      return this.fetch<{
        success: boolean;
        ticket: {
          id: string;
          status: string;
          isValidated: boolean;
          validatedAt?: string;
          ticketType: {
            id: string;
            name: string;
            type: string;
          };
          user: {
            id: string;
            firstName: string;
            lastName: string;
            email: string;
          };
          event: {
            id: string;
            title: string;
          };
        };
      }>(
        `/api/tickets/events/${eventId}/validate/${ticketId}?accessToken=${accessToken}`
      );
    },
    validateTicket: async (eventId: string, ticketId: string, accessToken: string) => {
      return this.fetch<{
        success: boolean;
        message: string;
        ticket: {
          id: string;
          isValidated: boolean;
          validatedAt: string;
        }
      }>(
        `/api/tickets/events/${eventId}/validate/${ticketId}`,
        {
          method: 'POST',
          body: JSON.stringify({ accessToken }),
        }
      );
    },
    getTicketDetails: async (eventId: string, ticketId: string) => {
      return this.fetch<{
        success: boolean;
        ticket: {
          id: string;
          status: string;
          isValidated: boolean;
          validatedAt?: string;
          bookedAt?: string;
          price?: number;
          ticketType: {
            id: string;
            name: string;
            type: string;
          };
          user: {
            id: string;
            firstName: string;
            lastName: string;
            email: string;
            phoneNumber?: string;
          };
          event: {
            id: string;
            title: string;
            startTimestamp?: string;
            endTimestamp?: string;
            venue?: string;
            address?: string;
          };
        };
      }>(
        `/api/tickets/events/${eventId}/tickets/${ticketId}/details`
      );
    },
    getReleaseReservationsBeaconData: () => {
      const token = Cookies.get('token');
      return {
        url: `${API_BASE_URL}/api/tickets/release-reservations`,
        data: new Blob([JSON.stringify({})], { type: 'application/json' }),
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
      };
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

  // Categories endpoints
  categories = {
    getAll: async () => {
      return this.fetch<Array<{
        id: string;
        name: string;
        icon: string;
        createdAt: string;
        updatedAt: string;
      }>>('/api/categories');
    },

    getById: async (id: string) => {
      return this.fetch<{
        id: string;
        name: string;
        icon: string;
        createdAt: string;
        updatedAt: string;
      }>(`/api/categories/${id}`);
    },

    create: async (data: { name: string; icon?: string }) => {
      return this.fetch<{
        id: string;
        name: string;
        icon: string;
        createdAt: string;
        updatedAt: string;
      }>('/api/categories', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    update: async (id: string, data: { name?: string; icon?: string }) => {
      return this.fetch<{
        id: string;
        name: string;
        icon: string;
        createdAt: string;
        updatedAt: string;
      }>(`/api/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    delete: async (id: string) => {
      return this.fetch<{
        id: string;
        name: string;
        icon: string;
        createdAt: string;
        updatedAt: string;
      }>(`/api/categories/${id}`, {
        method: 'DELETE',
        body: JSON.stringify({}),
      });
    },
  };

  // Add platform configurations endpoints
  platformConfigurations = {
    getAll: async () => {
      return this.fetch<Array<{
        id: string;
        key: string;
        value: string;
        createdAt: string;
        updatedAt: string;
      }>>('/api/platform-configurations');
    },

    getByKey: async (key: string) => {
      return this.fetch<{
        id: string;
        key: string;
        value: string;
        createdAt: string;
        updatedAt: string;
      }>(`/api/platform-configurations/${key}`);
    },

    update: async (key: string, value: string) => {
      return this.fetch<{
        id: string;
        key: string;
        value: string;
        createdAt: string;
        updatedAt: string;
      }>(`/api/platform-configurations/${key}`, {
        method: 'PATCH',
        body: JSON.stringify({ value }),
      });
    },

    create: async (data: { key: string; value: string }) => {
      return this.fetch<{
        id: string;
        key: string;
        value: string;
        createdAt: string;
        updatedAt: string;
      }>('/api/platform-configurations', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
  };

  // Add admin endpoints
  admin = {
    // User management
    users: {
      getAll: async () => {
        return this.fetch('/api/admin/users');
      },

      getById: async (id: string) => {
        return this.fetch(`/api/admin/users/${id}`);
      },

      updateUser: async (id: string, data: {
        role?: 'user' | 'organizer' | 'admin';
        status?: 'active' | 'inactive' | 'banned';
      }) => {
        return this.fetch(`/api/admin/users/${id}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        });
      },

      deleteUser: async (id: string) => {
        return this.fetch(`/api/admin/users/${id}`, {
          method: 'DELETE',
        });
      },

      // Get user statistics
      getStats: async (id: string) => {
        return this.fetch(`/api/admin/users/${id}/stats`);
      },

      // Get user events
      getEvents: async (id: string) => {
        return this.fetch(`/api/admin/users/${id}/events`);
      },

      // Get user transactions
      getTransactions: async (id: string) => {
        return this.fetch(`/api/admin/users/${id}/transactions`);
      }
    },

    // Dashboard statistics
    dashboard: {
      getStats: async () => {
        return this.fetch('/api/admin/dashboard/stats');
      },

      getMonthlyUserStats: async () => {
        return this.fetch('/api/admin/dashboard/users/monthly');
      }
    }
  };

  async getAdminMonthlyRevenue(): Promise<MonthlyRevenueData[]> {
    return this.fetch<MonthlyRevenueData[]>('/api/admin/reports/revenue');
  }

  async getAdminUserGrowth(): Promise<UserGrowthData[]> {
    return this.fetch<UserGrowthData[]>('/api/admin/reports/users/growth');
  }

  async getAdminEventStatistics(): Promise<EventStatistics[]> {
    return this.fetch<EventStatistics[]>('/api/admin/reports/events/statistics');
  }

  // Add utility endpoints directly to the class
  utils = {
    getCountries: async (): Promise<CountriesResponse> => {
      // 'this' correctly refers to the ApiClient instance here
      return this.fetch<CountriesResponse>('/api/utils/countries');
    },
  };
}

// Create and export a singleton instance
export const apiClient = new ApiClient();

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
  categoryId: string;
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
  categoryId: string;
  isOnline: boolean;
  capacity: number;
  coverImage?: File;
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
  categoryObject?: {
    id: string;
    name: string;
    icon: string;
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
    status: 'on-sale' | 'paused' | 'sold-out' | 'scheduled';
    soldCount: number;
  }>;
}

interface PurchaseResult {
  success: boolean;
  message?: string;
  order: {
    id: string;
    status: 'pending' | 'completed' | 'failed';
  };
  checkoutUrl?: string;
  isFree: boolean;
}

interface OrganizationAnalytics {
  totalEvents: number;
  totalAttendees: number;
  totalRevenue: number;
  ticketsSold: number;
  periodChanges: {
    eventsChange: number;
    attendeesChange: number;
    revenueChange: number;
    ticketsChange: number;
  };
  recentEvents?: Array<{
    id: string;
    title: string;
    startTimestamp: string;
    status: "draft" | "published" | "cancelled";
    ticketsSold: number;
    revenue: number;
  }>;
  eventsByCategory?: Array<{
    category: string;
    count: number;
  }>;
  revenueByMonth?: Array<{
    month: string;
    revenue: number;
  }>;
  ticketSalesByMonth?: Array<{
    month: string;
    count: number;
  }>;
}

interface MonthlyRevenueData {
  month: string;
  year: number;
  revenue: number;
  totalSales: number;
  ticketsSold: number;
}

interface UserGrowthData {
  month: string;
  year: number;
  newUsers: number;
  totalUsers: number;
}

interface EventStatistics {
  month: string;
  year: number;
  newEvents: number;
  ticketsSold: number;
  averageTicketsPerEvent: number;
  eventOccupancyRate: number;
}

// Export types for use in components
export type { RegisterData, OrganizerApplicationData, RawFormEventData, OrganizationAnalytics, MonthlyRevenueData, UserGrowthData, EventStatistics, ApiError }; // Add ApiError