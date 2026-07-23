<template>
  <div class="help-wrapper">
    <div class="help-card">
      <div class="help-header">
        <h1 class="help-title">Допомога</h1>
        <p class="help-subtitle">Відповіді на ваші питання та контакти підтримки</p>
      </div>

      <div class="faq-section">
        <h2 class="section-title">
          <Icon name="material-symbols:help-outline" class="section-icon" />
          Часті питання
        </h2>

        <div class="faq-list">
          <div
            v-for="(item, index) in faqItems"
            :key="index"
            class="faq-item"
            :class="{ 'faq-item--open': item.isOpen }"
          >
            <button class="faq-question" @click="toggleQuestion(index)">
              <span>{{ item.question }}</span>
              <Icon
                name="material-symbols:chevron-right"
                class="faq-chevron"
                :class="{ 'faq-chevron--open': item.isOpen }"
              />
            </button>

            <Transition name="slide">
              <div v-if="item.isOpen" class="faq-answer">
                <p>{{ item.answer }}</p>
              </div>
            </Transition>
          </div>
        </div>
      </div>

      <div class="contacts-section">
        <h2 class="section-title">
          <Icon name="material-symbols:contact-support-outline" class="section-icon" />
          Контакти підтримки
        </h2>

        <div class="contacts-list">
          <div class="contact-item">
            <div class="contact-icon-wrapper">
              <Icon name="material-symbols:mail-outline" class="contact-icon" />
            </div>
            <div class="contact-info">
              <span class="contact-label">Email</span>
              <a href="mailto:support@crm.com" class="contact-value">support@crm.com</a>
            </div>
          </div>

          <div class="contact-item">
            <div class="contact-icon-wrapper">
              <Icon name="mdi:telegram" class="contact-icon" />
            </div>
            <div class="contact-info">
              <span class="contact-label">Telegram</span>
              <a href="#" class="contact-value">@crm_support</a>
            </div>
          </div>

          <div class="contact-item">
            <div class="contact-icon-wrapper">
              <Icon name="material-symbols:schedule" class="contact-icon" />
            </div>
            <div class="contact-info">
              <span class="contact-label">Робочі години</span>
              <span class="contact-value">Пн-Пт 9:00-18:00</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { HELP_FAQ_DATA, type HelpFaqItem } from "~/data/help-faq.data";

const faqItems = ref<(HelpFaqItem & { isOpen: boolean })[]>(
  HELP_FAQ_DATA.map((item) => ({ ...item, isOpen: false }))
);

const toggleQuestion = (index: number) => {
  faqItems.value[index].isOpen = !faqItems.value[index].isOpen;
};
</script>

<style scoped>
.help-wrapper {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  min-height: 100%;
  width: 100%;
  padding: 20px;
}

.help-card {
  background-color: #140e24;
  border: 1px solid #2b1f47;
  border-radius: 16px;
  padding: 40px;
  width: 100%;
  max-width: 720px;
  box-shadow:
    0 20px 40px rgba(5, 3, 10, 0.8),
    0 1px 3px rgba(139, 92, 246, 0.1);
}

.help-header {
  text-align: center;
  margin-bottom: 32px;
}

.help-title {
  font-size: 28px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 8px 0;
  letter-spacing: -0.5px;
}

.help-subtitle {
  font-size: 14px;
  color: #94a3b8;
  margin: 0;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 700;
  color: #e2daf5;
  margin: 0 0 16px 0;
}

.section-icon {
  font-size: 22px;
  color: #8b5cf6;
}

.faq-section {
  margin-bottom: 32px;
}

.faq-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.faq-item {
  background-color: #0b0714;
  border: 1px solid #2b1f47;
  border-radius: 10px;
  overflow: hidden;
  transition: border-color 0.2s ease;
}

.faq-item:hover {
  border-color: #3e2d63;
}

.faq-item--open {
  border-color: #8b5cf6;
}

.faq-question {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 14px 16px;
  background: none;
  border: none;
  color: #e2daf5;
  font-size: 15px;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
  transition: color 0.2s ease;
}

.faq-question:hover {
  color: #ffffff;
}

.faq-chevron {
  font-size: 20px;
  color: #64748b;
  transition: transform 0.25s ease, color 0.2s ease;
  flex-shrink: 0;
}

.faq-chevron--open {
  transform: rotate(90deg);
  color: #8b5cf6;
}

.faq-answer {
  padding: 0 16px 14px 16px;
}

.faq-answer p {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: #94a3b8;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.25s ease;
  overflow: hidden;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
}

.slide-enter-to,
.slide-leave-from {
  opacity: 1;
  max-height: 200px;
}

.contacts-section {
  padding-top: 24px;
  border-top: 1px solid #2b1f47;
}

.contacts-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  background-color: #0b0714;
  border: 1px solid #2b1f47;
  border-radius: 10px;
  transition: border-color 0.2s ease;
}

.contact-item:hover {
  border-color: #3e2d63;
}

.contact-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%);
  border-radius: 10px;
  flex-shrink: 0;
}

.contact-icon {
  font-size: 20px;
  color: #ffffff;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.contact-label {
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
}

.contact-value {
  font-size: 15px;
  color: #e2daf5;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.2s ease;
}

a.contact-value:hover {
  color: #a78bfa;
}
</style>
