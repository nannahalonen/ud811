
(function() {
  'use strict';

  var weatherAPIUrlBase = 'http://api.apixu.com/v1/forecast.json?key=' + API_KEY + '&days=7&q=';

  var app = {
    isLoading: true,
    visibleCards: {},
    selectedCities: [],
    spinner: document.querySelector('.loader'),
    cardTemplate: document.querySelector('.cardTemplate'),
    container: document.querySelector('.main'),
    addDialog: document.querySelector('.dialog-container'),
    daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  };

  var injectedForecast = {
  	key: 'tampere',
  	label: 'Tampere, Finland',
  	current:
  	{
  		last_updated: "2019-01-28 12:45",
  		temp_c: -7,
  		condition:
  		{
  			text: "Blowing snow",
  			icon: "//cdn.apixu.com/weather/64x64/day/227.png",
  		},
  		wind_kph: 29.9,
  		precip_mm: 0.1,
  		humidity: 86,
  		feelslike_c: -15.6,
  	},
  	forecast:
  	{
  		forecastday: [
  		{
  			day:
  			{
  				maxtemp_c: -5.7,
  				mintemp_c: -14,
  				avgtemp_c: -8.2,
  				condition:
  				{
  					icon: "//cdn.apixu.com/weather/64x64/day/371.png",
  				},
  			},
  		},
  		{
  			day:
  			{
  				maxtemp_c: -2.9,
  				mintemp_c: -8.9,
  				condition:
  				{
  					icon: "//cdn.apixu.com/weather/64x64/day/338.png",
  				},
  			},
  		},
  		{
  			day:
  			{
  				maxtemp_c: 0.7,
  				mintemp_c: -8.5,
  				condition:
  				{
  					icon: "//cdn.apixu.com/weather/64x64/day/338.png",
  				},
  			},
  		},
  		{
  			day:
  			{
  				maxtemp_c: -1.9,
  				mintemp_c: -10,
  				condition:
  				{
  					icon: "//cdn.apixu.com/weather/64x64/day/311.png",
  				},
  			},
  		},
  		{
  			day:
  			{
  				maxtemp_c: 1.1,
  				mintemp_c: -0.5,
  				condition:
  				{
  					icon: "//cdn.apixu.com/weather/64x64/day/317.png",
  				},
  			},
  		},
  		{
  			day:
  			{
  				maxtemp_c: 0.3,
  				mintemp_c: -6.7,
  				condition:
  				{
  					icon: "//cdn.apixu.com/weather/64x64/day/332.png",
  				},
  			},
  		},
  		{
  			day:
  			{
  				maxtemp_c: 1.3,
  				mintemp_c: -4,
  				condition:
  				{
  					icon: "//cdn.apixu.com/weather/64x64/day/332.png",
  				},
  			},
  		}]
  	}
  };


  /*****************************************************************************
   *
   * Event listeners for UI elements
   *
   ****************************************************************************/

  /* Event listener for refresh button */
  document.getElementById('butRefresh').addEventListener('click', function() {
    app.updateForecasts();
  });

  /* Event listener for add new city button */
  document.getElementById('butAdd').addEventListener('click', function() {
    // Open/show the add new city dialog
    app.toggleAddDialog(true);
  });

  /* Event listener for add city button in add city dialog */
  document.getElementById('butAddCity').addEventListener('click', function() {
    var select = document.getElementById('selectCityToAdd');
    var selected = select.options[select.selectedIndex];
    var key = selected.value;
    var label = selected.textContent;
    app.getForecast(key, label);
    app.selectedCities.push({key: key, label: label});
    app.saveSelectedCities();
    app.toggleAddDialog(false);
  });

  /* Event listener for cancel button in add city dialog */
  document.getElementById('butAddCancel').addEventListener('click', function() {
    app.toggleAddDialog(false);
  });


  /*****************************************************************************
   *
   * Methods to update/refresh the UI
   *
   ****************************************************************************/

  // Toggles the visibility of the add new city dialog.
  app.toggleAddDialog = function(visible) {
    if (visible) {
      app.addDialog.classList.add('dialog-container--visible');
    } else {
      app.addDialog.classList.remove('dialog-container--visible');
    }
  };

  // Updates a weather card with the latest weather forecast. If the card
  // doesn't already exist, it's cloned from the template.
  app.updateForecastCard = function(data) {

    var card = app.visibleCards[data.key];
    if (!card) {
      card = app.cardTemplate.cloneNode(true);
      card.classList.remove('cardTemplate');
      card.querySelector('.location').textContent = data.label;
      card.removeAttribute('hidden');
      app.container.appendChild(card);
      app.visibleCards[data.key] = card;
    }
    card.querySelector('.description').textContent = data.current.condition.text;
    card.querySelector('.date').textContent =
      new Date(data.current.last_updated);
    card.querySelector('.current .icon-img').src = data.current.condition.icon;
    card.querySelector('.current .temperature .value').textContent =
      Math.round(data.current.temp_c);
    card.querySelector('.current .feels-like .value').textContent =
      Math.round(data.current.feelslike_c);
    card.querySelector('.current .precip').textContent =
      Math.round(data.current.precip_mm) + 'mm';
    card.querySelector('.current .humidity').textContent =
      Math.round(data.current.humidity) + '%';
    card.querySelector('.current .wind .value').textContent =
      Math.round(data.current.wind_kph);
    card.querySelector('.current .wind .direction').textContent =
      data.current.windBearing;
    var nextDays = card.querySelectorAll('.future .oneday');
    var today = new Date();
    today = today.getDay();
    for (var i = 0; i < 7; i++) {
      var nextDay = nextDays[i];
      var daily = data.forecast.forecastday[i];
      if (daily && nextDay) {
        nextDay.querySelector('.date').textContent =
          app.daysOfWeek[(i + today) % 7];
        nextDay.querySelector('.icon-img').src = daily.day.condition.icon;
        nextDay.querySelector('.temp-high .value').textContent =
          Math.round(daily.day.maxtemp_c);
        nextDay.querySelector('.temp-low .value').textContent =
          Math.round(daily.day.mintemp_c);
      }
    }
    if (app.isLoading) {
      app.spinner.setAttribute('hidden', true);
      app.container.removeAttribute('hidden');
      app.isLoading = false;
    }
  };


  /*****************************************************************************
   *
   * Methods for dealing with the model
   *
   ****************************************************************************/

  // Gets a forecast for a specific city and update the card with the data
  app.getForecast = function(key, label) {

    var url = weatherAPIUrlBase + label;
    // Make the XHR to get the data, then update the card
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
      if (request.readyState === XMLHttpRequest.DONE) {
        if (request.status === 200) {
          var response = JSON.parse(request.response);
          response.key = key;
          response.label = label;
          app.updateForecastCard(response);
        }
      }
    };
    request.open('GET', url);
    request.send();
  };

  // Iterate all of the cards and attempt to get the latest forecast data
  app.updateForecasts = function() {
    var keys = Object.keys(app.visibleCards);
    keys.forEach(function(key) {
      app.getForecast(key);
    });
  };

  app.saveSelectedCities = function() {
    window.localforage.setItem('selectedCities', app.selectedCities);
  };

  document.addEventListener('DOMContentLoaded', function() {
    window.localforage.getItem('selectedCities', function(err, cityList) {
      if (cityList) {
        app.selectedCities = cityList;
        app.selectedCities.forEach(function(city) {
          app.getForecast(city.key, city.label);
        });
      } else {
        app.updateForecastCard(injectedForecast);
        app.selectedCities = [
          {key: injectedForecast.key, label: injectedForecast.label}
        ];
        app.saveSelectedCities();
      }
    });    
  });

})();
