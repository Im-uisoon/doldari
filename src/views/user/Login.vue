<template>
  <!-- 전체 배경 설정 -->
  <div class="background-out flex items-center justify-center">
    <div class="background-in">
      <!-- 중앙 설정 -->
      <main class="main-setting">
        <img :src="baseURL + 'doldari.png'" class="w-35 h-35 md:w-60 md:h-60" />

        <!-- 지역/현장 -->
        <div class="w-full mx-auto max-w-md sm:max-w-lg px-4 sm:px-0 mb-1 md:mb-4 flex flex-col sm:flex-row gap-2 md:gap-4">
          <!-- 지역 -->
          <div class="flex flex-col flex-1">
            <label for="region" class="mb-2 font-bold text-[#767676] w-full text-left">지역</label>
            <select id="region" v-model="region" class="p-2 border-b w-full text-[#767676]">
              <option disabled value="">지역 선택</option>
              <option v-for="r in locations" :key="r.id ?? r.name" :value="r.id">
                {{ r.name }}
              </option>
            </select>
            <small v-if="locationsLoading" class="text-gray-400 mt-1">지역 불러오는 중...</small>
            <small v-else-if="locationsError" class="text-red-500 mt-1">지역 목록을 불러오지 못했습니다.</small>
          </div>

          <!-- 현장 -->
          <div class="flex flex-col flex-1">
            <label for="site" class="mb-2 font-bold text-[#767676] w-full text-left">현장</label>
            <select id="site" v-model="site" class="p-2 border-b w-full text-[#767676]" :disabled="!region">
              <option disabled value="">현장 선택</option>
              <option v-for="s in filteredSites" :key="s.id ?? s.name" :value="s.id">
                {{ s.name }}
              </option>
            </select>
          </div>
        </div>

        <!-- 이름/전화번호 -->
        <div class="flex flex-col items-center w-full">
          <form @submit.prevent="login" class="flex flex-col mt-4 w-full mx-auto max-w-md sm:max-w-lg">
            <!-- 이름 입력 -->
            <div class="flex flex-col w-full mb-4">
              <label for="name" class="input-label">이름</label>
              <input v-model="name" type="text" id="name" placeholder="홍길동" class="input-box p-2 sm:p-3" />
            </div>

            <!-- 전화번호 입력 -->
            <div class="flex flex-col w-full mb-4">
              <label for="phone" class="input-label">전화번호</label>
              <input v-model="phone" type="tel" id="phone" placeholder="01012341234" class="input-box p-2 sm:p-3" />
            </div>
            <p v-if="loginError" class="text-red-500 text-center mb-3">입력하신 정보가 일치하지 않습니다</p>
            <div v-else class="mb-3"></div>

            <!-- 관리자 로그인: 전화번호 입력과 로그인 버튼 사이, 우측 정렬 -->
            <div class="w-full flex justify-end items-center mb-2 pr-2 gap-2">
              <router-link to="/admin/login" class="text-sm font-bold text-[#78711D] hover:underline"> 관리자 로그인 </router-link>
            </div>

            <!-- 로그인 -->
            <button
              type="submit"
              :disabled="isButtonDisabled"
              :class="{
                'bg-gray-300': isButtonDisabled,
                'bg-[#FFEC17] hover:bg-yellow-300': !isButtonDisabled,
              }"
              class="login-button"
            >
              로그인
            </button>
          </form>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const baseURL = import.meta.env.BASE_URL;

// 선택 값 (ID 바인딩)
const region = ref(""); // regionId
const site = ref(""); // siteId
const name = ref("");
const phone = ref("");
const loginError = ref(false);

// 지역/현장 목록 상태
const locations = ref([]);
const locationsLoading = ref(false);
const locationsError = ref(false);

onMounted(async () => {
  locationsLoading.value = true;
  locationsError.value = false;
  try {
    const res = await fetch("http://localhost:8080/api/location", {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      const looksLikeTeamList = !!data[0]?.region && !data[0]?.sites;

      if (looksLikeTeamList) {
        const grouped = new Map();
        for (const item of data) {
          const r = item?.region ?? {};
          const rName = r?.name ?? "";
          const rId = r?.id;
          if (!rName) continue; // 지역명이 없으면 스킵

          if (!grouped.has(rName)) {
            grouped.set(rName, { id: rId, name: rName, sites: [] });
          }
          grouped.get(rName).sites.push({ id: item.id, name: item.name });
        }
        locations.value = Array.from(grouped.values());
      } else {
        locations.value = data;
      }
    } else {
      locations.value = [];
      locationsError.value = true;
    }
  } catch (e) {
    locations.value = [];
    locationsError.value = true;
  } finally {
    locationsLoading.value = false;
  }
});

// 지역 선택에 따른 현장 필터링 (regionId 기준)
const filteredSites = computed(() => {
  const selected = locations.value.find((r) => String(r.id) === String(region.value));
  return selected?.sites ?? [];
});

// 지역 변경되면 현장 초기화
watch(region, () => {
  site.value = "";
});

const isButtonDisabled = computed(() => {
  return !region.value || !site.value || !name.value || !phone.value;
});

const login = async () => {
  if (isButtonDisabled.value) return;

  loginError.value = false;
  try {
    const res = await fetch("http://localhost:8080/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        regionId: Number(region.value),
        siteId: Number(site.value),
        name: name.value,
        phone: phone.value,
      }),
    });

    if (!res.ok) {
      // 401/404 등 실패 처리
      loginError.value = true;
      return;
    }

    const data = await res.json().catch(() => ({}));
    // 성공 시 서버에서 내려주는 사용자 정보를 세션에 저장
    const selectedRegion = locations.value.find((r) => String(r.id) === String(region.value));
    const selectedSite = filteredSites.value.find((s) => String(s.id) === String(site.value));
    const sessionUser = {
      ...data,
      regionId: Number(region.value),
      region: selectedRegion?.name,
      siteId: Number(site.value),
      site: selectedSite?.name,
      name: name.value,
      phone: phone.value,
    };
    sessionStorage.setItem("loggedInUser", JSON.stringify(sessionUser));
    router.push("/main");
  } catch (e) {
    loginError.value = true;
  }
};

// 테스터 계정 제거됨
</script>
