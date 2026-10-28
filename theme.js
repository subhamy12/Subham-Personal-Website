// Light/dark toggle: remembers the visitor's choice, otherwise follows the device.
const root = document.documentElement;
const toggle = document.querySelector(".theme-toggle");
const systemDark = window.matchMedia("(prefers-color-scheme: dark)");

const isDark = () =>
  root.dataset.theme ? root.dataset.theme === "dark" : systemDark.matches;

const updateLabel = () => {
  toggle.setAttribute("aria-label", isDark() ? "Switch to light mode" : "Switch to dark mode");
};

toggle.addEventListener("click", () => {
  const theme = isDark() ? "light" : "dark";
  root.dataset.theme = theme;
  try {
    localStorage.setItem("theme", theme);
  } catch (e) {}
  updateLabel();
});

systemDark.addEventListener("change", updateLabel);
updateLabel();
