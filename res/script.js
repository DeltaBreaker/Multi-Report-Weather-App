/*----------------------------------------Setup----------------------------------------*/
var baseGeoURL = "https://api.openweathermap.org/geo/1.0/direct?q=";
var baseForecastUrl = "https://api.openweathermap.org/data/2.5/forecast?lat=";
var apiKey = "6992b9ccb68fd1c4ce20682131e41c4c";
var unitType = "imperial";
var dayLimit = 5;
var loadingData = false;
var searchList = $("#search-history");
var searchHistory = [];

// Adds a listener to fetch weather data when the button is clicked
$("#search-button").on("click", function() {
    // Prevents starting another fetch request until the current one has finished
    if(!loadingData) {
        var input = document.getElementById("search-input").value;
        loadWeatherData(input);
        loadingData = true;
    }
});

loadFromLocalStorage();
/*-------------------------------------------------------------------------------------*/

/*----------------------------------------Functions----------------------------------------*/
// This checks to see if the search history already contains the given city then updates the history and creates a button if not
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

// This saves the current search history into local storage
function saveToLocalStorage() {
    var stringBuilder = "";
    for(const i of searchHistory) {
        stringBuilder += i + "$";
    }
    localStorage.setItem("history", stringBuilder);
}

// This loads the search history from local storage and creates buttons for each city
function loadFromLocalStorage() {
    var history = localStorage.getItem("history").split("$");
    for(const i of history) {
        if(i !== "") {
            addToHistory(i);
        }
    }
}

// This builds the first URL used for location data
function buildGeoUrl(city, apiKey) {
    return baseGeoURL + city + "&apikey=" + apiKey;
}

// This builds the second url used for weather data
function buildForecastUrl(lat, lon, unitType, apiKey) {
    return baseForecastUrl + lat + "&lon=" + lon + "&units=" + unitType + "&apikey=" + apiKey;
}

// This creates a fetch request for weather data and updates the results with the returned information
function loadWeatherData(city) {
    // Fetch the location data first
    fetch(buildGeoUrl(city, apiKey)).then(function(response) {
        if(response.ok) {
            response.json().then(function(data) {
                var lat = data[0].lat;
                var lon = data[0].lon;
               
                // Fetch weather data based on the retrieved location data
                fetch(buildForecastUrl(lat, lon, unitType, apiKey)).then(function(response) {
                    if(response.ok) {
                        response.json().then(function(data) {
                            // This block updates the main information display
                            var currentDate = moment.unix(data.list[0].dt).format("MMM Do YYYY");
                            $("#result-today-city").text(data.city.name + ", " + data.city.country + " " + currentDate);
                            $("#result-icon").attr("src", "http://openweathermap.org/img/wn/" + data.list[0].weather[0].icon + ".png");
                            $("#current-temp").text("Temp: " + data.list[0].main.temp + "°F");
                            $("#current-wind").text("Wind: " + data.list[0].wind.speed + " MPH");
                            $("#current-humidity").text("Humidity: " + data.list[0].main.humidity + "%");

                            // This gets and clears the elements within the sub displays
                            var weekResults = $("#week-results");
                            weekResults.empty();

                            // Loops through each sub display and creates children elements
                            for(var i = 1; i < dayLimit + 1; i++) {
                                // Creates the container
                                var result = $("<div>");
                                result.css("border", "2px solid #b55088");
                                result.css("flex", "0 0 18%");

                                // Creates the date element
                                var dateHeader = $("<h3>");
                                dateHeader.text(moment.unix(data.list[i * 8 - 1].dt).format("MMM Do YYYY"));
                                result.append(dateHeader);

                                // Creates and gets the image from given URL based on the weather type
                                var icon = $("<img>");
                                icon.attr("src", "http://openweathermap.org/img/wn/" + data.list[i].weather[0].icon + ".png");
                                icon.addClass("center-aligned");
                                result.append(icon);

                                // Creates the temperature element
                                var tempHeader = $("<h4>");
                                tempHeader.text("Temp: " + data.list[i * 8 - 1].main.temp + "°F");
                                result.append(tempHeader);

                                // Creates the wind element
                                var windHeader = $("<h4>");
                                windHeader.text("Wind: " + data.list[i * 8 - 1].wind.speed + " MPH");
                                result.append(windHeader);

                                // Creates the humidity element
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
/*-----------------------------------------------------------------------------------------*/