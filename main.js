const HERO_URL = "https://api.openaq.org/v1";
let allCountries = [];
let allCitiesInCountry = [];

let countryInputElement;
let clearCountriesSearchElement;
let countriesCountElement;
let citiesInputElement;
let citiesCountElement;
let clearCitiesSearchElement;

window.onload = async () => {
  bindElementsFromDOM();
  addEventsToInputs();
  addEventsToClearButtons();
  loadAllCountries();
};

function loadAllCountries() {
  getData("/countries").then(countryData => {
    allCountries = countryData.results;
    generateCountriesList(allCountries);
    setCountNumber(
      countriesCountElement,
      allCountries.length,
      allCountries.length
    );
  });
}

function handleCitiesInputChange(e) {
  const searchText = e.target.value;
  const filteredCities = filterCities(searchText);
  generateCitiesList(filteredCities);
  setCountNumber(
    citiesCountElement,
    filteredCities.length,
    allCitiesInCountry.length
  );
  const showClearIcon = searchText !== "";
  toggleVisibility(clearCitiesSearchElement, showClearIcon);
}

function handleCountriesInputChange(e) {
  const searchText = e.target.value;
  const filteredCountries = filterCountry(searchText);
  generateCountriesList(filteredCountries);
  setCountNumber(
    countriesCountElement,
    filteredCountries.length,
    allCountries.length
  );
  const showClearIcon = searchText !== "";
  toggleVisibility(clearCountriesSearchElement, showClearIcon);
}

function setCountNumber(el, current, max) {
  el.innerText = current + "/" + max;
}

function toggleVisibility(element, show) {
  if (show) {
    if (element.classList.contains("hidden")) {
      element.classList.remove("hidden");
    }
  } else {
    if (!element.classList.contains("hidden")) {
      element.classList.add("hidden");
    }
  }
}

function generateCountriesList(countries) {
  const countriesList = document.querySelector("#countriesList");
  countriesList.innerHTML = "";

  countries.forEach(country => {
    const countryElement = document.createElement("li");
    countryElement.innerText = country.name;
    countriesList.appendChild(countryElement);
    countryElement.addEventListener("click", () => {
      handleSelectCountry(country.code);
    });
  });
}

function handleSelectCountry(countryCode) {
  const requestRoute = `/cities?country=${countryCode}&limit=1000`;
  getData(requestRoute).then(countryData => {
    allCitiesInCountry = countryData.results;
    generateCitiesList(allCitiesInCountry);
    setCountNumber(
      citiesCountElement,
      allCitiesInCountry.length,
      allCitiesInCountry.length
    );
  });
}

function generateCitiesList(cities) {
  const citiesList = document.querySelector("#citiesList");
  citiesList.innerHTML = "";

  cities.forEach(city => {
    const cityElement = document.createElement("li");
    cityElement.innerText = city.name;
    citiesList.appendChild(cityElement);
    cityElement.addEventListener("click", () => {
      handleSelectCity(city.name);
    });
  });
}

function handleSelectCity(cityCode) {
  const cityDataRequest = `/latest?city=${cityCode}&limit=1000`;
  getData(cityDataRequest).then(cityData => {
    generateCityData(cityData.results);
  });
}

function generateCityData(cityData) {
  const cityDataList = document.querySelector("#cityData");
  cityDataList.innerHTML = "";
  cityData.forEach(data => {
    const liElement = document.createElement("li");

    const locationElement = document.createElement("strong");
    locationElement.innerText = data.location;
    liElement.appendChild(locationElement);

    data.measurements.forEach(measurement => {
      const spanElement = document.createElement("span");
      spanElement.innerText =
        measurement.parameter +
        " : " +
        measurement.value +
        " " +
        measurement.unit;
      liElement.setAttribute(
        "title",
        "lastUpdated: " + measurement.lastUpdated
      );
      liElement.appendChild(spanElement);
    });

    cityDataList.appendChild(liElement);
  });
}

function filterCountry(searchText) {
  searchText = searchText.toLocaleLowerCase().trim();
  return allCountries.filter(country => {
    if (country.code && country.code.toLocaleLowerCase().includes(searchText)) {
      return true;
    }
    if (country.name && country.name.toLocaleLowerCase().includes(searchText)) {
      return true;
    }
    return false;
  });
}

function filterCities(searchText) {
  searchText = searchText.toLocaleLowerCase().trim();
  return allCitiesInCountry.filter(country => {
    if (country.city && country.city.toLocaleLowerCase().includes(searchText)) {
      return true;
    }
    if (country.name && country.name.toLocaleLowerCase().includes(searchText)) {
      return true;
    }
    return false;
  });
}

function bindElementsFromDOM() {
  countryInputElement = document.querySelector("#countryInput");
  clearCountriesSearchElement = document.querySelector("#clearCountriesSearch");
  citiesInputElement = document.querySelector("#citiesInput");
  countriesCountElement = document.querySelector("#countriesCount");

  citiesCountElement = document.querySelector("#citiesCount");
  clearCitiesSearchElement = document.querySelector("#clearCitiesSearch");
}

function addEventsToInputs() {
  countryInputElement.addEventListener("input", e => {
    handleCountriesInputChange(e);
  });

  citiesInputElement.addEventListener("input", e => {
    handleCitiesInputChange(e);
  });
}

function addEventsToClearButtons() {
  clearCountriesSearchElement.addEventListener("click", () => {
    countryInputElement.value = "";
    generateCountriesList(allCountries);
    toggleVisibility(clearCountriesSearchElement, false);
    setCountNumber(
      countriesCountElement,
      allCountries.length,
      allCountries.length
    );
  });

  clearCitiesSearchElement.addEventListener("click", () => {
    citiesInputElement.value = "";
    generateCitiesList(allCitiesInCountry);
    toggleVisibility(clearCitiesSearchElement, false);
    setCountNumber(
      citiesCountElement,
      allCitiesInCountry.length,
      allCitiesInCountry.length
    );
  });
}

function getData(route) {
  return fetch(`${HERO_URL}${route}`)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      return Promise.reject(response.status);
    })
    .catch(err => {
      console.warn(err);
    });
}
