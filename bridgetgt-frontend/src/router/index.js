import { createRouter, createWebHistory } from "vue-router";
import { useAccessStore } from "@/stores/accessStore";
import { useGitHubAuthStore } from "@/stores/githubAuthStore";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/login",
      name: "LoginPage",
      component: () => import("@/views/LoginView.vue"),
      meta: { requiresAuth: false },
    },
    {
      path: "/auth/callback",
      name: "AuthCallback",
      component: () => import("@/views/AuthCallback.vue"),
      meta: { requiresAuth: false },
    },
    {
      path: "/unauthorized",
      name: "Unauthorized",
      component: () => import("@/views/Unauthorized/UnAuthorized.vue"),
      meta: { requiresAuth: false },
    },
    {
      path: "/",
      name: "Dashboard",
      component: () => import("@/views/Authorized/DashBoard.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/developer",
      name: "DeveloperManagement",
      component: () => import("@/views/Authorized/DeveloperManagement.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/activity-log",
      name: "ActivityLog",
      component: () => import("@/views/Authorized/ActivityLog.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/gantt",
      name: "GanttView",
      component: () => import("@/views/Authorized/GanttView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/:pathMatch(.*)*",
      redirect: "/",
    },
  ],
});

// ROUTE GUARD
router.beforeEach(async (to, from, next) => {
  const accessStore = useAccessStore();
  const githubAuthStore = useGitHubAuthStore();
  
  // AUTH STATES
  const hasLegacyAuth = accessStore.initializeAuth();
  const hasGitHubAuth = githubAuthStore.isAuthenticated;
  
  // Org Developership is now checked in backend and included in JWT
  const isOrgDeveloper = hasGitHubAuth && githubAuthStore.userProfile?.role === "user";
  const isAuthenticated = hasLegacyAuth || isOrgDeveloper;
  const requiresAuth = to.meta.requiresAuth !== false;
  
  // Check session expiry on frontend (1 hour check)
  if (requiresAuth && isAuthenticated) {
    const sessionToken = localStorage.getItem("sessionToken");
    if (sessionToken) {
      const { useSessionStore } = await import('@/stores/sessionStore');
      const sessionStore = useSessionStore();
      
      // Check if session expired (1 hour)
      if (sessionStore.isSessionExpired()) {
        sessionStore.autoLogout();
        return next("/login");
      }
    }
  }
  
  // Check for pending changes in Gantt view
  if (from.name === 'GanttView' && to.name !== 'GanttView') {
    const { useGanttStore } = await import('@/stores/ganttStore');
    const ganttStore = useGanttStore();
    
    if (ganttStore.hasPendingChanges) {
      if (typeof window !== 'undefined') {
        window.__pendingNavigation = { to, from };
      }
      return next(false);
    }
  }

  if (requiresAuth && !isAuthenticated) {
    next("/login");
  } else if (to.path === "/login" && isAuthenticated) {
    next("/");
  } else if (hasGitHubAuth && !isOrgDeveloper && to.path !== "/unauthorized" && to.path !== "/login") {
    next("/unauthorized");
  } else {
    next();
  }
});

export default router;
