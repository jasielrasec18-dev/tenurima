const accordionItems = document.querySelectorAll(".accordion__item");

accordionItems.forEach((item) => {
  const header = item.querySelector(".accordion__header");

  header.addEventListener("click", () => {
    const isActive = item.classList.contains("active");

    accordionItems.forEach((accordionItem) => {
      accordionItem.classList.remove("active");

      const accordionHeader = accordionItem.querySelector(".accordion__header");

      accordionHeader.setAttribute("aria-expanded", "false");
    });

    if (!isActive) {
      item.classList.add("active");
      header.setAttribute("aria-expanded", "true");
    }
  });
});
