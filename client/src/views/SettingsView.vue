<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ConfirmDialog } from '@/components/ui'
import { api, getErrorMessage } from '@/services/api'
import { usePortfolioStore } from '@/stores/portfolio'
import { useUserStore } from '@/stores/user'
import { formatDate } from '@/utils/format'

const router = useRouter()
const userStore = useUserStore()
const user = computed(() => userStore.user)

// ---- profile
const profile = ref({ username: '', email: '' })
const profileMessage = ref<{ type: 'success' | 'error'; text: string } | null>(null)
const isSavingProfile = ref(false)

// The profile arrives after the page on a hard reload, so fill the form when it does.
watch(
  user,
  (current) => {
    if (current) profile.value = { username: current.username, email: current.email }
  },
  { immediate: true }
)

const profileChanged = computed(
  () =>
    !!user.value &&
    (profile.value.username.trim() !== user.value.username ||
      profile.value.email.trim().toLowerCase() !== user.value.email)
)

async function saveProfile() {
  if (!profileChanged.value) return
  isSavingProfile.value = true
  profileMessage.value = null
  try {
    userStore.setUser(
      await api.updateMe({
        username: profile.value.username.trim(),
        email: profile.value.email.trim(),
      })
    )
    profileMessage.value = { type: 'success', text: 'Profile updated.' }
  } catch (error) {
    profileMessage.value = {
      type: 'error',
      text: getErrorMessage(error, 'Could not update your profile.'),
    }
  } finally {
    isSavingProfile.value = false
  }
}

// ---- password
const passwords = ref({ current: '', next: '', confirm: '' })
const passwordMessage = ref<{ type: 'success' | 'error'; text: string } | null>(null)
const isSavingPassword = ref(false)

async function savePassword() {
  const { current, next, confirm } = passwords.value
  if (!current || !next) {
    passwordMessage.value = { type: 'error', text: 'Enter your current and new password.' }
    return
  }
  if (next !== confirm) {
    passwordMessage.value = { type: 'error', text: 'The new passwords do not match.' }
    return
  }

  isSavingPassword.value = true
  passwordMessage.value = null
  try {
    await api.changePassword({ currentPassword: current, newPassword: next })
    passwords.value = { current: '', next: '', confirm: '' }
    passwordMessage.value = { type: 'success', text: 'Password changed.' }
  } catch (error) {
    passwordMessage.value = {
      type: 'error',
      text: getErrorMessage(error, 'Could not change your password.'),
    }
  } finally {
    isSavingPassword.value = false
  }
}

// ---- delete account
const isConfirmingDelete = ref(false)
const deleteError = ref('')
const isDeleting = ref(false)

async function deleteAccount() {
  isDeleting.value = true
  deleteError.value = ''
  try {
    await api.deleteMe()
    userStore.logout()
    usePortfolioStore().reset()
    await router.push({ name: 'Home' })
  } catch (error) {
    deleteError.value = getErrorMessage(error, 'Could not delete your account.')
  } finally {
    isDeleting.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-2xl">
    <h1 class="font-display mb-6 text-2xl font-bold text-white">Settings</h1>

    <p
      v-if="user?.isDemo"
      class="mb-5 rounded-md border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100"
    >
      This is a demo account with sample data. It is deleted automatically 24 hours after it was
      created. Anything you change here only affects your own copy.
    </p>

    <section class="panel p-5 sm:p-6" aria-labelledby="profile-heading">
      <h2 id="profile-heading" class="text-base font-semibold text-white">Profile</h2>
      <p v-if="user" class="text-dark-400 mt-1 text-sm">
        Member since {{ formatDate(user.createdAt) }}
      </p>
      <form class="mt-5 space-y-4" novalidate @submit.prevent="saveProfile">
        <div>
          <label for="settings-username" class="field-label">Username</label>
          <input
            id="settings-username"
            v-model="profile.username"
            type="text"
            autocomplete="username"
            autocapitalize="none"
            class="field"
          />
        </div>
        <div>
          <label for="settings-email" class="field-label">Email</label>
          <input
            id="settings-email"
            v-model="profile.email"
            type="email"
            autocomplete="email"
            class="field"
          />
        </div>
        <p
          v-if="profileMessage"
          :class="profileMessage.type === 'success' ? 'notice-success' : 'notice-error'"
          :role="profileMessage.type === 'success' ? 'status' : 'alert'"
        >
          {{ profileMessage.text }}
        </p>
        <button type="submit" class="btn-primary" :disabled="!profileChanged || isSavingProfile">
          Save profile
        </button>
      </form>
    </section>

    <section v-if="!user?.isDemo" class="panel mt-5 p-5 sm:p-6" aria-labelledby="password-heading">
      <h2 id="password-heading" class="text-base font-semibold text-white">Password</h2>
      <form class="mt-5 space-y-4" novalidate @submit.prevent="savePassword">
        <div>
          <label for="current-password" class="field-label">Current password</label>
          <input
            id="current-password"
            v-model="passwords.current"
            type="password"
            autocomplete="current-password"
            class="field"
          />
        </div>
        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label for="new-password" class="field-label">New password</label>
            <input
              id="new-password"
              v-model="passwords.next"
              type="password"
              autocomplete="new-password"
              class="field"
            />
          </div>
          <div>
            <label for="confirm-new-password" class="field-label">Confirm new password</label>
            <input
              id="confirm-new-password"
              v-model="passwords.confirm"
              type="password"
              autocomplete="new-password"
              class="field"
            />
          </div>
        </div>
        <p
          v-if="passwordMessage"
          :class="passwordMessage.type === 'success' ? 'notice-success' : 'notice-error'"
          :role="passwordMessage.type === 'success' ? 'status' : 'alert'"
        >
          {{ passwordMessage.text }}
        </p>
        <button type="submit" class="btn-primary" :disabled="isSavingPassword">
          Change password
        </button>
      </form>
    </section>

    <section class="panel mt-5 p-5 sm:p-6" aria-labelledby="delete-heading">
      <h2 id="delete-heading" class="text-base font-semibold text-white">Delete account</h2>
      <p class="text-dark-300 mt-1 text-sm">
        Permanently deletes your account and every transaction you have recorded.
      </p>
      <button
        type="button"
        class="btn border-danger-500/40 text-danger-300 hover:bg-danger-600/10 mt-4 border"
        @click="((deleteError = ''), (isConfirmingDelete = true))"
      >
        Delete my account
      </button>
    </section>

    <ConfirmDialog
      v-if="isConfirmingDelete"
      title="Delete your account?"
      confirm-label="Delete account"
      :error="deleteError"
      :is-working="isDeleting"
      @confirm="deleteAccount"
      @close="isConfirmingDelete = false"
    >
      Your account and all of its transactions will be deleted. This cannot be undone.
    </ConfirmDialog>
  </div>
</template>
