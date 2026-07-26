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

      <div class="deal-form__field">
        <span>Клієнт</span>
        <div class="customer-mode">
          <button
            type="button"
            class="mode-btn"
            :class="{ 'mode-btn--active': customerMode === 'existing' }"
            @click="setCustomerMode('existing')"
          >
            Існуючий
          </button>
          <button
            type="button"
            class="mode-btn"
            :class="{ 'mode-btn--active': customerMode === 'new' }"
            @click="setCustomerMode('new')"
          >
            Новий
          </button>
        </div>
      </div>

      <template v-if="customerMode === 'existing'">
        <div class="deal-form__field autocomplete" ref="autocompleteRef">
          <span>Пошук клієнта</span>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Введіть назву або email..."
            autocomplete="off"
            @focus="isDropdownOpen = true"
          />

          <div v-if="isDropdownOpen && filteredCustomers.length" class="dropdown">
            <button
              v-for="customer in filteredCustomers"
              :key="customer.$id"
              type="button"
              class="dropdown-item"
              @click="selectCustomer(customer)"
            >
              <span class="dropdown-item-name">{{ customer.name }}</span>
              <span class="dropdown-item-email">{{ customer.email }}</span>
            </button>
          </div>

          <div v-else-if="isDropdownOpen && searchQuery && !filteredCustomers.length" class="dropdown dropdown--empty">
            Клієнтів не знайдено
          </div>
        </div>

        <div v-if="selectedCustomer" class="selected-customer">
          <div>
            <span class="selected-customer-name">{{ selectedCustomer.name }}</span>
            <span class="selected-customer-email">{{ selectedCustomer.email }}</span>
          </div>
          <button type="button" class="selected-customer-clear" @click="clearSelectedCustomer">
            <Icon name="material-symbols:close" />
          </button>
        </div>
      </template>

      <template v-else>
        <label class="deal-form__field">
          <span>Ім'я нового клієнта</span>
          <input v-model="newCustomer.name" required />
        </label>

        <label class="deal-form__field">
          <span>Email нового клієнта</span>
          <input v-model="newCustomer.email" type="email" required />
        </label>
      </template>

      <button
        type="submit"
        class="deal-form__submit"
        :disabled="createDealMutation.isPending.value || !isFormValid"
      >
        {{ createDealMutation.isPending.value ? "Створення..." : "Створити" }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onBeforeUnmount } from "vue";
import { useMutation, useQuery } from "@tanstack/vue-query";
import { v4 as uuid } from "uuid";
import type { ICustomer } from "~/types/deals.types";

const props = defineProps<{
  status?: string;
  refetch?: () => void | Promise<unknown>;
}>();

interface IDealFormState {
  name: string;
  price: number;
  status: string;
}

const isOpenForm = ref(false);
const customerMode = ref<"existing" | "new">("existing");
const selectedCustomerId = ref<string>("");
const searchQuery = ref("");
const isDropdownOpen = ref(false);
const autocompleteRef = ref<HTMLDivElement | null>(null);

const newCustomer = ref({
  name: "",
  email: "",
});

const { $appwrite } = useNuxtApp();
const config = useRuntimeConfig();
const toast = useToast();

const databaseId = config.public.dbId;
const collectionId = config.public.collectionDeals;
const collectionCustomers = config.public.collectionCustomers;

const form = ref<IDealFormState>({
  name: "",
  price: 0,
  status: props.status || "todo",
});

watch(
  () => props.status,
  (value) => {
    form.value.status = value || "todo";
  },
  { immediate: true },
);

const { data: customersData } = useQuery({
  queryKey: ["customers", "create-deal"],
  queryFn: async () => {
    if (!databaseId || !collectionCustomers) {
      return [];
    }
    const result = await $appwrite.databases.listDocuments(
      databaseId,
      collectionCustomers,
    );
    return (result.documents as unknown as ICustomer[]) || [];
  },
  staleTime: 30000,
});

const customers = computed(() => customersData.value || []);

const filteredCustomers = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) return customers.value;

  return customers.value.filter(
    (customer) =>
      customer.name.toLowerCase().includes(query) ||
      customer.email.toLowerCase().includes(query),
  );
});

const selectedCustomer = computed(() =>
  customers.value.find((customer) => customer.$id === selectedCustomerId.value),
);

const setCustomerMode = (mode: "existing" | "new") => {
  customerMode.value = mode;
  if (mode === "existing") {
    newCustomer.value = { name: "", email: "" };
  } else {
    selectedCustomerId.value = "";
    searchQuery.value = "";
  }
};

const selectCustomer = (customer: ICustomer) => {
  selectedCustomerId.value = customer.$id;
  searchQuery.value = customer.name;
  isDropdownOpen.value = false;
};

const clearSelectedCustomer = () => {
  selectedCustomerId.value = "";
  searchQuery.value = "";
};

const handleClickOutside = (event: MouseEvent) => {
  if (
    autocompleteRef.value &&
    !autocompleteRef.value.contains(event.target as Node)
  ) {
    isDropdownOpen.value = false;
  }
};

onBeforeUnmount(() => {
  document.removeEventListener("mousedown", handleClickOutside);
});

watch(isDropdownOpen, (isOpen) => {
  if (isOpen) {
    document.addEventListener("mousedown", handleClickOutside);
  } else {
    document.removeEventListener("mousedown", handleClickOutside);
  }
});

const createDealMutation = useMutation({
  mutationKey: ["create-deal"],
  mutationFn: async (payload: IDealFormState) => {
    if (!databaseId || !collectionId) {
      throw new Error("Appwrite config is missing");
    }

    let customerId: string;

    if (customerMode.value === "new") {
      if (!newCustomer.value.name.trim() || !newCustomer.value.email.trim()) {
        throw new Error("Заповніть дані нового клієнта");
      }

      const createdCustomer = await $appwrite.databases.createDocument(
        databaseId,
        collectionCustomers,
        uuid(),
        {
          name: newCustomer.value.name.trim(),
          email: newCustomer.value.email.trim().toLowerCase(),
          avatar_url: "",
        },
      );

      customerId = createdCustomer.$id;
    } else {
      if (!selectedCustomerId.value) {
        throw new Error("Оберіть клієнта");
      }
      customerId = selectedCustomerId.value;
    }

    return $appwrite.databases.createDocument(
      databaseId,
      collectionId,
      uuid(),
      {
        name: payload.name.trim(),
        price: payload.price,
        status: payload.status,
        customer: customerId,
      },
    );
  },
  onSuccess: async () => {
    form.value = {
      name: "",
      price: 0,
      status: props.status || "todo",
    };
    newCustomer.value = { name: "", email: "" };
    selectedCustomerId.value = "";
    searchQuery.value = "";
    isOpenForm.value = false;
    await nextTick();

    toast.add({
      title: "Угоду успішно створено",
      color: "success",
    });

    await props.refetch?.();
  },
  onError: (error: any) => {
    toast.add({
      title: error?.message || "Не вдалося створити угоду",
      color: "error",
    });
  },
});

const isFormValid = computed(() => {
  const baseValid =
    form.value.name.trim() !== "" && form.value.price > 0;

  if (!baseValid) return false;

  if (customerMode.value === "new") {
    return (
      newCustomer.value.name.trim() !== "" &&
      newCustomer.value.email.trim() !== ""
    );
  }

  return selectedCustomerId.value !== "";
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
  font-size: 13px;
}

.customer-mode {
  display: flex;
  gap: 4px;
}

.mode-btn {
  flex: 1;
  padding: 6px 8px;
  font-size: 12px;
  font-weight: 500;
  color: #64748b;
  background-color: #f1f5f9;
  border: 1px solid transparent;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.mode-btn:hover {
  background-color: #e2e8f0;
}

.mode-btn--active {
  color: #0f172a;
  background-color: #e2e8f0;
  border-color: #94a3b8;
}

.autocomplete {
  position: relative;
}

.dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  max-height: 200px;
  overflow-y: auto;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 100;
  margin-top: 4px;
}

.dropdown--empty {
  padding: 10px;
  font-size: 12px;
  color: #94a3b8;
  text-align: center;
}

.dropdown-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  width: 100%;
  padding: 8px 10px;
  text-align: left;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: background 0.15s;
}

.dropdown-item:hover {
  background-color: #f8fafc;
}

.dropdown-item-name {
  font-size: 13px;
  font-weight: 500;
  color: #0f172a;
}

.dropdown-item-email {
  font-size: 11px;
  color: #64748b;
}

.selected-customer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 10px;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
}

.selected-customer-name {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #0f172a;
}

.selected-customer-email {
  display: block;
  font-size: 11px;
  color: #64748b;
}

.selected-customer-clear {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  transition: color 0.2s;
}

.selected-customer-clear:hover {
  color: #ef4444;
}

.selected-customer-clear svg {
  font-size: 16px;
}

.deal-form__submit {
  border: none;
  border-radius: 6px;
  padding: 8px;
  background: #0f172a;
  color: white;
  cursor: pointer;
  font-weight: 500;
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
