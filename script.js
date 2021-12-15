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

class Workout {
  date = new Date();
  id = (Date.now() + '').slice(-10);
  clicks = 0;
  constructor(coords, distance, duration) {
    this.coords = coords;
    this.distance = distance;
    this.duration = duration;
  }
  _setDescription(workout) {
    // Running on April 14
    this.description = `${this.type[0].toUpperCase() + this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }
  click() {
    this.clicks++;
  }
}
class Runnning extends Workout {
  type = 'running';
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
    this._setDescription();
  }
  calcPace() {
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}
class Cycling extends Workout {
  type = 'cycling';
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.calcSpeed();
    this._setDescription();
  }
  calcSpeed() {
    this.speed = this.duration / (this.distance / 60);
    return this.speed;
  }
}
class App {
  #mapEventG;
  #map;
  #workouts = [];

  constructor() {
    this._getPosition();
    this._getStorage();
    form.addEventListener('submit', this._newWorkout.bind(this));
    inputType.addEventListener('change', this._toggleElevationField);
    containerWorkouts.addEventListener('click', this._moveToPopup.bind(this));
  }

  _getPosition() {
    //On loading the page
    if (navigator.geolocation) {
      //Loading the map
      navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), () => {
        //Error Handling
        alert('Unable to get the location');
      });
    }
  }

  _loadMap(position) {
    const { latitude, longitude } = position.coords;
    const coords = [latitude, longitude];

    this.#map = L.map('map').setView(coords, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.fr/hot/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    //Leaflet event listener
    this.#map.on('click', this._showForm.bind(this));
    this.#workouts.forEach(work => {
      this._addMarker(work);
    });
  }

  _showForm(mapEvent) {
    this.#mapEventG = mapEvent;
    form.classList.remove('hidden');
    inputDistance.focus();
  }
  _hideForm() {
    form.style.display = 'none';
    form.classList.add('hidden');

    setInterval(() => (form.style.display = 'grid'), 1000);
    //Ressetting the field values
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        '';
  }
  _toggleElevationField() {
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _newWorkout(event) {
    event.preventDefault();
    //Get the data from the form
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat: lattitude, lng: longitude } = this.#mapEventG.latlng;
    const coords = [lattitude, longitude];
    let workout;

    const validInputs = function (...inputs) {
      return inputs.every(input => Number.isFinite(input));
    };
    const allPositive = function (...inputs) {
      return inputs.every(input => input > 0);
    };
    //Check if the data is valid
    if (type === 'running') {
      const cadence = +inputCadence.value;
      if (
        !(
          validInputs(distance, duration, cadence) &&
          allPositive(distance, duration, cadence)
        )
      ) {
        return alert('Enter a valid number');
      }
      workout = new Runnning(coords, distance, duration, cadence);
    }
    if (type === 'cycling') {
      const elevation = +inputElevation.value;
      if (
        !(
          validInputs(distance, duration, elevation) &&
          allPositive(distance, duration)
        )
      ) {
        return alert('Enter a valid number');
      }
      workout = new Cycling(coords, distance, duration, elevation);
    }
    this.#workouts.push(workout);
    this._renderWorkout(workout);
    //If workout is cycling, create Cycling Object

    //If workout is running, create Running Object

    //Add new Object to the workout array

    //Render the workouts on the map using marker

    //Adding marker after Submitting
    this._addMarker(workout);
    this._hideForm();
    this._setLocalStorage();
  }
  _renderWorkout(workout) {
    let html = `
        <li class="workout workout--${workout.type}" data-id=${workout.id}>
        <h2 class="workout__title">${workout.description}</h2>
        <div class="workout__details">
            <span class="workout__icon">${
              workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
            }</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
        </div>
        <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
        </div>
    `;

    if (workout.type === 'running') {
      html += `
        <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.pace.toFixed(2)}</span>
            <span class="workout__unit">min/km</span>
        </div>
        <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
        </div>
    </li>
      `;
    }
    if (workout.type === 'cycling') {
      html += `
        <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed.toFixed(2)}</span>
            <span class="workout__unit">km/h</span>
        </div>
        <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevationGain}</span>
            <span class="workout__unit">m</span>
        </div>
    </li>
      `;
    }
    form.insertAdjacentHTML('afterend', html);
  }
  _addMarker(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          maxHeight: 100,
          className: `${workout.type}-popup`,
          autoClose: false,
          closeOnClick: false,
        })
      )
      .setPopupContent(
        `${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.description}`
      )
      .openPopup();
  }
  _moveToPopup(event) {
    const workoutEl = event.target.closest('.workout');
    if (!workoutEl) return;
    const workout = this.#workouts.find(
      work => work.id === workoutEl.dataset.id
    );
    this.#map.setView(workout.coords, 14, {
      animate: true,
      pan: {
        duration: 1,
      },
    });
    console.log(workout);
  }
  _setLocalStorage() {
    localStorage.setItem('workouts', JSON.stringify(this.#workouts));
  }
  _getStorage() {
    const data = JSON.parse(localStorage.getItem('workouts'));

    if (!data) return;

    this.#workouts = data;
    this.#workouts.forEach(work => {
      this._renderWorkout(work);
    });
  }
  reset() {
    localStorage.removeItem('workouts');
    location.reload();
  }
}

const app = new App();
