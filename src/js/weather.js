import { ref, computed } from "vue";

export function useWeather(apiKey) {
  const API_KEY =
    apiKey ||
    import.meta.env.VITE_OPENWEATHER_API_KEY ||
    "0932f94a8c7c4056a89e25a41a24e18d";

  // state
  const loading = ref(true);
  const errorMsg = ref("");
  const city = ref("");
  const lat = ref(null);
  const lon = ref(null);
  const temp = ref(null);
  const feelsLike = ref(null);
  const humidity = ref(null);
  const windSpeed = ref(null);
  const weatherId = ref(null);

  // getter
  const tempDisplay = computed(() =>
    temp.value != null ? temp.value.toFixed(1) : "-"
  );
  const feelsLikeDisplay = computed(() =>
    feelsLike.value != null ? feelsLike.value.toFixed(1) : "-"
  );
  const windSpeedDisplay = computed(() =>
    windSpeed.value != null ? windSpeed.value.toFixed(1) : "-"
  );
  const locationDisplay = computed(() => city.value || "-");

  const iconSrc = computed(() => {
    const base = import.meta.env.BASE_URL + "weather/";
    const id = weatherId.value;
    if (id == null) return base + "cloud.svg";
    if (id === 800) return base + "sunny.svg";
    if (id >= 801 && id <= 804) return base + "cloud.svg";
    if (
      (id >= 200 && id <= 232) ||
      (id >= 300 && id <= 321) ||
      (id >= 500 && id <= 531)
    )
      return base + "rainy.svg";
    if (id >= 600 && id <= 622) return base + "snow.svg";
    if (id >= 701 && id <= 781) return base + "foggy.svg";
    return base + "cloud.svg";
  });

  function getWeatherSummary(id) {
    if (id === 800) return "맑음";
    if (id >= 801 && id <= 804) return "구름";
    if (
      (id >= 200 && id <= 232) ||
      (id >= 300 && id <= 321) ||
      (id >= 500 && id <= 531)
    )
      return "비";
    if (id >= 600 && id <= 622) return "눈";
    if (id >= 701 && id <= 781) return "안개";
    return "기타";
  }
  const summaryShort = computed(() =>
    weatherId.value != null ? getWeatherSummary(weatherId.value) : "-"
  );

  // action
  async function fetchWeather(_lat, _lon) {
    try {
      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${_lat}&lon=${_lon}&appid=${API_KEY}&units=metric&lang=kr`;
      const res = await fetch(weatherUrl);
      const data = await res.json();
      if (data.cod !== 200) throw new Error("인터넷이 끊겼습니다");

      temp.value = Number(data.main?.temp ?? null);
      feelsLike.value = Number(data.main?.feels_like ?? null);
      humidity.value = Number(data.main?.humidity ?? null);
      windSpeed.value = Number(data.wind?.speed ?? null);
      weatherId.value = Number(data.weather?.[0]?.id ?? null);

      // reverse geocoding 한국형 주소 조합
      const geoUrl = `https://api.openweathermap.org/geo/1.0/reverse?lat=${_lat}&lon=${_lon}&limit=1&appid=${API_KEY}`;
      const gres = await fetch(geoUrl);
      const geoData = await gres.json();
      const g0 = geoData?.[0] || {};
      const localKo = g0?.local_names?.ko;
      const name = g0?.name;
      const state = g0?.state;
      const country = g0?.country;
      const mainName = localKo || name || "";
      let composed = "";
      if (state && mainName) composed = `${state} ${mainName}`;
      else if (mainName) composed = mainName;
      else if (state) composed = state;
      else if (country) composed = country;
      else composed = data.name || "";
      city.value = composed;
    } catch (e) {
      console.error(e);
      errorMsg.value = "인터넷이 끊겼습니다";
    } finally {
      loading.value = false;
    }
  }

  function initGeolocation() {
    if (!("geolocation" in navigator)) {
      loading.value = false;
      errorMsg.value = "GPS를 켜주세요";
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        lat.value = latitude;
        lon.value = longitude;
        fetchWeather(latitude, longitude);
      },
      (err) => {
        console.error(err);
        loading.value = false;
        errorMsg.value = "점검 중 입니다";
      }
    );
  }

  return {
    state: {
      loading,
      errorMsg,
      city,
      lat,
      lon,
      temp,
      feelsLike,
      humidity,
      windSpeed,
      weatherId,
    },
    getters: {
      tempDisplay,
      feelsLikeDisplay,
      windSpeedDisplay,
      locationDisplay,
      iconSrc,
      summaryShort,
    },
    actions: { fetchWeather, initGeolocation },
  };
}
