<template>
  <div class="background-out">
    <div class="background-in">
      <header class="head-setting mb-4">
        <router-link to="/admin" class="heed-text flex items-center justify-center w-10 h-10">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="#78711D" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </router-link>
        <h1 class="text-2xl md:text-3xl font-bold text-[#78711D] text-center">명단 관리</h1>
        <div class="w-10"></div>
      </header>

      <!-- 패널을 세로로 정렬 -->
      <main class="grid grid-cols-1 gap-3">
        <!-- 지역 패널 -->
        <section class="brown-box p-4 flex flex-col">
          <h2 class="text-xl font-bold text-[#FFEC17] mb-3 text-center">현장(지역)</h2>
          <div class="overflow-y-auto max-h-64 w-full flex flex-col gap-2">
            <div v-for="r in regions" :key="r.id" :class="['flex items-center justify-between p-3 rounded-md border w-full', selectedRegion?.id === r.id ? 'bg-black text-[#3A9CFF] border-[#3A9CFF]' : 'bg-gray-100 text-[#1D1A05] hover:bg-[#FFFDE3] border-[#DCD7B8]']">
              <span class="truncate">{{ r.name }}</span>
              <button type="button" @click="onSelectRegion(r)" class="ml-3 px-3 py-1 rounded-md border bg-[#FFEC17] text-[#1D1A05]">선택</button>
            </div>
          </div>

          <!-- 현장 추가 -->
          <div class="mt-4">
            <input v-model="newRegionName" type="text" placeholder="새 현장 이름을 입력해주세요" class="input-box rounded-md w-full p-2" />
            <button @click="addRegion" class="w-full mt-2 bg-black text-[#3A9CFF] border border-[#3A9CFF] font-bold py-2 rounded-md">현장 추가</button>
          </div>
        </section>

        <!-- 팀 패널 -->
        <section class="brown-box p-4 flex flex-col">
          <h2 class="text-xl font-bold text-[#FFEC17] mb-3 text-center">팀</h2>
          <div class="overflow-y-auto max-h-64 flex flex-col gap-2 w-full">
            <div v-for="s in sitesOfSelectedRegion" :key="s.id" :class="['flex items-center justify-between p-3 rounded-md border w-full', selectedSite?.id === s.id ? 'bg-black text-[#3A9CFF] border-[#3A9CFF]' : 'bg-gray-100 text-[#1D1A05] hover:bg-[#FFFDE3] border-[#DCD7B8]']">
              <span class="truncate">{{ s.name }}</span>
              <button type="button" @click="onSelectSite(s)" class="ml-3 px-3 py-1 rounded-md border bg-[#FFEC17] text-[#1D1A05]">선택</button>
            </div>
            <p v-if="selectedRegion && sitesOfSelectedRegion.length === 0" class="text-white text-center">등록된 팀이 없습니다.</p>
          </div>

          <!-- 팀 추가 (선택된 현장 필요) -->
          <div class="mt-4">
            <input v-model="newSiteName" type="text" placeholder="새 팀 이름을 입력해주세요" class="input-box rounded-md w-full p-2" :disabled="!selectedRegion" />
            <button @click="addSite" :disabled="!selectedRegion" :class="['w-full mt-2 font-bold py-2 rounded-md border', !selectedRegion ? 'bg-gray-300 text-gray-600' : 'bg-black text-[#3A9CFF] border-[#3A9CFF]']">팀 추가</button>
          </div>
        </section>

        <!-- 팀원 패널 -->
        <section class="brown-box p-4 flex flex-col">
          <h2 class="text-xl font-bold text-[#FFEC17] mb-3 text-center">팀원</h2>
          <div class="overflow-y-auto max-h-64 flex flex-col gap-2 w-full">
            <div v-for="u in users" :key="u.id" :class="['flex items-center justify-between p-3 rounded-md border w-full', selectedUser?.id === u.id ? 'bg-black text-[#3A9CFF] border-[#3A9CFF]' : 'bg-gray-100 text-[#1D1A05] hover:bg-[#FFFDE3] border-[#DCD7B8]']">
              <div class="min-w-0">
                <div class="font-semibold truncate">{{ u.name }}</div>
                <div class="text-xs text-gray-700 truncate">{{ u.role }} · {{ u.phone }}</div>
              </div>
              <button type="button" @click="onSelectUser(u)" class="ml-3 px-3 py-1 rounded-md border bg-[#FFEC17] text-[#1D1A05]">선택</button>
            </div>
            <p v-if="selectedSite && users.length === 0" class="text-white text-center">등록된 팀원이 없습니다.</p>
          </div>

          <!-- 팀원 추가 토글 & 폼 -->
          <div class="mt-4 w-full">
            <button @click="showUserForm = !showUserForm" :disabled="!selectedSite" :class="['w-full mt-2 font-bold py-2 rounded-md border', !selectedSite ? 'bg-gray-300 text-gray-600' : 'bg-black text-[#3A9CFF] border-[#3A9CFF]']">팀원 추가하기</button>
            <div v-if="showUserForm" class="mt-3 grid grid-cols-1 gap-2">
              <input v-model="newUser.name" type="text" placeholder="이름을 입력해주세요" class="input-box rounded-md w-full p-2" />
              <input v-model="newUser.phone" type="text" placeholder="전화번호를 입력해주세요 (- 입력 없이 등록)" class="input-box rounded-md w-full p-2" />
              <button @click="addUser" class="w-full bg-black text-[#3A9CFF] border border-[#3A9CFF] font-bold py-2 rounded-md">팀원 추가</button>
            </div>
          </div>
        </section>
      </main>

      <!-- 하단: 삭제 버튼 -->
      <footer class="mt-4">
        <button @click="deleteSelected" :class="['w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl', !canDelete ? 'opacity-60 cursor-not-allowed' : '']" :disabled="!canDelete">삭제하기</button>
        <p class="text-xs text-gray-300 mt-2">가이드 : 선택 수준에 따라 삭제 대상이 달라집니다: 현장만 선택 → 현장 및 하위 전체 / 팀 선택 → 팀 및 팀원 / 팀원 선택 → 해당 팀원</p>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";

// 상태
const regions = ref([]); // [{ id, name, sites: [{id,name}] }]
const selectedRegion = ref(null);
const selectedSite = ref(null);
const users = ref([]); // 현재 선택된 팀의 팀원 목록
const selectedUser = ref(null);

const newRegionName = ref("");
const newSiteName = ref("");
const showUserForm = ref(false);
const newUser = ref({ name: "", phone: "", role: "WORKER" });

const sitesOfSelectedRegion = computed(() => selectedRegion.value?.sites ?? []);
const canDelete = computed(() => !!(selectedUser.value || selectedSite.value || selectedRegion.value));

onMounted(async () => {
  await loadLocations();
});

async function loadLocations() {
  // /api/location: 팀 리스트 + region 객체. 지역별 그룹화
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
  // 선택 초기화
  selectedRegion.value = null;
  selectedSite.value = null;
  selectedUser.value = null;
  users.value = [];
}

function onSelectRegion(r) {
  selectedRegion.value = r;
  selectedSite.value = null;
  selectedUser.value = null;
  users.value = [];
}

async function onSelectSite(s) {
  selectedSite.value = s;
  selectedUser.value = null;
  await loadUsersOfSite(s.id);
}

function onSelectUser(u) {
  selectedUser.value = u;
}

async function loadUsersOfSite(siteId) {
  users.value = [];
  const res = await fetch(`http://localhost:8080/api/location/sites/${siteId}/users`, {
    method: "GET",
    headers: { Accept: "application/json" },
    credentials: "include",
  });
  if (!res.ok) return;
  const data = await res.json().catch(() => []);
  users.value = Array.isArray(data)
    ? data.map((u) => ({
        id: u.id,
        name: u.name,
        phone: u.phone,
        role: u.role || "WORKER",
      }))
    : [];
}

// 추가 기능
async function addRegion() {
  const name = newRegionName.value.trim();
  if (!name) return alert("현장 이름을 입력하세요.");
  const res = await fetch("http://localhost:8080/api/location/regions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    credentials: "include",
    body: JSON.stringify({ name }),
  });
  if (!res.ok) return alert("현장 추가에 실패했습니다.");
  newRegionName.value = "";
  await loadLocations();
}

async function addSite() {
  if (!selectedRegion.value) return alert("먼저 현장을 선택하세요.");
  const name = newSiteName.value.trim();
  if (!name) return alert("팀 이름을 입력하세요.");
  const res = await fetch("http://localhost:8080/api/location/sites", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    credentials: "include",
    body: JSON.stringify({ name, regionId: selectedRegion.value.id }),
  });
  if (!res.ok) return alert("팀 추가에 실패했습니다.");
  newSiteName.value = "";
  await loadLocations();
  // 방금 선택한 현장 유지
  const region = regions.value.find((r) => r.id === selectedRegion.value.id);
  if (region) selectedRegion.value = region;
}

async function addUser() {
  if (!selectedSite.value || !selectedRegion.value) return alert("현장과 팀을 먼저 선택하세요.");
  // 역할은 항상 WORKER로 고정
  const name = (newUser.value.name || "").trim();
  // 전화번호: 숫자만 남김 (서버가 하이픈을 허용하지 않는 경우 대비)
  const phoneDigits = (newUser.value.phone || "").replace(/\D+/g, "");
  const phone = phoneDigits;
  const role = "worker";
  if (!name || !phone) return alert("이름/전화는 필수입니다.");
  // siteId를 숫자로 보냄
  const siteId = Number(selectedSite.value.id);
  const res = await fetch("http://localhost:8080/api/location/users", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    credentials: "include",
    body: JSON.stringify({
      name,
      phone,
      role,
      siteId,
    }),
  });
  if (!res.ok) {
    let msg = "팀원 추가에 실패했습니다.";
    try {
      const ct = res.headers.get("content-type") || "";
      if (ct.includes("application/json")) {
        const j = await res.json();
        msg = (j && (j.message || j.error || JSON.stringify(j))) || msg;
      } else {
        msg = (await res.text()) || msg;
      }
    } catch (e) {
      // ignore parse error
    }
    alert(msg);
    return;
  }
  // 새로고침
  newUser.value = { name: "", phone: "", role: "WORKER" };
  showUserForm.value = false;
  await loadUsersOfSite(selectedSite.value.id);
}

// 삭제 기능: 선택 수준에 따라 분기
async function deleteSelected() {
  try {
    if (selectedUser.value) {
      const res = await fetch(`http://localhost:8080/api/location/users/${selectedUser.value.id}`, {
        method: "DELETE",
        headers: { Accept: "application/json" },
        credentials: "include",
      });
      if (!res.ok) return alert("팀원 삭제에 실패했습니다.");
      users.value = users.value.filter((u) => u.id !== selectedUser.value.id);
      selectedUser.value = null;
      return;
    }
    if (selectedSite.value) {
      const res = await fetch(`http://localhost:8080/api/location/sites/${selectedSite.value.id}`, {
        method: "DELETE",
        headers: { Accept: "application/json" },
        credentials: "include",
      });
      if (!res.ok) return alert("팀 삭제에 실패했습니다.");
      // 지역의 팀 목록에서 제거
      const region = regions.value.find((r) => r.id === selectedRegion.value?.id);
      if (region) region.sites = region.sites.filter((s) => s.id !== selectedSite.value.id);
      selectedSite.value = null;
      users.value = [];
      return;
    }
    if (selectedRegion.value) {
      const res = await fetch(`http://localhost:8080/api/location/regions/${selectedRegion.value.id}`, {
        method: "DELETE",
        headers: { Accept: "application/json" },
        credentials: "include",
      });
      if (!res.ok) return alert("현장 삭제에 실패했습니다.");
      regions.value = regions.value.filter((r) => r.id !== selectedRegion.value.id);
      selectedRegion.value = null;
      selectedSite.value = null;
      users.value = [];
      return;
    }
  } catch (e) {
    alert("삭제 처리 중 오류가 발생했습니다.");
  }
}
</script>

<style scoped>
.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
}
.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}
.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 10px;
}
.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
