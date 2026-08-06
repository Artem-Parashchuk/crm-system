export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  runtimeConfig: {
    public: {
      appwriteEndpoint: process.env.NUXT_PUBLIC_APPWRITE_ENDPOINT,
      appwriteProjectId: process.env.NUXT_PUBLIC_APPWRITE_PROJECT_ID,
      dbId: process.env.NUXT_PUBLIC_DB_ID,
      collectionDeals: process.env.NUXT_PUBLIC_COLLECTION_DEALS,
      collectionCustomers: process.env.NUXT_PUBLIC_COLLECTION_CUSTOMERS,
      collectionComments: process.env.NUXT_PUBLIC_COLLECTION_COMMENTS,
      // Вказуємо твій реальний ID бакету за дефолтом:
      storageId: process.env.NUXT_PUBLIC_STORAGE_ID,
    },
  },
  css: ["~/assets/css/main.css"],

  devtools: { enabled: false },

  modules: [
    "@nuxt/ui",
    "@nuxt/image",
    "@nuxt/icon",
    "@nuxtjs/google-fonts",
    "@pinia/nuxt",
    [
      "@vee-validate/nuxt",
      {
        autoImports: true,
      },
    ],
  ],

  googleFonts: {
    families: {
      Lato: {
        wght: [300, 400, 700],
        ital: [300],
      },
    },
    download: true,
    inject: true,
  },
  pinia: {
    storesDirs: ["~/store"],
  },
});
