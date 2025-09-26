<template>
  <!-- 전체 배경 설정 -->
  <div class="background-out md:flex md:items-center md:justify-center">
    <div class="background-in">
      <!-- 상단 내비게이션 설정 -->
      <div class="head-setting md:mb-4">
        <p></p>
        <router-link to="/login" class="heed-text">일반 로그인</router-link>
      </div>

      <!-- 중앙 설정 -->
      <main class="main-setting">
        <!-- 로고 -->
        <img src="/doldari.png" class="w-50 h-50 md:w-80 md:h-80" />

        <!-- 로그인 폼 -->
        <div class="flex flex-col items-center w-full">
          <form
            @submit.prevent="login"
            class="flex flex-col mt-4 w-full mx-auto max-w-md sm:max-w-lg"
          >
            <!-- ID -->
            <div class="flex flex-col w-full mb-4">
              <label for="adminId" class="input-label m-3">ID</label>
              <input
                type="text"
                id="adminId"
                v-model="id"
                placeholder="user"
                class="input-box md:p-3"
              />
            </div>

            <!-- PW -->
            <div class="flex flex-col w-full mb-4">
              <label for="adminPw" class="input-label m-3">PW</label>
              <input
                type="password"
                id="adminPw"
                v-model="password"
                placeholder="user"
                class="input-box md:p-3"
              />
            </div>

            <p v-if="loginError" class="text-red-500 text-center mb-5 md:mb-3">
              입력하신 정보가 일치하지 않습니다
            </p>
            <div v-else class="mb-5 md:mb-3"></div>

            <!-- 로그인 -->
            <button
              type="submit"
              :disabled="isButtonDisabled || submitting"
              :class="{
                'bg-gray-300': isButtonDisabled || submitting,
                'bg-[#FFEC17] hover:bg-yellow-300':
                  !isButtonDisabled && !submitting,
              }"
              class="login-button mt-10"
            >
              {{ submitting ? "로그인 중..." : "로그인" }}
            </button>
          </form>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const id = ref("");
const password = ref("");
const loginError = ref(false);
const submitting = ref(false);

const isButtonDisabled = computed(() => {
  return !id.value || !password.value;
});

const login = async () => {
  if (isButtonDisabled.value || submitting.value) return;
  submitting.value = true;
  loginError.value = false;

  try {
    const res = await fetch("https://doldariback-production.up.railway.app/api/auth/admin-login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ id: id.value, password: password.value }),
    });

    if (!res.ok) {
      loginError.value = true;
      return;
    }

    // 성공 시 라우팅 및 가드용 로컬 스토리지 설정
    localStorage.setItem("loggedInAdminId", id.value);
    router.push("/admin");
  } catch (e) {
    loginError.value = true;
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped></style>
