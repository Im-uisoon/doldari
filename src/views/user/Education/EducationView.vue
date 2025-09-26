<template>
  <div
    v-if="isFullscreen"
    @click="closeFullscreen"
    class="fixed inset-0 bg-[rgba(0,0,0,0.85)] flex justify-center items-center z-50 p-4"
  >
    <img
      :src="fullscreenContent"
      class="max-w-full max-h-full object-contain"
    />
    <button class="absolute top-4 right-4 text-white text-4xl font-bold">
      &times;
    </button>
  </div>

  <!-- 전체 배경 설정 -->
  <div class="background-out flex items-center justify-center">
    <div class="background-in md:max-w-2xl lg:max-w-3xl">
      <!-- 상단 내비게이션 설정 -->
      <header class="head-setting mb-10 md:mb-12">
        <!-- 홈으로 이동 -->
        <router-link to="/education" class="heed-text">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2.5"
            stroke="#78711D"
            class="w-6 h-6 md:w-8 md:h-8"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15.75 19.5 8.25 12l7.5-7.5"
            />
          </svg>
        </router-link>

        <!-- 중앙 제목 -->
        <h1 class="text-3xl md:text-4xl font-bold text-[#78711D]">
          정기 안전보건교육
        </h1>

        <!-- 우측 여백 -->
        <p></p>
      </header>

      <!-- 중앙 교육 박스 -->
      <div
        class="h-100 w-full bg-[#1D1A05] rounded-3xl p-5 md:p-8 lg:p-10 md:min-h-[720px] text-white overflow-y-auto flex flex-col"
      >
        <!-- 콘텐츠 래퍼: 이미지 또는 마지막 텍스트 페이지에서만 중앙 정렬 -->
        <div
          :class="[
            'flex-1 w-full',
            currentPageData.type === 'image' || isLastPage
              ? 'flex items-center justify-center'
              : '',
          ]"
        >
          <template v-if="currentPageData.type === 'text'">
            <div
              v-html="currentPageData.content"
              :class="[
                isLastPage ? 'text-center' : 'text-left',
                'md:text-xl md:leading-relaxed',
              ]"
            ></div>
          </template>
          <template v-else-if="currentPageData.type === 'image'">
            <img
              :src="currentPageData.content"
              alt="Education Content"
              class="max-w-full h-auto md:max-h-[70vh] object-contain cursor-pointer md:rounded-xl mx-auto"
              @click="openFullscreen(currentPageData.content)"
            />
          </template>
        </div>

        <!-- 미이수자 교육 완료 버튼 -->
        <div v-if="isLastPage" class="my-4 text-center flex-shrink-0 mt-30">
          <button
            v-if="educationStatus !== 'valid'"
            @click="completeEducation"
            :disabled="submitting"
            class="w-full bg-black hover:bg-zinc-900 disabled:opacity-60 disabled:cursor-not-allowed border border-[#3A9CFF] text-[#3A9CFF] font-bold py-3 md:py-4 px-4 md:text-lg rounded-lg"
          >
            {{ submitting ? "처리 중..." : "교육 이수 완료" }}
          </button>
        </div>
      </div>

      <!-- 하단 페이지 네비게이션 -->
      <footer class="page-box">
        <!-- 페이지 좌측 -->
        <button @click="prevPage" :disabled="isFirstPage" class="page-button">
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
        <p class="text-lg md:text-2xl font-bold text-[#78711D]">
          {{ currentPageIndex + 1 }} / {{ courseData.length }}
        </p>

        <!-- 페이지 우측 -->
        <button @click="nextPage" :disabled="isLastPage" class="page-button">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="3"
            stroke="currentColor"
            class="w-6 h-6 md:w-8 md:h-8"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="m8.25 4.5 7.5 7.5-7.5 7.5"
            />
          </svg>
        </button>
      </footer>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";

// 교육 자료
const courseData = [
  {
    type: "image",
    content: `${import.meta.env.BASE_URL}education/education1.jpg`,
  },
  {
    type: "image",
    content: `${import.meta.env.BASE_URL}education/education2.jpg`,
  },
  {
    type: "image",
    content: `${import.meta.env.BASE_URL}education/education3.jpg`,
  },
  {
    type: "image",
    content: `${import.meta.env.BASE_URL}education/education4.jpg`,
  },
  {
    type: "image",
    content: `${import.meta.env.BASE_URL}education/education5.jpg`,
  },
  {
    type: "image",
    content: `${import.meta.env.BASE_URL}education/education6.jpg`,
  },
  {
    type: "image",
    content: `${import.meta.env.BASE_URL}education/education7.jpg`,
  },
  {
    type: "image",
    content: `${import.meta.env.BASE_URL}education/education8.jpg`,
  },
  {
    type: "image",
    content: `${import.meta.env.BASE_URL}education/education9.jpg`,
  },
  {
    type: "text",
    content: `<p class='text-lg text-center text-blue-500 md:text-3xl'>교육자료 출처<br>산업안전보건공단</p><br>
      <p class='text-lg text-center text-red-500 md:text-3xl'>[ 안전 10계명 ]</p><br>
      <p><span class='text-blue-500'>1. 안전모, 안전화 등 보호구 착용:</span>  <br>현장에서는 반드시 지정된 개인 보호구를 착용해야 합니다.</p><br>
      <p><span class='text-blue-500'>2. 작업 전 안전 점검:</span>  <br>작업을 시작하기 전에 장비와 주변 환경을 점검하여 위험 요인을 확인합니다.</p><br>
      <p><span class='text-blue-500'>3. 위험 지역 접근 금지:</span>  <br>출입이 통제된 구역이나 위험 표지가 있는 곳은 절대 들어가지 않습니다.</p><br>
      <p><span class='text-blue-500'>4. 안전 통로 이용:</span>  <br>작업장 내 정해진 안전 통로로만 이동합니다.</p><br>
      <p><span class='text-blue-500'>5. 고소 작업 시 안전벨트 착용:</span>  <br>높은 곳에서 작업할 때는 추락 방지를 위해 안전벨트를 착용하고 안전대를 걸어야 합니다.</p><br>
      <p><span class='text-blue-500'>6. 전기 장비 주의:</span>  <br>전기 관련 작업이나 장비 사용 시에는 누전이나 감전 위험에 항상 주의합니다.</p><br>
      <p><span class='text-blue-500'>7. 정해진 작업 순서 준수:</span>  <br>임의로 작업 순서를 바꾸지 않고 정해진 절차대로 작업합니다.</p><br>
      <p><span class='text-blue-500'>8. 안전 교육 이수:</span>  <br>주기적으로 실시하는 안전 교육에 빠짐없이 참여하여 안전 지식을 습득합니다.</p><br>
      <p><span class='text-blue-500'>9. 음주 작업 금지:</span>  <br>음주 상태에서는 절대 작업하지 않습니다.</p><br>
      <p><span class='text-blue-500'>10. 안전 수칙 준수:</span>  <br>어떤 상황에서도 안전 수칙을 최우선으로 생각하고 준수합니다.</p>`,
  },
  {
    type: "text",
    content:
      "<p class=' text-center'>모든 교육 내용을 숙지하셨습니다.</p> <br><br><br><br> <p class='text-lg text-center text-blue-500'>아래 버튼을 눌러 <br>교육을 완료하세요.</p>",
  },
];

// 사용자, 교육 이수 상태 로직
const router = useRouter();
const user = computed(() => {
  const storedUser = sessionStorage.getItem("loggedInUser");
  return storedUser ? JSON.parse(storedUser) : null;
});

// 날짜 파싱 유틸 (YY 또는 YYYY 모두 지원)
function parseCompletionDate(str) {
  if (!str || str === "none") return null;
  const parts = String(str).split("-");
  if (parts.length !== 3) return null;
  let [y, m, d] = parts;
  if (y.length === 2) y = `20${y}`;
  const year = Number(y);
  const month = Number(m);
  const day = Number(d);
  if ([year, month, day].some((n) => Number.isNaN(n))) return null;
  const dt = new Date(year, month - 1, day);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

const educationStatus = computed(() => {
  const str = user.value?.educationCompletionDate;
  const completionDate = parseCompletionDate(str);
  if (!completionDate) return "none";
  const expiryDate = new Date(completionDate);
  expiryDate.setMonth(expiryDate.getMonth() + 3);
  const today = new Date();
  return today >= expiryDate ? "expired" : "valid";
});

const submitting = ref(false);

const completeEducation = async () => {
  if (!user.value || submitting.value) return;
  submitting.value = true;
  try {
    const today = new Date();
    const year = String(today.getFullYear()); // YYYY
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const todayStr = `${year}-${month}-${day}`;
    // 서버에 교육 이수 상태 갱신 요청 (endpoint 변경)
    const res = await fetch(
      "https://doldariback-production.up.railway.app/api/user/education-leaning",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          education: "pass",
          educationDate: todayStr,
        }),
      }
    );
    if (!res.ok) {
      // 실패 시 사용자에게 알림
      alert("교육 이수 처리에 실패했습니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    // 성공 시 세션의 사용자 정보도 동기화
    user.value.educationCompletionDate = todayStr;
    // 새 스펙 호환을 위해 education 상태도 갱신
    user.value.education = "pass";
    sessionStorage.setItem("loggedInUser", JSON.stringify(user.value));

    // 안전 교육 메인으로 이동
    router.push("/education");
  } catch (e) {
    alert("네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
  } finally {
    submitting.value = false;
  }
};

// 페이지 뷰어 로직
const currentPageIndex = ref(0);
const isFullscreen = ref(false);
const fullscreenContent = ref("");

const currentPageData = computed(() => courseData[currentPageIndex.value]);
const isFirstPage = computed(() => currentPageIndex.value === 0);
const isLastPage = computed(
  () => currentPageIndex.value === courseData.length - 1
);

const nextPage = () => {
  if (!isLastPage.value) currentPageIndex.value++;
};

const prevPage = () => {
  if (!isFirstPage.value) currentPageIndex.value--;
};

const openFullscreen = (imageUrl) => {
  fullscreenContent.value = imageUrl;
  isFullscreen.value = true;
};

const closeFullscreen = () => {
  isFullscreen.value = false;
};
</script>

<style scoped>
.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
}
</style>
