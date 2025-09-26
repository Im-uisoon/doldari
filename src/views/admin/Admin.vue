<template>
  <!-- 전체 배경 설정 -->
  <div class="background-out">
    <div class="background-in">
      <!-- 상단 내비게이션 설정 -->
      <header class="head-setting">
        <p></p>
        <button @click="logout" class="heed-text select-none">로그아웃</button>
      </header>

      <!-- 중앙 설정 -->
      <main class="main-setting">
        <!-- 환영인사 -->
        <div class="flex flex-col justify-center items-left ml-5 w-full my-10 px-5 gap-2 select-none">
          <h1 class="font-bold text-[#78711D] text-5xl">{{ adminId }}님</h1>
          <h2 class="font-bold text-[#E3D435] text-2xl">환영합니다</h2>
        </div>

        <!-- 명단관리 버튼 -->
        <router-link to="/adminedit">
          <div class="yellow-box">
            <p>명단 관리</p>
          </div>
        </router-link>

        <!-- 작업지정 버튼 -->
        <router-link to="/admintask">
          <div class="yellow-box">
            <p>작업 지정</p>
          </div>
        </router-link>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const adminId = ref("관리자");

onMounted(() => {
  const storedAdminId = localStorage.getItem("loggedInAdminId");
  if (storedAdminId) {
    adminId.value = storedAdminId;
  }
});

const logout = async () => {
  try {
    await fetch("http://doldariback-production.up.railway.app/api/auth/logout", {
      method: "POST",
      headers: { Accept: "application/json" },
      credentials: "include",
    });
  } catch (e) {
    // 네트워크 오류는 무시하고 클라이언트 상태만 정리
  } finally {
    localStorage.removeItem("loggedInAdminId");
    router.push("/admin/login");
  }
};
</script>

<style scoped></style>
