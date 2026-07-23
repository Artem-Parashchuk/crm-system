// plugins/appwrite.client.ts
import { Client, Account, Databases, Storage, ID } from 'appwrite'
import { useRuntimeConfig } from '#app'

export default defineNuxtPlugin(() => {
  const client = new Client()
  const config = useRuntimeConfig()
  client
    .setEndpoint(config.public.appwriteEndpoint) // Або твій локальний хост
    .setProject(config.public.appwriteProjectId) // ID твого проєкту в консолі Appwrite

  const account = new Account(client)
  const databases = new Databases(client)
  const storage = new Storage(client)

  // Прокидаємо екземпляри Appwrite в усьому Nuxt проєкту
  return {
    provide: {
      appwrite: { client, account, databases, storage, ID }
    }
  }
})