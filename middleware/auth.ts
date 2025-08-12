import { useClientUser } from "~/shared/utils/api-client";

export default defineNuxtRouteMiddleware(() => {
  const currentUser = useClientUser();
  const isAuthenticated = !!currentUser.value;

  if (!isAuthenticated) {
    return navigateTo("/auth");
  }
});
