<template>
  <div class="background-out">
    <div class="background-in">
      <header class="head-setting mb-4">
        <router-link to="/admin" class="heed-text flex items-center justify-center w-10 h-10">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="#78711D" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </router-link>
        <h1 class="text-2xl md:text-3xl font-bold text-[#78711D] text-center">작업 지정</h1>
        <div class="w-10"></div>
      </header>

      <main class="grid grid-cols-1 gap-3">
        <!-- 1) 현장/팀 선택 -->
        <section class="brown-box p-4 flex flex-col gap-2">
          <h2 class="text-xl font-bold text-[#FFEC17] mb-3 text-center">현장과 팀 선택</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
            <!-- 현장(지역) 선택 -->
            <div>
              <select v-model="selectedRegionId" class="input-box w-full p-2 rounded-md">
                <option :value="null">현장 선택</option>
                <option v-for="r in regions" :key="r.id" :value="r.id">{{ r.name }}</option>
              </select>
            </div>
            <!-- 팀 선택 -->
            <div>
              <select v-model="selectedSiteId" class="input-box w-full p-2 rounded-md" :disabled="!selectedRegionId">
                <option :value="null">팀 선택</option>
                <option v-for="s in sitesOfSelectedRegion" :key="s.id" :value="s.id">{{ s.name }}</option>
              </select>
            </div>
          </div>
          <p class="text-xs text-gray-300 mt-2">현장과 팀을 선택하면 지정 준비가 완료됩니다.</p>
        </section>

        <!-- 2) 날짜 선택 (오늘/내일) -->
        <section class="brown-box p-4 flex flex-col">
          <h2 class="text-xl font-bold text-[#FFEC17] mb-3 text-center">작업 날짜 선택</h2>
          <div class="flex gap-3 w-full justify-center">
            <button @click="pickToday" class="px-8 py-2 rounded-md border bg-black text-[#3A9CFF] border-[#3A9CFF]">금일</button>
            <button @click="pickTomorrow" class="px-8 py-2 rounded-md border bg-black text-[#3A9CFF] border-[#3A9CFF]">익일</button>
          </div>
          <div class="mt-3 text-center text-white text-sm">선택된 날짜: {{ taskDate || "미선택" }}</div>
        </section>

        <!-- 3) 작업 선택 (멀티) -->
        <section class="brown-box p-4 flex flex-col gap-2">
          <h2 class="text-xl font-bold text-[#FFEC17] mb-3 text-center">작업 선택</h2>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
            <button v-for="t in TASK_OPTIONS" :key="t" @click="toggleTask(t)" :class="['px-3 py-2 rounded-md border font-medium', selectedTasks.includes(t) ? 'bg-black text-[#3A9CFF] border-[#3A9CFF]' : 'bg-gray-100 text-[#1D1A05] hover:bg-[#FFFDE3] border-[#DCD7B8]']">
              {{ t }}
            </button>
          </div>
          <p class="text-xs text-gray-300 mt-2">여러 개를 선택할 수 있습니다.</p>
        </section>

        <!-- 전송 버튼 -->
        <section>
          <button @click="submitTask" :disabled="!canSubmit" :class="['w-full bg-black text-[#3A9CFF] border border-[#3A9CFF] font-bold py-3 rounded-md', !canSubmit ? 'opacity-60 cursor-not-allowed' : '']">작업 지정 전송</button>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";

const regions = ref([]); // [{id,name,sites:[{id,name}]}]
const selectedRegionId = ref(null);
const selectedSiteId = ref(null);
const taskDate = ref(""); // YYYY-MM-DD
const selectedTasks = ref([]);

const TASK_OPTIONS = ["철근배근", "용접작업", "비계설치", "나사박음질", "콘크리트타설", "절단연마작업", "전기공사", "고소작업"];

onMounted(loadLocations);

async function loadLocations() {
  const res = await fetch("http://localhost:8080/api/location", {
    method: "GET",
    headers: { Accept: "application/json" },
    credentials: "include",
  });
  if (!res.ok) return;
  const data = await res.json().catch(() => []);
  const grouped = new Map();
  for (const item of Array.isArray(data) ? data : []) {
    const r = item?.region || {};
    if (!r?.id || !r?.name) continue;
    if (!grouped.has(r.id)) grouped.set(r.id, { id: r.id, name: r.name, sites: [] });
    grouped.get(r.id).sites.push({ id: item.id, name: item.name });
  }
  regions.value = Array.from(grouped.values());
}

const sitesOfSelectedRegion = computed(() => {
  const r = regions.value.find((r) => r.id === selectedRegionId.value);
  return r?.sites ?? [];
});

function pickToday() {
  taskDate.value = formatDate(new Date());
}
function pickTomorrow() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  taskDate.value = formatDate(d);
}

function formatDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function toggleTask(t) {
  const i = selectedTasks.value.indexOf(t);
  if (i >= 0) selectedTasks.value.splice(i, 1);
  else selectedTasks.value.push(t);
}

const canSubmit = computed(() => !!(selectedSiteId.value && taskDate.value && selectedTasks.value.length));

async function submitTask() {
  if (!canSubmit.value) return;
  const payload = {
    siteId: Number(selectedSiteId.value),
    taskDate: taskDate.value,
    tasks: [...selectedTasks.value],
  };
  try {
    const res = await fetch("http://localhost:8080/api/task", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      let msg = "작업 지정 전송에 실패했습니다.";
      try {
        const ct = res.headers.get("content-type") || "";
        if (ct.includes("application/json")) {
          const j = await res.json();
          msg = (j && (j.message || j.error || JSON.stringify(j))) || msg;
        } else {
          msg = (await res.text()) || msg;
        }
      } catch {}
      alert(msg);
      return;
    }
    alert("작업 지정이 완료되었습니다.");
    // 초기화
    selectedRegionId.value = null;
    selectedSiteId.value = null;
    taskDate.value = "";
    selectedTasks.value = [];
  } catch (e) {
    alert("네트워크 오류로 작업 지정에 실패했습니다.");
  }
}
</script>

<style scoped>
.task-btn {
  min-width: 0;
}
</style>
