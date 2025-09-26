<template>
  <!-- 교육 여부 팝업창 -->
  <div
    v-if="showPopup"
    class="fixed inset-0 bg-[rgba(0,0,0,0.75)] flex justify-center items-center z-50"
  >
    <div class="bg-[#FFFEEF] p-8 rounded-lg shadow-xl text-center">
      <p class="text-xl font-bold mb-4">{{ popupMessage }}</p>
      <button
        @click="showPopup = false"
        class="bg-[#1D1A05] hover:bg-black text-[#FFEA00] font-bold py-2 px-8 rounded"
      >
        확인
      </button>
    </div>
  </div>

  <!-- 전체 배경 설정 -->
  <div class="background-out flex justify-center items-center">
    <div class="background-in">
      <!-- 상단 내비게이션 설정 -->
      <header class="head-setting mb-15">
        <!-- 홈으로 이동 -->
        <router-link to="/main" class="heed-text">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2.5"
            stroke="#78711D"
            class="w-6 h-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15.75 19.5 8.25 12l7.5-7.5"
            />
          </svg>
        </router-link>

        <!-- 중앙 제목 -->
        <h1 class="text-3xl font-bold text-[#78711D]">안전 교육</h1>

        <!-- 우측 여백 -->
        <p></p>
      </header>

      <!-- 중앙 선택 박스 -->
      <main class="space-y-5">
        <!-- 기초안전교육 -->
        <router-link to="/educationview">
          <div class="small-box bg-[#1D1A05] md:px-12 md:py-10">
            <div>
              <p class="text-lg md:text-2xl font-bold text-[#FFEC17]">
                건설업 기초안전보건교육
              </p>
              <p
                v-if="basicEducationStatus === 'valid'"
                class="text-sm md:text-base font-bold text-[#3A9CFF] mt-1"
              >
                이수
              </p>
              <p
                v-else
                class="text-sm md:text-base font-bold text-[#FF0000] mt-1"
              >
                미이수
              </p>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="3"
              stroke="white"
              class="w-6 h-6 md:w-8 md:h-8"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m8.25 4.5 7.5 7.5-7.5 7.5"
              />
            </svg>
          </div>
        </router-link>

        <!-- 정기안전교육 -->
        <router-link to="/educationview">
          <div class="small-box bg-[#1D1A05] mt-5 md:px-12 md:py-10">
            <div>
              <p class="text-lg md:text-2xl font-bold text-[#FFEC17]">
                정기 안전보건교육
              </p>
              <p
                v-if="regularEducationStatus === 'valid'"
                class="text-sm md:text-base font-bold text-[#3A9CFF] mt-1"
              >
                이수
              </p>
              <p
                v-else
                class="text-sm md:text-base font-bold text-[#FF0000] mt-1"
              >
                미이수
              </p>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="3"
              stroke="white"
              class="w-6 h-6 md:w-8 md:h-8"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m8.25 4.5 7.5 7.5-7.5 7.5"
              />
            </svg>
          </div>
        </router-link>
      </main>

      <!-- 안전 시험 -->
      <footer class="mt-45 md:mt-56">
        <div
          @click="checkTestEligibility"
          :class="[
            'small-box',
            testStatus === 'pass' ? 'cursor-not-allowed' : 'cursor-pointer',
            'bg-[#FFEC17]',
            'md:px-12 md:py-10',
          ]"
        >
          <div>
            <p class="text-lg md:text-2xl font-bold text-[#1D1A05]">
              안전 시험
            </p>
            <p class="text-sm md:text-base font-bold mt-1">
              <span v-if="testStatus === 'none'" class="text-gray-500"
                >미응시</span
              >
              <span v-else-if="testStatus === 'pass'" class="text-blue-500"
                >합격</span
              >
              <span v-else-if="testStatus === 'fail'" class="text-red-500"
                >불합격</span
              >
            </p>
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="3"
            :stroke="'#1D1A05'"
            class="w-6 h-6 md:w-8 md:h-8"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="m8.25 4.5 7.5 7.5-7.5 7.5"
            />
          </svg>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const educationRaw = ref("none");
const testRaw = ref("none");

// 팝업
const showPopup = ref(false);
const popupMessage = ref("");

// 기본 교육 이수 여부: education이 'none'이면 미이수, 그 외(pass/expire)는 표기상 이수
const basicEducationStatus = computed(() => {
  return educationRaw.value === "none" ? "none" : "valid";
});

// 정기교육 유효성: pass=valid, expire=expired, none=none
const regularEducationStatus = computed(() => {
  if (educationRaw.value === "pass") return "valid";
  if (educationRaw.value === "expire") return "expired";
  return "none";
});

// 시험 상태 표시: pass | fail | none
const testStatus = computed(() => {
  if (testRaw.value === "pass") return "pass";
  return "none";
});

// 상태 조회
onMounted(async () => {
  // 세션 사용자(테스터 여부 판단)
  // 테스터 계정 제거됨: 항상 서버 상태 조회

  // 2) 일반 사용자: 서버 상태 조회
  try {
    const res = await fetch("https://doldariback-production.up.railway.app/api/user/education", {
      method: "GET",
      headers: { Accept: "application/json" },
      credentials: "include",
    });
    if (res.ok) {
      const data = await res.json();
      educationRaw.value = data?.education ?? "none";
      testRaw.value = data?.test ?? "none";
    } else {
      educationRaw.value = "none";
      testRaw.value = "none";
    }
  } catch (e) {
    educationRaw.value = "none";
    testRaw.value = "none";
  }

  // 상태 기반 안내 팝업
  if (regularEducationStatus.value === "expired") {
    popupMessage.value = "재교육 대상자입니다.";
    showPopup.value = true;
  } else if (regularEducationStatus.value === "none") {
    popupMessage.value = "기초교육 대상자입니다.";
    showPopup.value = true;
  }
});

const checkTestEligibility = () => {
  if (basicEducationStatus.value === "none") {
    popupMessage.value = "기초교육을 완수해야합니다.";
    showPopup.value = true;
    return;
  }

  if (testStatus.value === "pass") {
    return;
  }

  router.push("/education/test");
};
</script>
