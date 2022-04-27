export const domReady = (run) => {
  if (
    document.readyState === "complete" ||
    (document.readyState !== "loading" && !document.documentElement.doScroll)
  ) {
    run();
  } else {
    document.addEventListener("DOMContentLoaded", run);
  }
};
