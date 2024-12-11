export default defineI18nConfig(() => ({
  legacy: false,
  locale: "en",
  messages: {
    en: {
      generic_errors: {
        UNKNOWN_ERROR:
          "An enforcing error has occurred, please try again or report it",
        NETWORK_ERROR:
          "This is a network error, please check your internet connection.",
        SERVER_ERROR: "Sorry we encountered a server problem, try again later!",
        NOT_FOUND: "Resource not found",
        BAD_REQUEST: "Bad request",
        REQUEST_FAILED: "Request failed",
      },
    },
    fr: {
      generic_errors: {
        UNKNOWN_ERROR:
          "Une erreur d'application s'est produite, veuillez réessayer ou signaler l'erreur.",
        NETWORK_ERROR:
          "Ceci est une erreur de reseaux internet, s'il vous plait veuillez verifier votre connexion",
        SERVER_ERROR:
          "Désolé, nous avons rencontré un problème de serveur, réessayez plus tard !",
        NOT_FOUND: "Ressource non trouvée",
        BAD_REQUEST: "Mauvaise requête",
        REQUEST_FAILED: "Échec de la requête",
      },
    },
  },
}));
