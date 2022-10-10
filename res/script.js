var baseGeoURL = "https://api.openweathermap.org/geo/1.0/direct?q=";
var baseForecastUrl = "https://api.openweathermap.org/data/2.5/forecast?lat=";
var apiKey = "6992b9ccb68fd1c4ce20682131e41c4c";
var unitType = "imperial";

loadWeatherData("corona");

function buildGeoUrl(city, apiKey) {
    return baseGeoURL + city + "&apikey=" + apiKey;
}

function buildForecastUrl(lat, lon, unitType, apiKey) {
    return baseForecastUrl + lat + "&lon=" + lon + "&units=" + unitType + "&apikey=" + apiKey;
}

function loadWeatherData(city) {
    fetch(buildGeoUrl(city, apiKey)).then(function(response) {
        if(response.ok) {
            response.json().then(function(data) {
                var lat = data[0].lat;
                var lon = data[0].lon;
                
                fetch(buildForecastUrl(lat, lon, unitType, apiKey)).then(function(response) {
                    if(response.ok) {
                        response.json().then(function(data) {
                            console.log(data);
                            console.log(moment.unix(data.list[0].dt).format("MMM Do YYYY"));
                        });
                    }
                });
            });
        }
    });
}