var baseGeoURL = "https://api.openweathermap.org/geo/1.0/direct?q=";
var baseForecastUrl = "https://api.openweathermap.org/data/2.5/forecast?lat=";
var apiKey = "6992b9ccb68fd1c4ce20682131e41c4c";
var unitType = "imperial";
var dayLimit = 5;
var loadingData = false;
var searchList = $("#search-history");
var searchHistory = [];

$("#search-button").on("click", function() {
    if(!loadingData) {
        var input = document.getElementById("search-input").value;
        loadWeatherData(input);
        loadingData = true;
    }
});

loadFromLocalStorage();

function addToHistory(input) {
    if(!searchHistory.includes(input)) {
        searchHistory.push(input);

        var historyButton = $("<button>");
        historyButton.text(input);
        historyButton.addClass("history-button center-aligned");
        historyButton.on("click", function() {
            loadWeatherData($(this).text());
        });
        saveToLocalStorage();

        searchList.append(historyButton);
    }
}

function saveToLocalStorage() {
    var stringBuilder = "";
    for(const i of searchHistory) {
        stringBuilder += i + "$";
    }
    localStorage.setItem("history", stringBuilder);
}

function loadFromLocalStorage() {
    var history = localStorage.getItem("history").split("$");
    for(const i of history) {
        if(i !== "") {
            addToHistory(i);
        }
    }
}

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
                            var currentDate = moment.unix(data.list[0].dt).format("MMM Do YYYY");
                            $("#result-today-city").text(data.city.name + ", " + data.city.country + " " + currentDate);
                            $("#result-icon").attr("src", "http://openweathermap.org/img/wn/" + data.list[0].weather[0].icon + ".png");
                            $("#current-temp").text("Temp: " + data.list[0].main.temp + "°F");
                            $("#current-wind").text("Wind: " + data.list[0].wind.speed + " MPH");
                            $("#current-humidity").text("Humidity: " + data.list[0].main.humidity + "%");

                            var weekResults = $("#week-results");
                            weekResults.empty();

                            for(var i = 1; i < dayLimit + 1; i++) {
                                var result = $("<div>");
                                result.css("border", "2px solid #b55088");
                                result.css("flex", "0 0 18%");

                                var dateHeader = $("<h3>");
                                dateHeader.text(moment.unix(data.list[i * 8 - 1].dt).format("MMM Do YYYY"));
                                result.append(dateHeader);

                                var icon = $("<img>");
                                icon.attr("src", "http://openweathermap.org/img/wn/" + data.list[i].weather[0].icon + ".png");
                                icon.addClass("center-aligned");
                                result.append(icon);

                                var tempHeader = $("<h4>");
                                tempHeader.text("Temp: " + data.list[i * 8 - 1].main.temp + "°F");
                                result.append(tempHeader);

                                var windHeader = $("<h4>");
                                windHeader.text("Wind: " + data.list[i * 8 - 1].wind.speed + " MPH");
                                result.append(windHeader);

                                var humidityHeader = $("<h4>");
                                humidityHeader.text("Humidity: " + data.list[i * 8 - 1].main.humidity + "%");
                                result.append(humidityHeader);

                                weekResults.append(result);
                            }

                            addToHistory(data.city.name);
                        });

                        $("#results-container").css("display", "flex");
                        loadingData = false;
                    }
                });
            });
        }
    });
}