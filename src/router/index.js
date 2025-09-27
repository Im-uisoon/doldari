import { createRouter, createWebHashHistory } from "vue-router";
import Home from "../views/Home.vue";
import Main from "../views/Main.vue";
import UserLogin from "../views/user/Login.vue";
import UserSafe from "../views/user/Safe/Safe.vue";

const UserSafeDetail = () => import("../views/user/Safe/SafeDetail.vue");
const AdminLogin = () => import("../views/admin/AdminLogin.vue");
const Admin = () => import("../views/admin/Admin.vue");
const AdminList = () => import("../views/admin/AdminList.vue");
const AdminTask = () => import("../views/admin/AdminTask.vue");
const Education = () => import("../views/user/Education/Education.vue");
const EducationView = () => import("../views/user/Education/EducationView.vue");
const EducationTest = () => import("../views/user/Education/Test.vue");
const DailyTask = () => import("../views/user/Task/daily.vue");

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/login",
    name: "UserLogin",
    component: UserLogin,
  },
  {
    path: "/admin/login",
    name: "AdminLogin",
    component: AdminLogin,
  },
  {
    path: "/admin",
    name: "Admin",
    component: Admin,
    meta: { requiresAdmin: true },
  },
  {
    path: "/adminedit",
    name: "AdminList",
    component: AdminList,
    meta: { requiresAdmin: true },
  },
  {
    path: "/admintask",
    name: "AdminTask",
    component: AdminTask,
    meta: { requiresAdmin: true },
  },
  {
    path: "/main",
    name: "Main",
    component: Main,
    meta: { requiresAuth: true },
  },
  {
    path: "/education",
    name: "Education",
    component: Education,
    meta: { requiresAuth: true },
  },
  {
    path: "/education/test",
    name: "EducationTest",
    component: EducationTest,
    meta: { requiresAuth: true },
  },
  {
    path: "/educationview",
    name: "EducationView",
    component: EducationView,
    meta: { requiresAuth: true },
  },
  {
    path: "/check",
    name: "DailyTask",
    component: DailyTask,
    meta: { requiresAuth: true },
  },
  {
    path: "/safe",
    name: "Safe",
    component: UserSafe,
    meta: { requiresAuth: true },
  },
  {
    path: "/safe/:type",
    name: "SafeDetail",
    component: UserSafeDetail,
    meta: { requiresAuth: true },
  },
  // 404 페이지 처리
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    redirect: "/",
  },
];

const router = createRouter({
  // GitHub Pages에서는 해시 모드가 새로고침 404를 방지합니다.
  history: createWebHashHistory(),
  routes,
  // 페이지 전환 시 스크롤을 맨 위로
  scrollBehavior() {
    return { top: 0 };
  },
});

// 라우터 가드 (필요시 인증 체크 등)
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some((r) => r.meta?.requiresAuth);
  const requiresAdmin = to.matched.some((r) => r.meta?.requiresAdmin);
  const hasUser = !!sessionStorage.getItem("loggedInUser");
  const hasAdmin = !!localStorage.getItem("loggedInAdminId");

  if (requiresAuth && !hasUser) {
    next({ path: "/login" });
  } else if (requiresAdmin && !hasAdmin) {
    next({ path: "/admin/login" });
  } else if ((to.path === "/login" || to.path === "/") && hasUser) {
    // 로그인 상태에서 홈/로그인 접근 시 메인으로 보냄
    next({ path: "/main" });
  } else {
    next();
  }
});

export default router;
