<template>
  <!-- entryBlock 안내 팝업 -->
  <div v-if="showPopup" class="fixed inset-0 bg-[rgba(0,0,0,0.75)] flex justify-center items-center z-50">
    <div class="bg-[#FFFEEF] p-8 rounded-lg shadow-xl text-center">
      <p class="text-xl font-bold mb-4">{{ popupMessage }}</p>
      <button @click="showPopup = false" class="bg-[#1D1A05] hover:bg-black text-[#FFEA00] font-bold py-2 px-8 rounded">확인</button>
    </div>
  </div>

  <!-- 전체 배경 설정 -->
  <div class="background-out flex items-center justify-center">
    <div class="background-in">
      <!-- 상단 내비게이션 설정 -->
      <header class="head-setting">
        <p v-if="user" class="heed-text">{{ user.name }}님 환영합니다</p>
        <button @click="logout" class="heed-text">로그아웃</button>
      </header>

      <!-- 중앙 설정 -->
      <main class="main-setting w-full pt-10">
        <div class="w-full space-y-3 sm:space-y-5">
          <!-- 날씨 배너 -->
          <div class="w-full rounded-2xl bg-blue-50 border border-blue-200 px-4 py-5 sm:px-5 md:py-20" aria-label="현재 날씨">
            <!-- if: 작동 중인 날씨 위젯 (Test.vue 내용) -->
            <div v-if="isWeatherReady" class="flex items-stretch justify-between gap-4 text-black">
              <!-- 좌측: 아이콘 + 습도/풍속 -->
              <div class="flex-1 flex flex-col justify-between">
                <img :src="iconSrc" alt="weather" class="w-20 h-20 sm:w-24 sm:h-24 object-contain" />
                <div class="text-xs sm:text-sm">습도 {{ humidity ?? "-" }}% · 풍속 {{ windSpeedDisplay }} m/s</div>
              </div>

              <!-- 우측: 지역명, 현재기온, 체감온도 -->
              <div class="flex-1 flex flex-col items-end justify-between">
                <div class="text-[10px] sm:text-xs">{{ locationDisplay }}</div>
                <div class="text-4xl sm:text-5xl font-extrabold leading-none">{{ tempDisplay }}°C</div>
                <div class="text-xs sm:text-sm">체감온도 {{ feelsLikeDisplay }}°C</div>
              </div>
            </div>

            <!-- else: 기존 준비중 박스 -->
            <div v-else class="flex items-center justify-between px-4 py-10 sm:px-5 md:py-15">
              <div class="flex items-center gap-2 sm:gap-3 text-blue-800">
                <span class="material-symbols-outlined">cloud</span>
                <span class="font-semibold text-sm sm:text-base">날씨 준비중</span>
              </div>
              <span class="text-xs sm:text-sm text-blue-700">점검 중</span>
            </div>
          </div>

          <!-- 가운데 링크 박스 -->
          <div class="grid gap-4">
            <!-- 안전교육 링크 -->
            <router-link to="/education" class="brown-box px-8 py-6 sm:px-12 sm:py-10">
              <span class="text-2xl sm:text-4xl font-bold text-[#FFEC17]">안전교육</span>
            </router-link>

            <!-- 사고조치 링크 -->
            <router-link to="/safe" class="brown-box px-8 py-6 sm:px-12 sm:py-10">
              <span class="text-2xl sm:text-4xl font-bold text-[#FFEC17]">안전조치</span>
            </router-link>

            <!-- 오늘의 점검 링크 -->
            <router-link to="/check" class="brown-box px-8 py-6 sm:px-12 sm:py-10 sm:col-span-2 md:col-span-1">
              <span class="text-2xl sm:text-4xl font-bold text-[#FFEC17]">오늘의 점검</span>
            </router-link>
          </div>
        </div>

        <!-- 긴급전화 버튼: 모바일 높이/여백 축소 -->
        <button class="emergency-button py-7 mt-6 sm:mt-10" @mousedown="startPress" @mouseup="cancelPress" @mouseleave="cancelPress" @touchstart.prevent="startPress" @touchend="cancelPress" @touchcancel="cancelPress">
          <div class="absolute top-0 left-0 h-full bg-red-700 transition-all duration-100" :style="{ width: gaugeWidth + '%' }"></div>
          <span class="relative z-10 flex items-center justify-center gap-2 text-2xl sm:text-4xl">
            <span class="material-symbols-outlined"> call </span>
            긴급전화
          </span>
        </button>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useWeather } from "@/js/weather";
import { useRouter } from "vue-router";

const router = useRouter();
const user = ref(null);
const pressTimer = ref(null);
const gaugeInterval = ref(null);
const gaugeWidth = ref(0);
const pressDuration = 1500; // 1.5초 누르기

// entryBlock 팝업 상태
const showPopup = ref(false);
const popupMessage = ref("");

const logout = async () => {
  try {
    await fetch("http://doldariback-production.up.railway.app/api/auth/logout", {
      method: "POST",
      headers: { Accept: "application/json" },
      credentials: "include",
    });
  } catch (e) {
  } finally {
    sessionStorage.removeItem("loggedInUser");
    router.push("/login");
  }
};

// 긴급전화 설정
const startPress = () => {
  cancelPress();

  const updateRate = 30;
  const increment = 100 / (pressDuration / updateRate);
  gaugeInterval.value = setInterval(() => {
    gaugeWidth.value = Math.min(100, gaugeWidth.value + increment);
  }, updateRate);

  pressTimer.value = setTimeout(() => {
    makePhoneCall();
    cancelPress();
  }, pressDuration);
};

const cancelPress = () => {
  clearTimeout(pressTimer.value);
  clearInterval(gaugeInterval.value);
  pressTimer.value = null;
  gaugeInterval.value = null;
  gaugeWidth.value = 0;
};

// 긴급전화 전화번호
const makePhoneCall = () => {
  window.location.href = "tel:01039407145";
};

// 날씨 위젯: Test.vue와 동일한 composable 사용
const { state: wState, getters: wGetters, actions: wActions } = useWeather();
const { loading: wLoading, errorMsg: wError, humidity } = wState;
const { iconSrc, windSpeedDisplay, locationDisplay, tempDisplay, feelsLikeDisplay } = wGetters;
const isWeatherReady = computed(() => !wLoading.value && !wError.value);

onMounted(async () => {
  // 로그인 체크 로직
  const storedUser = sessionStorage.getItem("loggedInUser");
  if (storedUser) {
    user.value = JSON.parse(storedUser);
  } else {
    router.push("/");
  }

  // 날씨 초기화: 프로필 조회와 무관하게 즉시 실행
  wActions.initGeolocation();

  // 프로필 조회 및 entryBlock 안내
  try {
    const res = await fetch("http://doldariback-production.up.railway.app/api/user/profile", {
      method: "GET",
      headers: { Accept: "application/json" },
      credentials: "include",
    });
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data === "object") {
        // 사용자 정보 갱신(있으면 병합)
        user.value = { ...(user.value || {}), ...data };
      }

      // entryBlock 처리: 0=없음, 1=교육, 2=안전시험, 3=오늘의 점검
      const eb = Number(data?.entryBlock ?? 0);
      if (eb !== 0) {
        const entryMessages = {
          1: "안전 교육을 이수해주세요.",
          2: "안전 시험에 합격해주세요.",
          3: "오늘의 점검을 확인해주세요.",
        };
        const msg = entryMessages[eb] ?? "안내 사항을 확인해주세요.";
        popupMessage.value = msg;
        showPopup.value = true;
      }
    }
  } catch (e) {
    // 실패 시 조용히 진행
  }
});
</script>
