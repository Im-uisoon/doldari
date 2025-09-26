<template>
  <div class="background-out">
    <div class="background-in md:max-w-3xl lg:max-w-5xl">
      <header class="head-setting mb-10 md:mb-12">
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
        <h1 class="text-3xl md:text-4xl font-bold text-[#78711D]">안전조치</h1>
        <p></p>
      </header>

      <main
        class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 md:gap-6 lg:gap-8"
      >
        <router-link
          v-for="item in safetyTypes"
          :key="item.name"
          :to="item.link"
          class="relative bg-[#1A1806] rounded-3xl overflow-hidden aspect-square cursor-pointer flex items-center justify-center"
        >
          <img
            :src="item.img"
            :alt="item.name"
            class="max-w-full max-h-full object-contain"
          />
        </router-link>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const safetyTypes = ref([
  {
    name: "추락",
    img: import.meta.env.BASE_URL + "safe/fall_from_height.png",
    link: "/safe/fall_from_height",
  },
  {
    name: "끼임",
    img: import.meta.env.BASE_URL + "safe/entrapment.png",
    link: "/safe/entrapment",
  },
  {
    name: "감전",
    img: import.meta.env.BASE_URL + "safe/electric_shock.png",
    link: "/safe/electric_shock",
  },
  {
    name: "넘어짐",
    img: import.meta.env.BASE_URL + "safe/slip_and_fall.png",
    link: "/safe/slip_and_fall",
  },
  {
    name: "낙하물",
    img: import.meta.env.BASE_URL + "safe/falling_object.png",
    link: "/safe/falling_object",
  },
  {
    name: "열사병·탈진",
    img: import.meta.env.BASE_URL + "safe/heatstroke.png",
    link: "/safe/heatstroke",
  },
  {
    name: "화재",
    img: import.meta.env.BASE_URL + "safe/fire.png",
    link: "/safe/fire",
  },
  {
    name: "붕괴",
    img: import.meta.env.BASE_URL + "safe/collapse.png",
    link: "/safe/collapse",
  },
]);
</script>

<style scoped>
.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
}
</style>
