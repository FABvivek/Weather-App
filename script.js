const apiKey = "d9fcc3990f22c87c26364a4227affdd1";
const weatherApiUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric";

const rapidApiKey = "371bbed6f2msh4d4f63177f5729ep15b5ddjsn26b449122fdb";
const rapidApiHost = "wft-geo-db.p.rapidapi.com";

const cityInput = document.getElementById("cityInput");
const searchBtn = document.querySelector(".search button");
const weatherIcon = document.querySelector(".weather-icon");
const suggestionsList = document.getElementById("suggestions");

async function fetchWeather(url) {
    const response = await fetch(url);
    if (response.status === 404) {
        document.querySelector(".error").style.display = "block";
        document.querySelector(".weather").style.display = "none";
    } else {
        const data = await response.json();
        document.querySelector(".city").textContent = data.name;
        document.querySelector(".temp").textContent = Math.round(data.main.temp) + "°C";
        document.querySelector(".humidity").textContent = data.main.humidity + "%";
        document.querySelector(".wind").textContent = data.wind.speed + " km/h";

        const condition = data.weather[0].main;
        const icons = {
            Clouds: "clouds.png",
            Clear: "clear.png",
            Rain: "rain.png",
            Drizzle: "drizzle.png",
            Mist: "mist.png"
        };
        weatherIcon.src = "images/" + (icons[condition] || "clouds.png");

        document.querySelector(".weather").style.display = "block";
        document.querySelector(".error").style.display = "none";
    }
}

function checkWeather(city) {
    const url = `${weatherApiUrl}&q=${city}&appid=${apiKey}`;
    fetchWeather(url);
}

function getWeatherByLocation(lat, lon) {
    const url = `${weatherApiUrl}&lat=${lat}&lon=${lon}&appid=${apiKey}`;
    fetchWeather(url);
}

searchBtn.addEventListener("click", () => {
    checkWeather(cityInput.value);
});

cityInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        checkWeather(cityInput.value);
        suggestionsList.style.display = "none";
    }
});

// Auto-detect location
window.addEventListener("load", () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                getWeatherByLocation(position.coords.latitude, position.coords.longitude);
            },
            error => {
                //checkWeather("Pune");
            }
        );
    } else {
        //checkWeather("Pune");
    }
});

// City suggestion
async function getCitySuggestions(query) {
    const response = await fetch(
        `https://wft-geo-db.p.rapidapi.com/v1/geo/cities?namePrefix=${query}&limit=5&sort=-population`,
        {
            method: "GET",
            headers: {
                "X-RapidAPI-Key": rapidApiKey,
                "X-RapidAPI-Host": rapidApiHost
            }
        }
    );

    const result = await response.json();
    return result.data.map(city => city.name);
}

cityInput.addEventListener("input", async () => {
    const query = cityInput.value.trim();
    if (query.length < 2) {
        suggestionsList.style.display = "none";
        return;
    }

    const suggestions = await getCitySuggestions(query);
    suggestionsList.innerHTML = "";
    suggestions.forEach(city => {
        const li = document.createElement("li");
        li.textContent = city;
        li.addEventListener("click", () => {
            cityInput.value = city;
            suggestionsList.innerHTML = "";
            suggestionsList.style.display = "none";
            checkWeather(city);
        });
        suggestionsList.appendChild(li);
    });

    suggestionsList.style.display = "block";
});

document.addEventListener("click", (e) => {
    if (!e.target.closest(".search")) {
        suggestionsList.style.display = "none";
    }
});
