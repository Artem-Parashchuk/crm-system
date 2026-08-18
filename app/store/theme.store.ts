import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const theme = ref<'dark' | 'light'>('dark')

  const applyTheme = () => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme.value)
    }
  }

  const initTheme = () => {
    if (typeof localStorage === 'undefined') {
      return
    }

    const saved = localStorage.getItem('theme') as 'dark' | 'light' | null

    if (saved === 'light' || saved === 'dark') {
      theme.value = saved
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      theme.value = prefersDark ? 'dark' : 'light'
    }

    applyTheme()
  }

  const toggleTheme = () => {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('theme', theme.value)
    }

    applyTheme()
  }

  const setTheme = (newTheme: 'dark' | 'light') => {
    theme.value = newTheme

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('theme', newTheme)
    }

    applyTheme()
  }

  return {
    theme,
    initTheme,
    toggleTheme,
    setTheme,
  }
})
