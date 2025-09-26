<template>
  <!-- 전체 배경 설정 -->
  <div class="background-out">
    <div class="background-in md:max-w-2xl lg:max-w-3xl">
      <!-- 상단 내비게이션 설정 -->
      <header class="head-setting mb-16 md:mb-20">
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
        <h1 class="text-3xl md:text-4xl font-bold text-[#78711D]">안전 시험</h1>

        <!-- 우측 여백 -->
        <p></p>
      </header>

      <!-- 시험 본문 -->
      <main class="flex flex-col flex-grow">
        <!-- 시험지 -->
        <div
          v-if="currentQuestion < questions.length"
          class="flex flex-col flex-grow"
        >
          <!-- 시험 박스 -->
          <div
            class="brown-box text-white px-10 md:px-12 lg:px-14 h-50 md:min-h-[200px] select-none"
          >
            <h2 class="text-2xl md:text-3xl font-bold mb-4">
              {{ questions[currentQuestion].question }}
            </h2>
          </div>

          <!-- 답안 버튼 -->
          <div class="grid grid-cols-2 gap-4 md:gap-6 my-5 flex-grow h-50">
            <button
              v-for="(option, index) in questions[currentQuestion].options"
              :key="index"
              @click="checkAnswer(index)"
              :class="[
                'py-5 md:py-6 border rounded-md cursor-pointer md:text-lg',
                selectedOptionIndex === index
                  ? 'bg-black text-[#3A9CFF] border-[#3A9CFF]'
                  : 'bg-gray-100 border-gray-300 text-black hover:bg-gray-200',
              ]"
            >
              {{ option }}
            </button>
          </div>
          <!-- 다음 버튼 -->
          <button
            @click="nextQuestion"
            :disabled="selectedOptionIndex === null"
            class="w-full px-5 md:px-6 py-3 md:py-4 bg-black text-[#3A9CFF] rounded-md cursor-pointer border border-[#3A9CFF] disabled:bg-gray-400 disabled:text-white disabled:cursor-not-allowed disabled:border-none mt-auto md:text-lg"
          >
            다음 문제
          </button>
        </div>

        <!-- 시험 결과 -->
        <div v-else class="flex flex-col flex-grow justify-between mt-25">
          <div class="text-center my-auto">
            <h2 class="text-4xl md:text-5xl font-bold mb-4">시험 완료!</h2>
            <p class="text-3xl md:text-4xl font-semibold">
              최종 점수 : {{ score }}점
            </p>
            <p
              :class="[
                'text-5xl md:text-6xl font-extrabold mt-5',
                score >= 80 ? 'text-blue-500' : 'text-red-500',
              ]"
            >
              {{ score >= 80 ? "합격" : "불합격" }}
            </p>
          </div>
          <button
            @click="finishTestAndSaveResult"
            :disabled="submitting"
            class="flex justify-center items-center text-lg md:text-xl w-full mt-35 p-3 md:p-4 border bg-[#FFEC17] font-bold rounded-2xl cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {{ submitting ? "저장 중..." : "홈으로" }}
          </button>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const currentQuestion = ref(0);
const score = ref(0);

const selectedOptionIndex = ref(null);

const questions = ref([
  {
    question:
      "강관비계 작업 시 떨어짐 사고는 불가피하다. 안전대는 실질적으로 아무 필요 없다.",
    options: ["O", "X"],
    correct: 1, // 정답 인덱스 (0부터 시작)
  },
  {
    question: "기계 운전원에 의한 부딪힘 재해는 지게차 운전자의 100% 과실이다.",
    options: ["O", "X"],
    correct: 1,
  },
  {
    question: "작업 경력이 많은 사람이라고해서 재해발생이 적은것은 아니다.",
    options: ["O", "X"],
    correct: 0,
  },
  {
    question: "제조업 종사자도 떨어짐 재해를 겪을 수 있다",
    options: ["O", "X"],
    correct: 0,
  },
  {
    question: "가장 사고가 많이 발생하는 연령대는?",
    options: ["20대", "30대", "40대", "50대"],
    correct: 3,
  },
  {
    question: "재해는 주로 근무일수가 많은 평일에 발생한다.",
    options: ["O", "X"],
    correct: 1,
  },
  {
    question: "보호구가 아닌 것은?",
    options: ["안전모", "안전화", "장갑", "작업복"],
    correct: 3,
  },
  {
    question: "작업장 내 정해진 통로 이름은?",
    options: ["고속도로", "안전통로", "작업통로", "가설통로"],
    correct: 1,
  },
  {
    question:
      "날씨가 더운 날 안전관리자의 허가 아래 맥주 한 캔(도수 최대 6%)까지는 허용 범위이다",
    options: ["O", "X"],
    correct: 1,
  },
  {
    question:
      "현장 경력이 많은 작업자의 판단 아래 더 효율적인 작업 순서로 변경하는 것이 안전하다",
    options: ["O", "X"],
    correct: 1,
  },
]);

const checkAnswer = (selectedIndex) => {
  selectedOptionIndex.value = selectedIndex;
};

const nextQuestion = () => {
  if (selectedOptionIndex.value !== null) {
    if (
      selectedOptionIndex.value ===
      questions.value[currentQuestion.value].correct
    ) {
      score.value += 10;
    }
  }

  currentQuestion.value++;
  selectedOptionIndex.value = null;
};

const submitting = ref(false);

function formatTodayYYYYMMDD() {
  const d = new Date();
  const y = String(d.getFullYear());
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

const finishTestAndSaveResult = async () => {
  if (submitting.value) return;
  submitting.value = true;

  const isPass = score.value >= 80;
  const payload = {
    test: isPass ? "pass" : "fail",
    testPassDate: isPass ? formatTodayYYYYMMDD() : null,
  };

  try {
    const storedUser = sessionStorage.getItem("loggedInUser");
    const user = storedUser ? JSON.parse(storedUser) : null;

    const res = await fetch("http://localhost:8080/api/user/education-test", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      alert("시험 결과 저장에 실패했습니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    // 로컬 세션 동기화
    if (user) {
      user.test = isPass ? "pass" : "fail";
      if (isPass) user.pass_date = formatTodayYYYYMMDD();
      sessionStorage.setItem("loggedInUser", JSON.stringify(user));
    }

    router.push("/education");
  } catch (e) {
    alert("네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
  } finally {
    submitting.value = false;
  }
};
</script>
