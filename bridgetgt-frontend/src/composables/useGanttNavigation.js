export function useGanttNavigation(router, ganttStore, navigationDialog) {
  function goBackToDashboard() {
    if (ganttStore.hasPendingChanges) {
      navigationDialog.open('/');
    } else {
      router.push('/');
    }
  }

  function handleConfirmNavigation() {
    ganttStore.discardChanges();
    const targetRoute = navigationDialog.targetRoute;
    navigationDialog.close();
    if (targetRoute) {
      router.push(targetRoute);
    }
  }

  function handleCancelNavigation() {
    navigationDialog.close();
  }

  return {
    goBackToDashboard,
    handleConfirmNavigation,
    handleCancelNavigation
  };
}
