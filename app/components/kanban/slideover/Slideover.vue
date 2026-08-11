<template>
  <Teleport to="body">
    <Transition name="overlay">
      <div
        v-if="store.isOpen"
        class="slideover-overlay"
        @click="close"
      />
    </Transition>

    <Transition name="slideover">
      <aside
        v-if="store.isOpen"
        class="slideover"
        @click.stop
      >
        <button
          class="slideover__close"
          @click="close"
        >
          ✕
        </button>

        <div class="slideover__header">
          <KanbanSlideoverTop />
        </div>

        <div class="slideover__body">
          <KanbanSlideoverComments />
        </div>
      </aside>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { watch, onMounted, onBeforeUnmount } from "vue";
import { useDealsSlideStore } from "~/store/deal-slide.store";
import KanbanSlideoverTop from "./Top.vue";
import KanbanSlideoverComments from "./Comments.vue";

const store = useDealsSlideStore();

function close() {
  store.clear();
}

function handleEsc(event: KeyboardEvent) {
  if (event.key === "Escape") {
    close();
  }
}

watch(
  () => store.isOpen,
  (value) => {
    document.body.style.overflow = value ? "hidden" : "";
  }
);

onMounted(() => {
  window.addEventListener("keydown", handleEsc);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleEsc);
  document.body.style.overflow = "";
});
</script>

<style scoped>
.slideover-overlay {
  position: fixed;
  inset: 0;
  background: var(--overlay-panel);
  backdrop-filter: blur(2px);
  z-index: 999;
}

.slideover {
  position: fixed;
  top: 0;
  right: 0;
  width: 460px;
  max-width: 100%;
  height: 100vh;
  background: var(--bg-secondary);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  box-shadow: -8px 0 24px var(--overlay-shadow);
}

.slideover__header {
  padding: 24px;
  border-bottom: 1px solid var(--border-primary);
}

.slideover__body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.slideover__close {
  position: absolute;
  top: 16px;
  right: 16px;
  color: var(--text-primary);
  width: 36px;
  height: 36px;

  border: none;
  border-radius: 50%;

  cursor: pointer;

  background: color-mix(in srgb, var(--text-muted) 90%, transparent);
  transition: .2s;
}

.slideover__close:hover {
  background: var(--border-secondary);
}

/* Overlay */

.overlay-enter-active,
.overlay-leave-active {
  transition: opacity .25s;
}

.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}

/* Panel */

.slideover-enter-active,
.slideover-leave-active {
  transition: transform .3s ease;
}

.slideover-enter-from,
.slideover-leave-to {
  transform: translateX(100%);
}

/* Адаптивність */
@media (max-width: 768px) {
  .slideover {
    width: 100%;
    max-width: 100%;
  }

  .slideover__header,
  .slideover__body {
    padding: 16px;
  }

  .slideover__close {
    top: 12px;
    right: 12px;
    width: 32px;
    height: 32px;
  }
}
</style>
