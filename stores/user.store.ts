import type { User } from "@supabase/auth-js";

type State = {
  currentUser: User | null;
};
export const useUserStore = defineStore("user", {
  state: (): State => ({
    currentUser: null,
  }),
});
