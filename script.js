'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

//States
let mapEventG, map;

//Functions

//Event Handlers Functions
const onFormSubmit = function (event) {
  //Preventing the default reload
  event.preventDefault();

  //Ressetting the field values
  inputDistance.value =
    inputDuration.value =
    inputCadence.value =
    inputElevation.value =
      '';

  //Adding marker after Submitting
  const { lat: lattitude, lng: longitude } = mapEventG.latlng;
  const coords = [lattitude, longitude];
  L.marker(coords)
    .addTo(map)
    .bindPopup(
      L.popup({
        maxWidth: 250,
        maxHeight: 100,
        className: 'running-popup',
        autoClose: false,
        closeOnClick: false,
      })
    )
    .setPopupContent('Workout')
    .openPopup();
};
const onTypeChange = function () {
  inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
};

//On loading the page
if (navigator.geolocation) {
  //Loading the map
  navigator.geolocation.getCurrentPosition(
    position => {
      const { latitude, longitude } = position.coords;
      const coords = [latitude, longitude];

      map = L.map('map').setView(coords, 10);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.fr/hot/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      //Leaflet event listener
      map.on('click', function (mapEvent) {
        mapEventG = mapEvent;
        form.classList.remove('hidden');
        inputDistance.focus();
      });
    },
    () => {
      //Error Handling
      console.log('Failure');
    }
  );
}

//Event Listners
form.addEventListener('submit', onFormSubmit);
inputType.addEventListener('change', onTypeChange);
