declare module "nuxt/schema" {
  interface RuntimeConfig {
    supabaseUrl: string;
    supabaseKey: string;
  }

  //interface PublicRuntimeConfig {}
}
export {};
