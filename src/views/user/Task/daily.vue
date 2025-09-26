<template>
  <!-- 교육 팝업 -->
  <div v-if="showPopup" class="fixed inset-0 bg-[rgba(0,0,0,0.75)] flex justify-center items-center z-50">
    <div class="bg-[#FFFEEF] p-6 rounded-lg shadow-xl w-11/12 max-w-md">
      <h2 class="text-xl font-bold mb-2">{{ popupData?.title }}</h2>
      <p class="text-sm text-gray-700 mb-3" v-if="popupData?.subtitle">{{ popupData.subtitle }}</p>
      <ul class="list-disc pl-5 text-sm text-gray-800 space-y-1 mb-4">
        <li v-for="(line, idx) in popupData?.content || []" :key="idx">{{ line }}</li>
      </ul>
      <p class="text-xs text-gray-500 mb-4" v-if="popupData?.footer">{{ popupData.footer }}</p>
      <div class="flex items-center justify-between">
        <span class="text-sm text-gray-600">완료 가능까지 {{ remaining }}초</span>
        <button :disabled="remaining > 0" @click="completeCurrent" :class="['py-2 px-4 rounded font-bold', remaining > 0 ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-[#1D1A05] text-[#FFEA00]']">완료</button>
      </div>
    </div>
  </div>

  <div class="background-out flex justify-center items-center">
    <div class="background-in w-full">
      <header class="head-setting mb-15">
        <router-link to="/main" class="heed-text">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="#78711D" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>
        </router-link>
        <h1 class="text-3xl font-bold text-[#78711D]">오늘의 점검/교육</h1>
        <p></p>
      </header>

      <main class="w-full space-y-6 sm:space-y-8">
        <div v-if="loading" class="text-center text-gray-600 py-10">불러오는 중…</div>
        <div v-else-if="error" class="text-center text-red-600 py-10">{{ error }}</div>
        <div v-else class="grid gap-3">
          <button v-for="item in items" :key="item.dailyTrainingId" @click="handleClick(item)" :class="buttonClass(item)" class="flex items-center justify-between px-4 py-4 rounded-2xl border">
            <span class="font-bold text-base sm:text-lg">{{ item.taskName }}</span>
            <span class="text-sm sm:text-base font-semibold">{{ item.done ? "이수" : "미이수" }}</span>
          </button>
        </div>

        <!-- 리더 전용: 팀원 교육 현황 -->
        <section v-if="isLeader" class="mt-6">
          <h2 class="text-2xl font-bold text-[#78711D] mb-3">팀원 교육 현황</h2>
          <div v-if="teamLoading" class="text-center text-gray-600 py-6">팀 현황 불러오는 중…</div>
          <div v-else-if="teamError" class="text-center text-red-600 py-6">{{ teamError }}</div>
          <div v-else class="space-y-4">
            <div v-for="member in teamStatus" :key="member.userId" class="rounded-xl border border-gray-200 bg-white overflow-hidden">
              <div class="px-4 py-3 bg-gray-50 flex items-center justify-between">
                <span class="font-semibold text-gray-800">{{ member.userName }}</span>
                <span class="text-xs text-gray-500">ID: {{ member.userId }}</span>
              </div>
              <div class="divide-y">
                <div v-for="(dt, idx) in member.dailyTrainings || []" :key="idx" class="flex items-center justify-between px-4 py-3">
                  <span class="text-sm font-medium">{{ dt.taskName }}</span>
                  <span :class="dt.done ? 'text-green-700 font-semibold' : 'text-gray-600'">{{ dt.done ? "이수" : "미이수" }}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

// 간단 매핑: TRAINING_01 -> import 모듈 및 데이터 추출 함수
// 여기서는 동적 임포트 사용(코드 스플리팅)
const trainingMap = {
  TRAINING_01: () => import("@/js/TRAINING/TRAINING_01.js").then((m) => ({ title: m.training01?.title, subtitle: m.training01?.subtitle, content: m.training01?.content, footer: m.training01?.footer })),
  TRAINING_02: () => import("@/js/TRAINING/TRAINING_02.js").then((m) => ({ title: m.training02?.title, subtitle: m.training02?.subtitle, content: m.training02?.content, footer: m.training02?.footer })),
  TRAINING_03: () => import("@/js/TRAINING/TRAINING_03.js").then((m) => ({ title: m.training03?.title, subtitle: m.training03?.subtitle, content: m.training03?.content, footer: m.training03?.footer })),
  TRAINING_04: () => import("@/js/TRAINING/TRAINING_04.js").then((m) => ({ title: m.training04?.title, subtitle: m.training04?.subtitle, content: m.training04?.content, footer: m.training04?.footer })),
  TRAINING_05: () => import("@/js/TRAINING/TRAINING_05.js").then((m) => ({ title: m.training05?.title, subtitle: m.training05?.subtitle, content: m.training05?.content, footer: m.training05?.footer })),
  TRAINING_06: () => import("@/js/TRAINING/TRAINING_06.js").then((m) => ({ title: m.training06?.title, subtitle: m.training06?.subtitle, content: m.training06?.content, footer: m.training06?.footer })),
  TRAINING_07: () => import("@/js/TRAINING/TRAINING_07.js").then((m) => ({ title: m.training07?.title, subtitle: m.training07?.subtitle, content: m.training07?.content, footer: m.training07?.footer })),
  TRAINING_08: () => import("@/js/TRAINING/TRAINING_08.js").then((m) => ({ title: m.training08?.title, subtitle: m.training08?.subtitle, content: m.training08?.content, footer: m.training08?.footer })),
};

const items = ref([]);
const loading = ref(false);
const error = ref("");

// 리더 프로필/팀 현황
const isLeader = ref(false);
const teamStatus = ref([]);
const teamLoading = ref(false);
const teamError = ref("");

// 팝업 상태
const showPopup = ref(false);
const popupData = ref(null);
const remaining = ref(5);
let timer = null;
let currentItem = null;

const fetchToday = async () => {
  loading.value = true;
  error.value = "";
  try {
    const res = await fetch("https://doldariback-production.up.railway.app/api/user/today", {
      method: "GET",
      headers: { Accept: "application/json" },
      credentials: "include",
    });
    if (!res.ok) throw new Error("목록을 불러오지 못했습니다");
    const data = await res.json();
    items.value = Array.isArray(data) ? data : [];
  } catch (e) {
    error.value = e?.message || "오류가 발생했습니다";
  } finally {
    loading.value = false;
  }
};

const buttonClass = (item) => {
  return [item.done ? "bg-green-100 border-green-300 text-green-900" : "bg-gray-100 border-gray-300 text-gray-700"];
};

const handleClick = async (item) => {
  if (item.done) return; // 이수는 무시
  try {
    const loader = trainingMap[item.trainingCode];
    if (!loader) throw new Error("교육 자료가 없습니다");
    popupData.value = await loader();
    currentItem = item;
    remaining.value = 5;
    showPopup.value = true;
    startCountdown();
  } catch (e) {
    alert(e?.message || "교육 자료를 불러오지 못했습니다");
  }
};

const startCountdown = () => {
  clearInterval(timer);
  timer = setInterval(() => {
    if (remaining.value > 0) remaining.value -= 1;
    if (remaining.value <= 0) {
      clearInterval(timer);
      timer = null;
    }
  }, 1000);
};

const completeCurrent = async () => {
  if (!currentItem) return;
  try {
    const res = await fetch("https://doldariback-production.up.railway.app/api/user/today/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      credentials: "include",
      body: JSON.stringify({ dailyTrainingId: currentItem.dailyTrainingId }),
    });
    if (!res.ok) {
      const msg = await res.text();
      throw new Error(msg || "완료 처리 실패");
    }
    // 성공: 목록 갱신(로컬 업데이트 또는 재조회)
    items.value = items.value.map((it) => (it.dailyTrainingId === currentItem.dailyTrainingId ? { ...it, done: true, doneDate: new Date().toISOString() } : it));
    showPopup.value = false;
    popupData.value = null;
    currentItem = null;
  } catch (e) {
    alert(e?.message || "완료 중 오류");
  }
};

onMounted(() => {
  fetchToday();
  // 프로필에서 role 확인 후, 리더면 팀 현황 로드
  fetchProfileAndMaybeTeam();
});

const fetchProfileAndMaybeTeam = async () => {
  try {
    const res = await fetch("https://doldariback-production.up.railway.app/api/user/profile", {
      method: "GET",
      headers: { Accept: "application/json" },
      credentials: "include",
    });
    if (res.ok) {
      const data = await res.json();
      const role = String(data?.role || "").toLowerCase();
      isLeader.value = role === "leader";
      if (isLeader.value) {
        // siteId는 로그인 시 세션에 저장된 값을 사용
        const su = sessionStorage.getItem("loggedInUser");
        const parsed = su ? JSON.parse(su) : null;
        const siteId = parsed?.siteId ?? parsed?.site?.id ?? null;
        if (siteId == null) {
          teamError.value = "현장 식별자(siteId)를 찾을 수 없습니다.";
        } else {
          await fetchTeamStatus(siteId);
        }
      }
    }
  } catch (e) {
    // 조용히 무시
  }
};

const fetchTeamStatus = async (siteId) => {
  teamLoading.value = true;
  teamError.value = "";
  try {
    // 제공된 엔드포인트 사용
    const res = await fetch(`https://doldariback-production.up.railway.app/api/location/sites/${siteId}/training-status`, {
      method: "GET",
      headers: { Accept: "application/json" },
      credentials: "include",
    });
    if (!res.ok) throw new Error("팀 현황을 불러오지 못했습니다");
    const data = await res.json();
    teamStatus.value = Array.isArray(data) ? data : [];
  } catch (e) {
    teamError.value = e?.message || "오류가 발생했습니다";
  } finally {
    teamLoading.value = false;
  }
};
</script>

<style scoped></style>
