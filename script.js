const apiKey = "YOUR_API_KEY"; // Replace with your OpenWeatherMap API key
const searchBtn = document.getElementById("searchBtn");
const cityInput = document.getElementById("cityInput");
const weatherResult = document.getElementById("weatherResult");
const errorMessage = document.getElementById("errorMessage");
const forecastSection = document.getElementById("forecast");
const forecastCards = document.getElementById("forecastCards");

// Fetch current weather by city
async function getWeather(city) {
  if (!city) {
    errorMessage.textContent = "Please enter a city name.";
    weatherResult.classList.add("hidden");
    return;
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("City not found");
    const data = await response.json();

    displayWeather(data);
    getForecast(data.coord.lat, data.coord.lon); // fetch forecast too
  } catch {
    errorMessage.textContent = "City not found. Please try again.";
    weatherResult.classList.add("hidden");
    forecastSection.classList.add("hidden");
  }
}

// Fetch current weather by coordinates
async function getWeatherByCoords(lat, lon) {
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Weather data not found");
    const data = await response.json();

    displayWeather(data);
    getForecast(lat, lon); // fetch forecast too
  } catch {
    errorMessage.textContent = "Unable to fetch weather for your location.";
    weatherResult.classList.add("hidden");
    forecastSection.classList.add("hidden");
  }
}

// Fetch 5-day forecast
async function getForecast(lat, lon) {
  try {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Forecast not found");
    const data = await response.json();

    displayForecast(data);
  } catch {
    forecastSection.classList.add("hidden");
  }
}

// Display current weather
function displayWeather(data) {
  document.getElementById("cityName").textContent = data.name;
  document.getElementById("description").textContent =
    data.weather[0].description;
  document.getElementById("temperature").textContent = Math.round(
    data.main.temp
  );
  document.getElementById("humidity").textContent = data.main.humidity;
  document.getElementById("wind").textContent = data.wind.speed;
  document.getElementById(
    "weatherIcon"
  ).src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

  errorMessage.textContent = "";
  weatherResult.classList.remove("hidden");
}

// Display 5-day forecast
function displayForecast(data) {
  forecastCards.innerHTML = "";

  // OpenWeather gives 3-hourly forecasts. We'll pick 1 forecast per day (12:00 PM)
  const daily = {};
  data.list.forEach((item) => {
    const date = item.dt_txt.split(" ")[0];
    if (item.dt_txt.includes("12:00:00") && !daily[date]) {
      daily[date] = item;
    }
  });

  Object.keys(daily)
    .slice(0, 5)
    .forEach((date) => {
      const forecast = daily[date];
      const card = document.createElement("div");
      card.classList.add("forecast-card");

      card.innerHTML = `
      <h4>${new Date(date).toLocaleDateString(undefined, {
        weekday: "short",
      })}</h4>
      <img src="https://openweathermap.org/img/wn/${
        forecast.weather[0].icon
      }@2x.png" alt="">
      <p>${Math.round(forecast.main.temp)}°C</p>
      <p>${forecast.weather[0].description}</p>
    `;

      forecastCards.appendChild(card);
    });

  forecastSection.classList.remove("hidden");
}

// Event listener for manual search
searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  getWeather(city);
});

// Detect user location on page load
window.addEventListener("load", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        getWeatherByCoords(latitude, longitude);
      },
      () => {
        errorMessage.textContent =
          "Location access denied. Please search by city.";
      }
    );
  } else {
    errorMessage.textContent = "Geolocation not supported by your browser.";
  }
});
