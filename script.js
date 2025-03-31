const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardDiv = document.querySelector(".weather-cards");

const API_KEY = "b71b1cef972d9a6646b1854c1e0da016";

// Create weather card function
const createWeatherCard = (cityName, weatherItem, index) => {
    const tempCelsius = (weatherItem.main.temp).toFixed(2);
    const iconUrl = `https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png`;
    
    // Format the date from the forecast timestamp
    const forecastDate = new Date(weatherItem.dt * 1000);
    const dayOfWeek = forecastDate.toLocaleString('en-us', { weekday: 'long' }); // Get day of the week
    const date = forecastDate.toLocaleDateString(); // Get only the date without time

    if (index === 0) {
        return `
            <div class="details">
                <h2>${cityName}</h2>
                <h4>${dayOfWeek}, ${date}</h4> <!-- Show day and date -->
                <h4>🌡️ Temperature: ${tempCelsius}&deg;C</h4>
                <h4>💨 Wind: ${weatherItem.wind.speed} M/S</h4>
                <h4>💧 Humidity: ${weatherItem.main.humidity}%</h4>
            </div>
            <div class="icon">
                <img src="${iconUrl}" alt="weather-icon">
                <h4>${weatherItem.weather[0].description}</h4>
            </div>`;
    } else {
        return `
            <li class="card">
                <h4>${dayOfWeek}, ${date}</h4> <!-- Show day and date -->
                <img src="${iconUrl}" alt="weather-icon">
                <h4>🌡️ Temp: ${tempCelsius}&deg;C</h4>
                <h4>💨 Wind: ${weatherItem.wind.speed} M/S</h4>
                <h4>💧 Humidity: ${weatherItem.main.humidity}%</h4>
            </li>`;
    }
};

// Fetch weather details function
const getWeatherDetails = (cityName, lat, lon) => {
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
    
    fetch(WEATHER_API_URL)
        .then(res => res.json())
        .then(data => {
            const uniqueForecastDays = [];
            const fiveDaysForecast = data.list.filter(forecast => {
                const forecastDate = new Date(forecast.dt * 1000).getDate();
                if (!uniqueForecastDays.includes(forecastDate)) {
                    uniqueForecastDays.push(forecastDate);
                    return true;
                }
                return false;
            });
            
            cityInput.value = "";
            currentWeatherDiv.innerHTML = "";
            weatherCardDiv.innerHTML = "";
            
            fiveDaysForecast.forEach((weatherItem, index) => {
                if (index === 0) {
                    currentWeatherDiv.innerHTML = createWeatherCard(cityName, weatherItem, index);
                } else {
                    weatherCardDiv.innerHTML += createWeatherCard(cityName, weatherItem, index);
                }
            });
        })
        .catch(() => alert("An error occurred while fetching the weather forecast!"));
};

// Get city coordinates function
const getCityCoordinates = () => {
    const cityName = cityInput.value.trim();
    if (!cityName) return;
    const GEOCODING_API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;
    
    fetch(GEOCODING_API_URL)
        .then(res => res.json())
        .then(data => {
            if (data.length === 0) return alert(`No coordinates found for ${cityName}`);
            const { name, lat, lon } = data[0];
            getWeatherDetails(name, lat, lon);
        })
        .catch(() => alert("An error occurred while fetching the coordinates!"));
};

// Get user coordinates function
const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude } = position.coords;
            const REVERSE_GEOCODING_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
            
            fetch(REVERSE_GEOCODING_URL)
                .then(res => res.json())
                .then(data => {
                    const { name } = data[0];
                    getWeatherDetails(name, latitude, longitude);
                })
                .catch(() => alert("An error occurred while fetching the city!"));
        },
        error => {
            if (error.code === error.PERMISSION_DENIED) {
                alert("Geolocation request denied. Please enable location permissions and try again.");
            }
        }
    );
};

// Event listeners
locationButton.addEventListener("click", getUserCoordinates);
searchButton.addEventListener("click", getCityCoordinates);
cityInput.addEventListener("keyup", e => e.key === "Enter" && getCityCoordinates());
