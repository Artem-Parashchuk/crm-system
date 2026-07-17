<template>
  <div class="wrapper">
    <button type="button" class="btn" @click="isOpenForm = !isOpenForm">
      <Icon
        v-if="isOpenForm"
        name="mdi-light:arrow-up"
        class="arrow-icon"
        :size="40"
      />
      <Icon v-else name="tdesign:add-circle" class="add-icon" :size="40" />
    </button>

    <form v-if="isOpenForm" class="deal-form" @submit.prevent="submitDeal">
      <label class="deal-form__field">
        <span>Назва угоди</span>
        <input v-model="form.name" required />
      </label>

      <label class="deal-form__field">
        <span>Вартість</span>
        <input v-model.number="form.price" type="number" min="0" required />
      </label>

      <label class="deal-form__field">
        <span>Ім'я клієнта</span>
        <input v-model="form.customer.name" required />
      </label>

      <label class="deal-form__field">
        <span>Email клієнта</span>
        <input v-model="form.customer.email" type="email" required />
      </label>

      <button
        type="submit"
        class="deal-form__submit"
        :disabled="createDealMutation.isPending.value || !isFormValid"
      >
        {{ createDealMutation.isPending.value ? "Створення..." : "Створити" }}
      </button>

      <!-- <p v-if="createDealMutation.isError" class="deal-form__error">
        Не вдалося створити угоду
      </p> -->
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { useMutation } from "@tanstack/vue-query";
import { v4 as uuid } from "uuid";
import type { IDeal } from "~/types/deals.types";

const props = defineProps<{
  status?: string;
  refetch?: () => void | Promise<unknown>;
}>();

interface IDealFormState extends Pick<IDeal, "name" | "price"> {
  customer: {
    email: string;
    name: string;
  };
  status: string;
}

const isOpenForm = ref(false);
const { $appwrite } = useNuxtApp();
const config = useRuntimeConfig();

const form = ref<IDealFormState>({
  name: "",
  price: 0,
  customer: {
    email: "",
    name: "",
  },
  status: props.status || "todo",
});

watch(
  () => props.status,
  (value) => {
    form.value.status = value || "todo";
  },
  { immediate: true },
);

const createDealMutation = useMutation({
  mutationKey: ["create-deal"],
  mutationFn: async (payload: IDealFormState) => {
    const databaseId = config.public.dbId;
    const collectionId = config.public.collectionDeals;

    if (!databaseId || !collectionId) {
      throw new Error("Appwrite config is missing");
    }

    return $appwrite.databases.createDocument(
      databaseId,
      collectionId,
      uuid(),
      payload,
    );
  },
  onSuccess: async () => {
    form.value = {
      name: "",
      price: 0,
      customer: {
        email: "",
        name: "",
      },
      status: props.status || "todo",
    };

    isOpenForm.value = false;
    await props.refetch?.();
  },
});

const isFormValid = computed(() => {
  return (
    form.value.name.trim() !== "" &&
    form.value.price > 0 &&
    form.value.customer.name.trim() !== "" &&
    form.value.customer.email.trim() !== ""
  );
});

const submitDeal = () => {
  if (!isFormValid.value) return;
  
  createDealMutation.mutate({
    ...form.value,
    status: form.value.status || props.status || "todo",
  });
};
</script>

<style scoped>
.wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.btn {
  border: none;
  background: transparent;
  border-radius: 50%;
  width: 42px;
  height: 42px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 10px rgba(37, 99, 235, 0.25);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease,
    opacity 0.3s ease;
  opacity: 0.5;
}

.btn:hover {
  transform: translateY(-1px);
  opacity: 1;
  box-shadow: 0 6px 14px rgba(37, 99, 235, 0.3);
}
.add-icon,
.arrow-icon {
  color: #fff;
}
.deal-form {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 8px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 10px;
}

.deal-form__field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 13px;
  color: #334155;
}

.deal-form__field input {
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 6px 8px;
}

.deal-form__submit {
  border: none;
  border-radius: 6px;
  padding: 8px;
  background: #0f172a;
  color: white;
  cursor: pointer;
}

.deal-form__submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.deal-form__error {
  color: #dc2626;
  font-size: 12px;
  margin: 0;
}
</style>
