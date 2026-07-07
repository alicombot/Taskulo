/** Dashboard application entry point. */
import { ThemeManager } from './theme.js';
import { NotificationManager, toggleNotificationOptions } from './notifications.js';
import { initSidebar, toggleSortOptions, selectOption, initSortDropdown } from './sidebar.js';
import { initCalendar, toggleDatePicker } from './calendar.js';
import { initSearch } from './search.js';
import { initProjects } from './projects.js';
import { initAccount } from './account.js';
import { initTasks, toggleActions } from './tasks.js';
import { syncDashboardStats } from './utils.js';

window.NotificationManager = NotificationManager;
window.toggleActions = toggleActions;
window.toggleDatePicker = toggleDatePicker;
window.toggleNotificationOptions = toggleNotificationOptions;
window.toggleSortOptions = toggleSortOptions;
window.selectOption = selectOption;

document.addEventListener('DOMContentLoaded', () => {
  ThemeManager.init();
  NotificationManager.init();
  initSidebar();
  initSortDropdown();
  initCalendar();
  initSearch();
  initProjects();
  initAccount();
  initTasks();
  syncDashboardStats();
});
