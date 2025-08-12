import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import mockI18n from "./__mocks__/@nuxtjs/i18n";
import { vi, type Mock } from "vitest";

mockNuxtImport("useI18n", () => mockI18n.useI18n);

export interface MockSupabaseAuth {
  signInWithPassword: Mock;
  signOut: Mock;
  signUp: Mock;
  getUser: Mock;
  setSession: Mock;
  getSession: Mock;
}

export interface MockSupabaseClientInstance {
  auth: MockSupabaseAuth;
  from: Mock;
  storage: { from: Mock };
  functions: { invoke: Mock };
}

export interface MockSupabaseQueryBuilder {
  eq: Mock;
  select: Mock;
  update: Mock;
  insert: Mock;
  delete: Mock;
  order: Mock;
  limit: Mock;
  single: Mock;
  maybeSingle: Mock;
  rpc: Mock;
}

export const mockSupabaseQueryBuilder: MockSupabaseQueryBuilder = {
  eq: vi.fn(() => mockSupabaseQueryBuilder),
  select: vi.fn(() => mockSupabaseQueryBuilder),
  update: vi.fn(() => mockSupabaseQueryBuilder),
  insert: vi.fn(() => mockSupabaseQueryBuilder),
  delete: vi.fn(() => mockSupabaseQueryBuilder),
  order: vi.fn(() => mockSupabaseQueryBuilder),
  limit: vi.fn(() => mockSupabaseQueryBuilder),
  single: vi.fn(() =>
    Promise.resolve({
      data: null,
      error: null,
      status: 200,
      statusText: "OK",
    }),
  ),
  maybeSingle: vi.fn(() =>
    Promise.resolve({
      data: null,
      error: null,
      status: 200,
      statusText: "OK",
    }),
  ),
  rpc: vi.fn(() =>
    Promise.resolve({
      data: null,
      error: null,
    }),
  ),
};

export const mockSupabaseAuth: MockSupabaseAuth = {
  signInWithPassword: vi.fn(() =>
    Promise.resolve({
      data: {
        user: null,
        session: null,
      },
      error: null,
    }),
  ),
  signOut: vi.fn(() =>
    Promise.resolve({
      data: {
        user: null,
        session: null,
      },
      error: null,
    }),
  ),
  signUp: vi.fn(() =>
    Promise.resolve({
      data: {
        user: null,
        session: null,
      },
      error: null,
    }),
  ),
  getUser: vi.fn(() =>
    Promise.resolve({
      data: { user: null },
      error: null,
    }),
  ),
  setSession: vi.fn(() =>
    Promise.resolve({
      data: {
        user: null,
        session: null,
      },
      error: null,
    }),
  ),
  getSession: vi.fn(() =>
    Promise.resolve({
      data: {
        session: null,
      },
      error: null,
    }),
  ),
};

export const mockSupabaseStorage = {
  from: vi.fn(() => ({
    upload: vi.fn(() =>
      Promise.resolve({
        data: null,
        error: null,
      }),
    ),
    download: vi.fn(() =>
      Promise.resolve({
        data: null,
        error: null,
      }),
    ),
  })),
};

export const mockSupabaseFunctions = {
  invoke: vi.fn(() =>
    Promise.resolve({
      data: null,
      error: null,
    }),
  ),
};

export const mockSupabaseClientInstance: MockSupabaseClientInstance = {
  auth: mockSupabaseAuth,
  from: vi.fn(() => mockSupabaseQueryBuilder),
  storage: mockSupabaseStorage,
  functions: mockSupabaseFunctions,
};
