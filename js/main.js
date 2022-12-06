function slickList(){
    $('.slick-list').slick({
        centerMode: false,
        centerPadding: '10px',
        slidesToShow: 2,
        variableWidth: true,
        infinite: false,
        autoplay: false,
        responsive: [
            {
                breakpoint: 1000,
                settings: {
                    centerMode: false,
                    centerPadding: '0',
                    slidesToShow: 2
                }
            },
            {
                breakpoint: 600,
                settings: {
                    centerMode: false,
                    centerPadding: '0',
                    slidesToShow: 1
                }
            }
        ]
    });
}

// WEATHER IMAGES
const weatherImg = new Map([
    ["01d", "../images/clear-day.svg"],
    ["01n", "../images/clear-night.svg"],
    ["02d", "../images/partly-cloudy-day.svg"],
    ["02n", "../images/partly-cloudy-night.svg"],
    ["03d", "../images/cloudy.svg"],
    ["03n", "../images/cloudy.svg"],
    ["04d", "../images/overcast.svg"],
    ["04n", "../images/overcast.svg"],
    ["09d", "../images/rain.svg"],
    ["09n", "../images/rain.svg"],
    ["10d", "../images/partly-cloudy-day-rain.svg"],
    ["10n", "../images/partly-cloudy-night-rain.svg"],
    ["11d", "../images/thunderstorms.svg"],
    ["11n", "../images/thunderstorms.svg"],
    ["13d", "../images/snow.svg"],
    ["13n", "../images/snow.svg"],
    ["50d", "../images/mist.svg"],
    ["50n", "../images/mist.svg"],
])

const nowDateTime = new Date();
if(nowDateTime.getHours() < 8 && nowDateTime.getHours() > 5){
    document.body.style.backgroundImage = `url(../images/sunrise.jpg)`;
}
else if(nowDateTime.getHours() < 19 && nowDateTime.getHours() > 8){
    document.body.style.backgroundImage = `url(../images/day.jpg)`;
}
else if(nowDateTime.getHours() < 20 && nowDateTime.getHours() > 19){
    document.body.style.backgroundImage = `url(../images/sunset.jpg)`;
}
else{
    document.body.style.backgroundImage = `url(../images/night.jpg)`;
}

// DOM 
const elSearchForm = document.querySelector(".js-search-form");
const elSearch = elSearchForm.querySelector(".js-search");
const elWeatherList = document.querySelector(".js-weather-list");
const elWeatherTemplate = document.querySelector(".js-weather-template").content;
const elNowWeatherImg = document.querySelector(".js-weather-now-img");
const elNowWeatherTitle = document.querySelector(".js-hero-weather-now-title");
const elNowWeatherCity = document.querySelector(".js-hero-weather-now-city");
const elNowWeatherTenperature = document.querySelector(".js-hero-weather-now-temperature");
const elNowDescHumidity = document.querySelector(".js-humidity");
const elNowDescAirPressure = document.querySelector(".js-airpressure");
const elNowDescWindSpeed = document.querySelector(".js-windspeed");

let weatherInfo = [];
let cityName = ""

function getNowWeather(obj){
    console.log(weatherImg.get(obj.weather[0]?.icon));
    console.log(obj.weather[0]?.icon);
    console.log(cityName);
    elNowWeatherImg.style.backgroundImage = `url(${weatherImg.get(obj.weather[0]?.icon)})`;
    elNowWeatherTitle.textContent = obj.weather[0]?.main;
    elNowWeatherCity.textContent = cityName;
    elNowWeatherTenperature.textContent = `${obj.main?.temp} °C`;
    elNowDescHumidity.textContent = `${obj.main?.humidity} %`
    elNowDescAirPressure.textContent = `${obj.main?.pressure} PS`
    elNowDescWindSpeed.textContent = `${obj.wind?.speed} km/h`
}

function renderWeather(arr, node){
    node.innerHTML = null;
    const elWeatherFrag = new DocumentFragment();

    const nowHour = new Date()
    arr.forEach((item, i) => {
        const elWeatherTemplateClone = elWeatherTemplate.cloneNode(true);
        const hour = Number(item.dt_txt.split(" ")[1].split(":")[0])
        const day = Number(item.dt_txt.split(" ")[0].split("-")[2])

        if(nowHour.getHours() == hour && nowHour.getDate() == day){
            getNowWeather(item);
            elWeatherTemplateClone.querySelector(".js-weather-item").classList.add("weather-item-active")
        }
        else if(nowHour.getHours() == hour+1 && nowHour.getDate() == day){
            getNowWeather(item);
            elWeatherTemplateClone.querySelector(".js-weather-item").classList.add("weather-item-active")
        }
        
        if(item.dt_txt.split(" ")[1].split(":")[0] > 12){
            elWeatherTemplateClone.querySelector(".js-weather-time").textContent = `${hour - 12} PM`
        }
        else{
            elWeatherTemplateClone.querySelector(".js-weather-time").textContent = `${hour} AM`
        }
        
        elWeatherTemplateClone.querySelector(".js-weather-temperature").textContent = `${item.main?.temp} °C`
        elWeatherTemplateClone.querySelector(".js-weather-feels-like-temperature").textContent = `Feels like ${item.main?.feels_like} °C`
        elWeatherTemplateClone.querySelector(".js-weather-item-overlay").dataset.id = i
        
        elWeatherFrag.appendChild(elWeatherTemplateClone);
    });
    node.appendChild(elWeatherFrag);
    node.classList.add("slick-list");
    slickList()
}



async function getInfo(city){
    try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/forecast?${city}&units=metric&appid=d7367f55f76f8f421d81ded5699ed50d`)

        const data = await res.json()

        cityName = data.city?.name
        weatherInfo = data.list;
        renderWeather(data.list, elWeatherList)
    } catch (error) {
        console.log(error);
    }
}

getInfo("q=Tashkent");

// GET USER GEO LOCATION 
const options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
};

function success(pos) {
    const crd = pos.coords;
    
    getInfo(`lat=${crd.latitude}&lon=${crd.longitude}`)
    console.log(`Latitude : ${crd.latitude}`);
    console.log(`Longitude: ${crd.longitude}`);
}

function error(err) {
    console.warn(`ERROR(${err.code}): ${err.message}`);
}

navigator.geolocation.getCurrentPosition(success, error, options);


elWeatherList.addEventListener("click", evt => {
    if(evt.target.matches(".js-weather-item-overlay")){
        const elWeatherItems = document.querySelectorAll(".js-weather-item");
        console.log(elWeatherItems);
        elWeatherItems.forEach(item => {
            item.classList.remove("weather-item-active");
        })
        evt.target.closest(".js-weather-item").classList.add("weather-item-active");
        getNowWeather(weatherInfo[evt.target.dataset.id])
    }
})