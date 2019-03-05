'use strict';

let model = {
    addExercise: function(duration) {
        let newExercise = {
            name: '',
            duration: duration,
        };
        let transaction = db.transaction(['exercises'], 'readwrite');
        let objectStore = transaction.objectStore('exercises');
        var request = objectStore.add(newExercise);

        request.onSuccess = function() {
        };

        transaction.oncomplete = function() {
            console.log('Transaction completed: database modified.');
            model.getExercises();
        };

        transaction.onerror = function() {
            console.log('Transaction not opened due to error.');
        };
    },
    getExercises: function() {
        let exercises = [];
        let objectStore = db.transaction('exercises').objectStore('exercises');
        objectStore.openCursor().onsuccess = function(e) {
            let cursor = e.target.result;
            if (cursor) {
                let exercise = {
                    id: cursor.value.id,
                    name: cursor.value.name,
                    duration: cursor.value.duration
                };
                exercises.push(exercise);
                cursor.continue();
            } else {
                // no more items
                view.displayExercises(exercises);
            }
        };
    },
    deleteExercise: function(exerciseId) {
        let transaction = db.transaction(['exercises'], 'readwrite');
        let objectStore = transaction.objectStore('exercises');
        let request = objectStore.delete(exerciseId);

        transaction.oncomplete = function() {
            console.log('Exercise ' + exerciseId + ' deleted.');
            model.getExercises();
        };
    },
    updateExercise: function(e) {
        let text = e.target.textContent;
        let exerciseId = e.target.parentNode.getAttribute('data-exercise-id');

        // update :) 2019-03-02: atomic, actionable progress ROCKS!
        let objectStore = db.transaction(['exercises'], 'readwrite').objectStore('exercises');
        let request = objectStore.get(parseInt(exerciseId));

        request.onsuccess = function() {
            let result = request.result;
            result.name = text;
            let updateRequest = objectStore.put(result);
            updateRequest.onsuccess = function() {
                console.log('Updated!');
                //model.getExercises();
            };
        };
    },
    startStopwatch: function() {
        seconds = 0;
        startTime = Date.now();
        updateTimeInterval = setInterval(view.updateTime, 100);
    },
    stopStopwatch: function() {
        var elapsedTime = Date.now() - startTime;
        this.addExercise(elapsedTime);
        clearInterval(updateTimeInterval);
        seconds = 0;
        view.resetTime();
    },
};

var view = {
    displayExercises: function(exercises) {
        let exercisesOl = document.getElementById('exercises');
        exercisesOl.innerHTML = '';

        exercises.forEach((item, position) => {
            let exerciseLi = document.createElement('li');
            exerciseLi.setAttribute('data-exercise-id', item.id);

            if (!item.name) {
                item.name = 'Exercise';
            }

            let exerciseNameElem = document.createElement('span');
            exerciseNameElem.textContent = item.name;
            exerciseNameElem.className = 'exerciseName';
            //exerciseNameElem.setAttribute('contenteditable', "true");
            exerciseNameElem.addEventListener('input', function(e) {
                model.updateExercise(e);
            });

            let exerciseDurationElem = document.createElement('span');
            exerciseDurationElem.className = 'exerciseDuration';
            exerciseDurationElem.textContent = (item.duration/1000).toFixed(1);

            let exerciseDeleteButton = document.createElement('button');
            exerciseDeleteButton.classList.add('exerciseDeleteButton', 'delete');

            exerciseDeleteButton.onclick = () => { model.deleteExercise(item.id); };

            exerciseLi.appendChild(exerciseNameElem);
            exerciseLi.appendChild(exerciseDurationElem);
            exerciseLi.appendChild(exerciseDeleteButton);

            exercisesOl.appendChild(exerciseLi);
        });
    },
    updateTime: function() {
        var elapsedTime = Date.now() - startTime;
        view.setTime((elapsedTime/1000).toFixed(1));
    },
    resetTime: function() {
        view.setTime('0.0');
    },
    setTime: function(text) {
        let stopwatchDiv = document.getElementById('stopwatch');
        stopwatchDiv.textContent = text;
    },
    setStartButton: function(state) {
        let startButton = document.getElementById('startExercise');
        startButton.hidden = !state;
    },
    setDoneButton: function(state) {
        let doneButton = document.getElementById('doneExercise');
        doneButton.hidden = !state;
    }
};

var handlers = {
    startStop: function(event) {
        var startStopButton = document.getElementById('startStopButton');
        if (recording === true) {
            recording = false;
            startStopButton.textContent = 'Start';
            model.stopStopwatch();
        } else {
            recording = true;
            startStopButton.textContent = 'Stop';
            model.startStopwatch();
        }
    },
    startStopwatch: function(event) {
        model.startStopwatch();
        view.setStartButton(false);
        view.setDoneButton(true);
    },
    stopStopwatch: function(event) {
        model.stopStopwatch();
        model.addExercise();
        model.resetStopwatch();
        view.setStartButton(true);
        view.setDoneButton(false);
    }
};

function dateToTime(d) {
    return (elapsedTime / 1000).toFixed(1);
}

function secondsToTime(s) {
    var minutes = Math.floor(s/60);
    var seconds = (s-minutes*60).toFixed(1);

    if (minutes < 10) {
        minutes = '0' + minutes;
    }
    if (seconds < 10) {
        seconds = '0' + seconds;
    }

    return minutes + ':' + seconds;
 }

let seconds = 0;
let updateTimeInterval;
let recording = false;
let startTime;
let db;

window.onload = function() {
    let request = window.indexedDB.open('exercises', 1);

    request.onerror = function() {
        console.log('Database failed to open.');
    };

    request.onsuccess = function() {
        console.log('Database opened successfully.');
        db = request.result;

        db.onerror = function(e) {
            alert('Database error: ' + e.target.errorCode);
        };

        // displayData()
        model.getExercises();
        view.resetTime();
    };

    request.onupgradeneeded = function(e) {
        let db = e.target.result;
        let objectStore = db.createObjectStore('exercises', { keyPath: 'id', autoIncrement: true});
        objectStore.createIndex('name', 'name', { unique: false });
        objectStore.createIndex('duration', 'duration', { unique: false });
        console.log('Database setup complete');
    };
};
