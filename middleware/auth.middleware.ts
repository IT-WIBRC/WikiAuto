export default defineNuxtRouteMiddleware(async () => {
    if (!useAuthStore().isLoggedIn) {
       return navigateTo("/auth");
   }
});
