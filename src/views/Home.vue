<template>
  <!-- 전체 배경 설정 -->
  <div class="background-out">
    <div
      class="background-in min-h-screen flex flex-col justify-center items-center gap-6"
    >
      <!-- 중앙 설정 -->
      <main class="main-setting w-full">
        <!-- 타이틀 영역 -->
        <div class="text-center mb-4">
          <h2
            class="text-2xl sm:text-3xl md:text-4xl font-bold text-[#78711D] mb-2"
          >
            환영합니다!
          </h2>
          <p class="text-sm sm:text-base text-[#78711D]">
            안전하게 일하는 그날까지, 돌다리!
          </p>
        </div>

        <!-- 컨텐츠(페이지) 영역 -->
        <div
          class="brown-box min-h-[280px] sm:min-h-[340px] md:min-h-[400px] p-4 sm:p-6"
        >
          <div class="max-w-lg mx-auto w-full flex items-start gap-3 sm:gap-4">
            <!-- 번호 원 -->
            <div
              class="flex-shrink-0 w-8 h-8 sm:w-8 sm:h-8 bg-yellow-400 rounded-full flex items-center justify-center text-amber-900 font-bold text-sm"
            >
              {{ currentPage.num }}
            </div>
            <!-- 텍스트 -->
            <div class="text-left">
              <h3
                class="text-2xl md:text-2xl font-semibold text-yellow-300 mb-1 sm:mb-2"
              >
                {{ currentPage.title }}
              </h3>
              <p class="text-lg md:text-xl text-gray-300">
                {{ currentPage.desc }}
              </p>
            </div>
          </div>
        </div>

        <!-- 페이지 네비게이션 -->
        <footer class="page-box">
          <!-- 페이지 좌측 -->
          <button @click="prevPage" class="page-button">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="3"
              stroke="currentColor"
              class="w-6 h-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M15.75 19.5 8.25 12l7.5-7.5"
              />
            </svg>
          </button>

          <!-- 페이지 인덱스 -->
          <p class="text-lg font-bold text-[#78711D]">
            {{ currentPageIndex + 1 }} / {{ courseData.length }}
          </p>

          <!-- 페이지 우측 -->
          <button @click="nextPage" class="page-button">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="3"
              stroke="currentColor"
              class="w-6 h-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m8.25 4.5 7.5 7.5-7.5 7.5"
              />
            </svg>
          </button>
        </footer>

        <!-- 로그인 버튼 -->
        <div class="mt-4 w-full">
          <router-link
            to="/login"
            class="login-button bg-[#FFEC17] hover:bg-yellow-300 text-black py-3 sm:py-4 px-6 sm:px-8 text-base sm:text-lg transition-colors inline-flex items-center space-x-2 w-full justify-center"
          >
            <span>로그인하기</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2"
              stroke="currentColor"
              class="w-4 h-4 sm:w-5 sm:h-5"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
              />
            </svg>
          </router-link>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

// 페이지 데이터
const courseData = [
  {
    num: 1,
    title: "안전관리 가능",
    desc: "현장의 안전 상황을 실시간으로 모니터링하고 체계적으로 관리할 수 있습니다.",
  },
  {
    num: 2,
    title: "사고시 즉각 대응 가능",
    desc: "응급상황 발생 시 신속한 대응체계를 통해 피해를 최소화할 수 있습니다.",
  },
  {
    num: 3,
    title: "현장 관리 가능",
    desc: "다양한 현장의 상황을 통합적으로 관리하고 효율적으로 운영할 수 있습니다.",
  },
  {
    num: 4,
    title: "사고 예방·신속 대응 플랫폼",
    desc: "산업 현장의 각종 안전사고를 예방하고, 발생 시 즉각 대응하도록 설계된 온라인 플랫폼입니다.",
  },
  {
    num: 5,
    title: "현장 단위 등록·통합 관리",
    desc: "현장을 단위별로 등록해 데이터를 한 곳에서 체계적으로 관리할 수 있습니다.",
  },
  {
    num: 6,
    title: "정기 안전교육·온라인 시험",
    desc: "안전 교육과 온라인 시험으로 정기적인 교육 이수와 평가를 손쉽게 운영합니다.",
  },
  {
    num: 7,
    title: "즉각 신고 시스템",
    desc: "사고 발생 시 모바일로 즉시 신고하여 초기 대응 시간을 단축합니다.",
  },
  {
    num: 8,
    title: "사고 유형별 대응 요령 안내",
    desc: "사고 유형에 맞는 대응 절차를 안내해 현장에서 신속하고 올바르게 조치할 수 있게 돕습니다.",
  },
];

const currentPageIndex = ref(0);
const currentPage = computed(() => courseData[currentPageIndex.value]);

const isFirstPage = computed(() => currentPageIndex.value === 0);
const isLastPage = computed(
  () => currentPageIndex.value === courseData.length - 1
);

function nextPage() {
  // 마지막 페이지에서 첫 페이지로 순환
  currentPageIndex.value = isLastPage.value ? 0 : currentPageIndex.value + 1;
}

function prevPage() {
  // 첫 페이지에서 마지막 페이지로 순환
  currentPageIndex.value = isFirstPage.value
    ? courseData.length - 1
    : currentPageIndex.value - 1;
}
</script>
