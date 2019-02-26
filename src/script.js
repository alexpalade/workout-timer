var exercises = [];
var seconds = 0;
var stopwatch;

var model = {
    addExercise: function() {
        var exercise = {
            name: '',
            time: seconds,
        };
        exercises.push(exercise);
        view.displayExercises();
    },
    startStopwatch: function() {
        seconds = 0;
        this.stopStopwatch();
        stopwatch = setInterval(this.tick, 100);
    },
    stopStopwatch: function() {
        clearInterval(stopwatch);
    },
    resetStopwatch: function() {
        seconds = 0;
        view.updateStopwatch();
    },
    tick: function() {
        seconds += 0.1;
        view.updateStopwatch();
    }
};

var view = {
    displayExercises: function() {
        let exercisesOl = document.getElementById('exercises');
        exercisesOl.innerHTML = '';

        exercises.forEach((item, position) => {
            var exerciseLi = document.createElement('li');
            if (position%2 === 1) {
                item.name = 'Rest';
            }
            exerciseLi.textContent = item.name + ' (' + secondsToTime(item.time) + ')';
            exercisesOl.appendChild(exerciseLi);
        });
    },
    updateStopwatch: function() {
        let stopwatchDiv = document.getElementById('stopwatch');
        stopwatchDiv.textContent = secondsToTime(seconds);
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
    startExercise: function(event) {
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

view.displayExercises();
