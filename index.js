const country = {
  name: "",
  flag: "",
  population: 0,
  capital: "",
  currency: "",
  language: [],
  latlng: [
    0,
    0,
  ],
};
const countriesList = [];

function refreshCountry() {
  // re-assign object
  const randCountry = Math.floor((Math.random() / 4) * 1000);
  country.name = countriesList[randCountry].name;
  country.flag = countriesList[randCountry].flag;
  country.population = countriesList[randCountry].population;
  country.capital = countriesList[randCountry].capital;
  country.currency = countriesList[randCountry].currencies[0].name;
  country.latlng = countriesList[randCountry].latlng;
  country.language = [];
  countriesList[randCountry].languages.forEach((lang) => {
    country.language.push(lang.name);
  });
  flagimg.innerHTML = `<img src="${country.flag}">`;
}
async function fetchCountries() {
  // fetch
  const blob = await fetch("https://restcountries.com/v2/all");
  const json = await blob.json();
  countriesList.push(...json);
  // assign
  refreshCountry();
}
fetchCountries();

function answer(type = "answer") {
  if (type === "answer") {
    answertext.innerHTML = `${country.name}`;
    poptext.innerHTML = `Population: ${new Intl.NumberFormat().format(country.population)}`;
    captext.innerHTML = `Capital: ${country.capital}`;
    curtext.innerHTML = `Currency: ${country.currency}`;
    if (country.language.length > 1) {
      lantext.innerHTML = `Languages: ${country.language.join(", ")}`;
    } else {
      lantext.innerHTML = `Language: ${country.language[0]}`;
    }
    scoretext.innerHTML = `Score: ${360 - (Math.abs(guessMarker._latlng.lat - marker._latlng.lat) + Math.abs(guessMarker._latlng.lng - marker._latlng.lng))}`;
  } else if (type === "r") {
    answertext.innerHTML = ``;
    poptext.innerHTML = `Population:`;
    captext.innerHTML = `Capital:`;
    curtext.innerHTML = `Currency:`;
    lantext.innerHTML = `Language:`;
    scoretext.innerHTML = `Score:`;
  }
}
const map = L.map('mapid').setView([0, 0], 3);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);
let guessMarker = "";
let marker = "";
function drawMap({ name, latlng: [latitude, longitude] }) {

  if (name == "Guess") {
    if (map.hasLayer(guessMarker)) {
      map.removeLayer(guessMarker);
    }
    guessMarker = L.circle([latitude, longitude], {
      color: 'red',
      fillColor: '#f03',
      fillOpacity: 0.5,
      radius: 50
    }).addTo(map)
      .bindPopup(name)
      .openPopup();
    map.setView([latitude, longitude]);
  }
  else if (!guessbtn.classList.contains("answered")) {
    guessbtn.classList.add("answered");
    guessbtn.innerHTML = "Play Again";

    marker = L.marker([latitude, longitude]).addTo(map)
      .bindPopup(name)
      .openPopup();
    map.setView([latitude, longitude]);
    answer();
  } else {
    guessbtn.classList.remove("answered");
    guessbtn.innerHTML = "Answer";
    map.removeLayer(marker);
    refreshCountry();
    answer("r");
  }
}

guessbtn.addEventListener('click', () => drawMap(country));
map.addEventListener('click', (e) => drawMap({ name: "Guess", latlng: [e.latlng.lat.toFixed(5), e.latlng.lng.toFixed(5)] }));
