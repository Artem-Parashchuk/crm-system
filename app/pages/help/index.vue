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
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 16px;
  padding: 40px;
  width: 100%;
  box-shadow: var(--shadow-card);
}

.help-header {
  text-align: center;
  margin-bottom: 32px;
}

.help-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 8px 0;
  letter-spacing: -0.5px;
}

.help-subtitle {
  font-size: 14px;
  color: var(--text-muted);
  margin: 0;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 700;
  color: var(--text-secondary);
  margin: 0 0 16px 0;
}

.section-icon {
  font-size: 22px;
  color: var(--accent-primary);
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
  background-color: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 10px;
  overflow: hidden;
  transition: border-color 0.2s ease;
}

.faq-item:hover {
  border-color: var(--border-secondary);
}

.faq-item--open {
  border-color: var(--accent-primary);
}

.faq-question {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 14px 16px;
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 15px;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
  transition: color 0.2s ease;
}

.faq-question:hover {
  color: var(--text-primary);
}

.faq-chevron {
  font-size: 20px;
  color: var(--text-subtle);
  transition: transform 0.25s ease, color 0.2s ease;
  flex-shrink: 0;
}

.faq-chevron--open {
  transform: rotate(90deg);
  color: var(--accent-primary);
}

.faq-answer {
  padding: 0 16px 14px 16px;
}

.faq-answer p {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-muted);
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
  border-top: 1px solid var(--border-primary);
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
  background-color: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: 10px;
  transition: border-color 0.2s ease;
}

.contact-item:hover {
  border-color: var(--border-secondary);
}

.contact-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: var(--accent-gradient);
  border-radius: 10px;
  flex-shrink: 0;
}

.contact-icon {
  font-size: 20px;
  color: #fff;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.contact-label {
  font-size: 12px;
  color: var(--text-subtle);
  font-weight: 500;
}

.contact-value {
  font-size: 15px;
  color: var(--text-secondary);
  font-weight: 600;
  text-decoration: none;
  transition: color 0.2s ease;
}

a.contact-value:hover {
  color: var(--accent-secondary);
}

/* Адаптивність */
@media (max-width: 768px) {
  .help-wrapper {
    padding: 12px;
  }

  .help-card {
    padding: 24px;
    border-radius: 12px;
  }

  .help-title {
    font-size: 22px;
  }

  .help-subtitle {
    font-size: 13px;
    margin-bottom: 24px;
  }

  .section-title {
    font-size: 16px;
  }

  .faq-section {
    margin-bottom: 24px;
  }

  .faq-question {
    padding: 12px 14px;
    font-size: 14px;
  }

  .faq-answer {
    padding: 0 14px 12px 14px;
  }

  .faq-answer p {
    font-size: 13px;
  }

  .contact-item {
    padding: 12px;
  }

  .contact-value {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .help-card {
    padding: 16px;
    border-radius: 10px;
  }

  .help-title {
    font-size: 20px;
  }

  .help-subtitle {
    font-size: 12px;
  }

  .section-title {
    font-size: 15px;
  }

  .faq-question {
    font-size: 13px;
  }
}
</style>
