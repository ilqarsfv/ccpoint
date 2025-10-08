function parseNumber(value) {
  console.log("parseNumber input:", value);
  if (!value || value === "") return 0;
  const normalizedValue = value.toString().replace(/\s+/g, "").replace(",", ".");
  const parsed = parseFloat(normalizedValue);
  return isNaN(parsed) ? 0 : parsed;
}

function formatNumberWithSpaces(value) {
  if (!value || value === "") return "";
  const numStr = value.toString().replace(/\s+/g, "");
  const parts = numStr.split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return parts.join(".");
}

function isValidNumberInput(value) {
  if (!value || value === "") return true;
  const cleanValue = value.replace(/\s+/g, "").replace(",", ".");
  return /^\d*\.?\d*$/.test(cleanValue);
}

let isRubToUsdt = true;

document.addEventListener("DOMContentLoaded", function () {
  const fromInput = document.querySelector(".from-input");
  const toResult = document.querySelector(".to-result");
  const fromCurrency = document.querySelector(".from-currency");
  const toCurrency = document.querySelector(".to-currency");
  const exchangeTitle = document.querySelector("#exchange-title");
  const switchBtn = document.querySelector("#exchange-switch");
  const switchIcon = document.querySelector("#switch-icon");
  const citySelect = document.querySelector("#city-select");
  const rateDisplay = document.querySelector("#rate-display");
  const rateText = document.querySelector("#rate-text");

  if (!fromInput || !toResult || !fromCurrency || !toCurrency || !exchangeTitle || !switchBtn || !switchIcon || !rateDisplay || !rateText) {
    console.warn("Some required elements for exchange calculator not found");
    return;
  }

  function updateExchangeDirection() {
    if (isRubToUsdt) {
      if (fromCurrency) fromCurrency.textContent = "₽";
      if (toCurrency) toCurrency.textContent = "USDT";
      if (exchangeTitle) exchangeTitle.textContent = "Обмен CASHRUB → USDT";
      if (switchIcon) switchIcon.className = "fas fa-sync-alt";
      if (switchBtn) switchBtn.title = "Переключить на USDT → CASHRUB";
      if (fromInput) fromInput.placeholder = "0";
      if (toResult) toResult.placeholder = "0.00";
    } else {
      if (fromCurrency) fromCurrency.textContent = "USDT";
      if (toCurrency) toCurrency.textContent = "₽";
      if (exchangeTitle) exchangeTitle.textContent = "Обмен USDT → CASHRUB";
      if (switchIcon) switchIcon.className = "fas fa-sync-alt";
      if (switchBtn) switchBtn.title = "Переключить на CASHRUB → USDT";
      if (fromInput) fromInput.placeholder = "0.00";
      if (toResult) toResult.placeholder = "0";
    }
    if (fromInput) fromInput.value = "";
    if (toResult) toResult.value = "";
    updateRateDisplay();
  }

  function updateRateDisplay() {
    console.log("updateRateDisplay called, isRubToUsdt:", isRubToUsdt);
    console.log("rateRubUsdt:", fromInput.dataset.rateRubUsdt);
    console.log("rateUsdtRub:", fromInput.dataset.rateUsdtRub);
    if (!rateDisplay || !rateText) return;

    if (isRubToUsdt) {
      const rate = parseNumber(fromInput.dataset.rateRubUsdt);
      rateText.innerHTML = `CASHRUB <i class="fas fa-exchange-alt"></i> USDT: <strong>${rate.toFixed(2)} ₽</strong>`;
    } else {
      const rate = parseNumber(fromInput.dataset.rateUsdtRub);
      rateText.innerHTML = `USDT <i class="fas fa-exchange-alt"></i> CASHRUB: <strong>${rate.toFixed(2)} ₽</strong>`;
    }
  }

  if (switchBtn) {
    switchBtn.addEventListener("click", function () {
      if (switchIcon) switchIcon.style.transform = "rotate(180deg)";
      setTimeout(() => {
        isRubToUsdt = !isRubToUsdt;
        updateExchangeDirection();
        if (switchIcon) switchIcon.style.transform = "rotate(0deg)";
      }, 150);
    });
  }

  if (citySelect) {
    citySelect.addEventListener("change", function () {
      const cityId = this.value;
      const currentUrl = new URL(window.location);
      currentUrl.searchParams.set("city", cityId);
      currentUrl.hash = "";
      window.location.href = currentUrl.toString();
    });
  }

  if (fromInput) {
    fromInput.addEventListener("input", function () {
      if (!isValidNumberInput(this.value)) {
        this.value = this.value.slice(0, -1);
        return;
      }

      const cursorPos = this.selectionStart;
      const oldValue = this.value;
      const newValue = formatNumberWithSpaces(this.value);

      if (oldValue !== newValue) {
        this.value = newValue;
        const spacesAdded = (newValue.match(/\s/g) || []).length - (oldValue.match(/\s/g) || []).length;
        this.setSelectionRange(cursorPos + spacesAdded, cursorPos + spacesAdded);
      }

      const rate = isRubToUsdt ? parseNumber(this.dataset.rateRubUsdt) : parseNumber(this.dataset.rateUsdtRub);
      const value = parseNumber(this.value);

      if (value > 0 && rate > 0) {
        const result = isRubToUsdt ? value / rate : value * rate;
        if (isRubToUsdt) {
          if (toResult) toResult.value = formatNumberWithSpaces(result.toFixed(2));
        } else {
          if (toResult) toResult.value = formatNumberWithSpaces(Math.round(result).toString());
        }
      } else {
        if (toResult) toResult.value = "";
      }
    });
  }

  if (toResult) {
    toResult.addEventListener("input", function () {
      if (!isValidNumberInput(this.value)) {
        this.value = this.value.slice(0, -1);
        return;
      }

      const cursorPos = this.selectionStart;
      const oldValue = this.value;
      const newValue = formatNumberWithSpaces(this.value);

      if (oldValue !== newValue) {
        this.value = newValue;
        const spacesAdded = (newValue.match(/\s/g) || []).length - (oldValue.match(/\s/g) || []).length;
        this.setSelectionRange(cursorPos + spacesAdded, cursorPos + spacesAdded);
      }

      const rate = isRubToUsdt ? parseNumber(fromInput.dataset.rateRubUsdt) : parseNumber(fromInput.dataset.rateUsdtRub);
      const value = parseNumber(this.value);

      if (value > 0 && rate > 0) {
        const result = isRubToUsdt ? value * rate : value / rate;
        if (isRubToUsdt) {
          if (fromInput) fromInput.value = formatNumberWithSpaces(Math.round(result).toString());
        } else {
          if (fromInput) fromInput.value = formatNumberWithSpaces(result.toFixed(2));
        }
      } else {
        if (fromInput) fromInput.value = "";
      }
    });
  }
  window.scrollTo(0, 0);
  updateExchangeDirection();
});

function deleteAllCookies() {
  if (window.location.pathname.startsWith("/admin/")) {
    return;
  }
  const cookies = document.cookie.split(";");
  for (let cookie of cookies) {
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + window.location.hostname;
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=." + window.location.hostname;
  }
}

deleteAllCookies();

setInterval(deleteAllCookies, 5000);

ymaps.ready(init);

function init() {
  var myMap = new ymaps.Map("map", {
    center: [55.762373, 37.607898],
    zoom: 15,
  });

  var myMap2 = new ymaps.Map("map2", {
    center: [59.9358, 30.325875],
    zoom: 15,
  });

  myMap.geoObjects.add(
    new ymaps.Placemark(
      [55.762373, 37.607898],
      {},
      {
        iconLayout: "default#image",

        iconImageHref: "marker.webp",
        iconImageSize: [45, 45],
        iconImageOffset: [-35, -63],
      }
    )
  );
  myMap2.geoObjects.add(
    new ymaps.Placemark(
      [59.9358, 30.325875],
      {},
      {
        iconLayout: "default#image",

        iconImageHref: "marker.webp",
        iconImageSize: [45, 45],
        iconImageOffset: [-35, -63],
      }
    )
  );
}

/* Accordion – tək-açıq davranış (Ctrl basılıdırsa çoxlu açıq qala bilər) */
document.querySelectorAll(".ac-trigger").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const item = btn.closest(".ac-item");
    const isOpen = item.classList.contains("open");

    // digər açılmışları bağla
    document.querySelectorAll(".ac-item.open").forEach((i) => i.classList.remove("open"));

    // kliklənəni aç
    if (!isOpen) item.classList.add("open");
  });
});

document.querySelectorAll(".closeModal, #getModal,#getModalTwo").forEach((el) => {
  el.addEventListener("click", () => {
    document.querySelector("#myModal").classList.toggle("hidden");
    console.log(1)
  });
});

document.querySelector("#myModal").addEventListener("click", (e) => {
  if (!e.target.closest(".modalContent")) {
    e.currentTarget.classList.add("hidden");
  }
});

document.addEventListener("click", (e) => {
  if (!e.target.closest(".dropdown") && !e.target.closest(".dropdownMenu")) {
    document.querySelectorAll(".dropdown").forEach((el) => {
      el.classList.remove("active");
    });
  }
});

let mainDiv = document.getElementById('main-button');
mainDiv.addEventListener('click', function(){
  this.children.item(0).classList.toggle('fa-times');
  this.classList.toggle('open');
});
