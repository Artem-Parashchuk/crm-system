import dayjs from 'dayjs'
import 'dayjs/locale/uk'

export default defineNuxtPlugin(() => {
  dayjs.locale('uk')
})
