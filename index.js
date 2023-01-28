let guessMarker = "";
let answerMarker = "";
let roundScore = 0;
let totalScore = 0;
const aside = document.querySelector("aside");

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

// Show a random country
function refreshCountry() {
  // re-assign object
  const randCountry = Math.floor(Math.random() * 250);
  //remove "United States Minor Outlying Islands" as it has no latlng
  country.name = countriesList[randCountry].name || "";
  country.flag = countriesList[randCountry].flag || "";
  country.population = countriesList[randCountry].population || "";
  country.capital = countriesList[randCountry].capital || "";
  country.currency = countriesList[randCountry].currencies[0].name || "";
  country.latlng = countriesList[randCountry].latlng || "";
  country.language = [];
  countriesList[randCountry].languages.forEach((lang) => {
    country.language.push(lang.name);
  });
  flagimg.innerHTML = `<img src="${country.flag || "#"}">`;
}

// Fetch and display data
async function fetchCountries() {
  // fetch
  const blob = await fetch("https://restcountries.com/v2/all");
  const json = await blob.json();
  countriesList.push(...json);
  // assign
  refreshCountry();
}
fetchCountries();

// Leaflet API for displaying maps = "L"
const bounds = new L.LatLngBounds(new L.LatLng(-170, -180), new L.LatLng(180, 180));
const map = new L.map('mapid', { maxBounds: bounds, maxBoundsViscosity: 1.0 }).setView([0, 0], 3);
// Add openstreetmap to leaflet
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

// Drawing on map
function drawMap({ name, latlng: [latitude, longitude] }) {
  if (map.hasLayer(guessMarker)) {
    map.removeLayer(guessMarker);
  }
  guessMarker = L.circle([latitude, longitude], {
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 1,
    radius: 50000
  }).addTo(map)
    .bindPopup(name)
    .openPopup();
  map.setView([latitude, longitude]);
}
function buttonHandler({ name, latlng: [latitude, longitude] }) {
  if (guessbtn.classList.contains("answered")) {
    //if clicking reset
    aside.classList.add("hidden");
    guessbtn.classList.remove("answered");
    guessbtn.innerHTML = "Answer";
    map.removeLayer(answerMarker);
    map.removeLayer(guessMarker);
    refreshCountry();
    // reset dom data
    answertext.innerHTML = ``;
    poptext.innerHTML = ``;
    captext.innerHTML = ``;
    curtext.innerHTML = ``;
    lantext.innerHTML = ``;
    roundscore.innerHTML = ``;
  }
  else {
    // if clicking guess
    aside.classList.remove("hidden");
    guessbtn.classList.add("answered");
    guessbtn.innerHTML = "Play Again";
    answerMarker = new L.marker([latitude, longitude]).addTo(map)
      .bindPopup(name)
      .openPopup();
    map.setView([latitude, longitude]);
    // display dom data
    answertext.innerHTML = `${country.name}`;
    captext.innerHTML = `Capital:`;
    capval.innerHTML = country.capital;
    poptext.innerHTML = `Population:`;
    popval.innerHTML = new Intl.NumberFormat().format(country.population);
    curtext.innerHTML = `Currency:`;
    curval.innerHTML = country.currency;
    lantext.innerHTML = `Languages:`;
    if (country.language.length > 1) {
      lanval.innerHTML = country.language.join(", ");
    } else {
      lanval.innerHTML = country.language[0];
    }
    // calc score if user has made a guess
    roundScore = Math.pow(
      (360 - (Math.abs(guessMarker._latlng.lng - answerMarker._latlng.lng) + Math.abs(guessMarker._latlng.lat - answerMarker._latlng.lat))) / 358
      , 5) * 100 || 0;
    roundScore = Math.round(Math.max(Math.min(roundScore, 100), 0));
    totalScore += roundScore;
    roundscore.innerHTML = `Score: ${roundScore}/100`;
    totalscore.innerHTML = `Total score: ${totalScore}`
  }
}

guessbtn.addEventListener('click', () => buttonHandler(country));
map.addEventListener('click', (e) => drawMap({ name: "Guess", latlng: [e.latlng.lat.toFixed(5), e.latlng.lng.toFixed(5)] }));
