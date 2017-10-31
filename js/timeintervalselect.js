/**
 *
 *
 * timeintervalselect.js
 *
 * Descripción:
 * Instancia un control de selección de intervalos de tiempo
 *
 * Autor: Ezequiel Wajs <ezequiel.wajs@gmail.com>
 *
 *
 */

// Globals

var TIMEOFFSET = 15;
var SCHEDULEDIVHEIGHT = "50px";
var MINUTESPERDAY = 1440;
var SCHEDULE;
var slotIDCounter = 0;



var scheduleData = [];
var overlap = true; // this flag indicates if current time slot is possible


var lbtnPlus = document.getElementById("startTimePlus");
var lbtnMinus = document.getElementById("startTimeMinus");
var ltc = document.getElementById("startTime");
var ubtnPlus = document.getElementById("stopTimePlus");
var ubtnMinus = document.getElementById("stopTimeMinus");
var utc = document.getElementById("stopTime");
var alertDiv = document.getElementById("alertDiv");
var startMarker = document.getElementById("startMarker");
var stopMarker = document.getElementById("stopMarker");
var btnSaveSlot = document.getElementById("saveSlot");
var operator = document.getElementById("operator");
var scheduleDay = document.getElementById("scheduleDay");
var totalTime = document.getElementById("totalTime");

var infoString = "Hacer click en los intervalos libres los selecciona para reservar.</br>" +
    "Hacer click en los agregados los elimina.</br>" +
    "Los controles se volverán amarillos si el intervalo es inválido.</br>";
var warningString = "Intervalo actual se solapa con otros ya ingresados.";

setScheduleContainer(document.getElementById("scheduleGraph"));
bindTimeControl(lbtnPlus, lbtnMinus, ltc, ubtnPlus, ubtnMinus, utc);


document.getElementById("saveSlot").addEventListener("click", updateSchedule);
alertUser("info", infoString,alertDiv);
drawSchedule();
$('[data-toggle="tooltip"]').tooltip({container: 'body'});



// Receives a string with HH:MM and returns an int specifying amount of minutes
function timeToInt(str) {
    var hourFormat = /^([0-9]|0[0-9]|1[0-9]|2[0-4]):[0-5][0-9]$/;
    if (hourFormat.test(str)) {
        var times = str.split(":");
        return (parseInt(times[0]) * 60 + parseInt(times[1]));
    } else {
        return -1;
    }
}


// Receives an int specifying minutes and returns a string in the format HH:MM
function intToTime(time) {
    if (time > 1440) {
        return "00:00";
    } else {
        var minutes = (time % 60).toString();
        var hours = Math.floor(time / 60).toString();
        if (minutes.length == 1) {
            minutes = "0" + minutes;
        }
        if (hours.length == 1) {
            hours = "0" + hours;
        }
        return hours + ":" + minutes;
    }
}

function isValidHour(time) {
    var hourFormat = /^([0-9]|0[0-9]|1[0-9]|2[0-4]):[0-5][0-9]$/;
    return hourFormat.test(time);
}


// sets markers showing the time range selected
function updateMarkers() {
    var startMarkerValue = timeToInt(ltc.value);
    var stopMarkerValue = timeToInt(utc.value);
    if(stopMarkerValue == MINUTESPERDAY) // this fixes an extra line due to the size of chevrons
        stopMarkerValue *= 0.995;
    startMarker.style.width = ((startMarkerValue/MINUTESPERDAY)*100).toString() + "%";
    stopMarker.style.width = (((stopMarkerValue - startMarkerValue)/MINUTESPERDAY)*100).toString() + "%";

    var startMarkerFree = true;
    var stopMarkerFree = true;
    for(var i = 0; i < scheduleData.length; i++) {
        if (scheduleData[i].SlotStart < startMarkerValue && scheduleData[i].SlotStop > startMarkerValue) { // start marker is in occupied slot
            startMarkerFree = false;
        }
        if (scheduleData[i].SlotStart < stopMarkerValue && scheduleData[i].SlotStop > stopMarkerValue) { // stop marker is in occupied slot
            stopMarkerFree = false;
        }
        if(startMarkerValue <= scheduleData[i].SlotStart && stopMarkerValue >= scheduleData[i].SlotStop) { // there's a slot inside the markers
            startMarkerFree = false;
            stopMarkerFree = false;
        }
    }

    if(startMarkerFree) {
        startMarker.classList.remove("marker-taken");
        ltc.classList.remove("time-control-error");
    } else {
        startMarker.classList.add("marker-taken");
        ltc.classList.add("time-control-error");
    }


    if(stopMarkerFree) {
        stopMarker.classList.remove("marker-taken");
        utc.classList.remove("time-control-error");
    } else {
        stopMarker.classList.add("marker-taken");
        utc.classList.add("time-control-error");
    }

    overlap = !(startMarkerFree && stopMarkerFree);
    if (overlap) {
        btnSaveSlot.disabled = true;
        alertUser("warning", warningString, alertDiv);
    } else {
        btnSaveSlot.disabled = false;
        alertUser("info", infoString, alertDiv);
    }
}


// binds time controls for selecting time range (avoiding absurd selections)
function bindTimeControl(lbtnPlus, lbtnMinus, ltc, ubtnPlus, ubtnMinus, utc) {
    var lastltc, lastutc;

    lbtnPlus.addEventListener("click", function () {
            var lowerBound = timeToInt(ltc.value);
            var upperBound = timeToInt(utc.value);
            lowerBound += TIMEOFFSET;
            if (lowerBound >= upperBound) { // if lower exceeds upper, do nothing
                return;
            } else {
                ltc.value = intToTime(lowerBound);
                updateMarkers();
                return;
            }

        }
    );
    lbtnMinus.addEventListener("click", function () {
            var lowerBound = timeToInt(ltc.value);
            lowerBound -= TIMEOFFSET;
            if (lowerBound < 0) { // if lower reaches 0
                return;
            } else {
                ltc.value = intToTime(lowerBound);
                updateMarkers();
                return;
            }
        }
    );
    ubtnPlus.addEventListener("click", function () {
            var upperBound = timeToInt(utc.value);
            upperBound += TIMEOFFSET;
            if (upperBound > MINUTESPERDAY) { // if lower exceeds upper, do nothing
                return;
            } else {
                utc.value = intToTime(upperBound);
                updateMarkers();
                return;
            }
        }
    );
    ubtnMinus.addEventListener("click", function () {
            var lowerBound = timeToInt(ltc.value);
            var upperBound = timeToInt(utc.value);
            upperBound -= TIMEOFFSET;
            if (upperBound <= lowerBound) { // if lower reaches 0
                return;
            } else {
                utc.value = intToTime(upperBound);
                updateMarkers();
                return;
            }
        }
    );

    ltc.addEventListener("focus", function () { // save last value
        lastltc = ltc.value;
    });


    utc.addEventListener("focus", function () { // save last value
        lastutc = utc.value;
    });

    ltc.addEventListener("blur", function () { // if invalid input, restore last value, else round off.
        if(!isValidHour(ltc.value)) {
            ltc.value = lastltc;
        } else {
            var time = timeToInt(ltc.value);
            var utime = timeToInt(utc.value);
            if (time > utime) {
                time = utime - TIMEOFFSET;
            }
            if (time % TIMEOFFSET != 0) {
                time = time - (time % TIMEOFFSET);
            }
            ltc.value = intToTime(time);
        }
        updateMarkers();
    });

    utc.addEventListener("blur", function () { // if invalid input, restore last value, else round off.
        if(!isValidHour(utc.value)) {
            utc.value = lastutc;
        } else {
            var time = timeToInt(utc.value);
            var ltime = timeToInt(ltc.value);
            if (time > MINUTESPERDAY) {
                time = MINUTESPERDAY;
            }
            if (time < ltime) {
                time = ltime + TIMEOFFSET;
            }
            if (time % TIMEOFFSET != 0) {
                time = time + (TIMEOFFSET - (time % TIMEOFFSET));
            }
            utc.value = intToTime(time);
        }
        updateMarkers();
    });

    drawSchedule();
}

function setScheduleContainer(sched) {
    SCHEDULE = sched;
}

function addScheduleDiv(info) {
    var start = info.SlotStart;
    var stop = info.SlotStop;
    var duration = stop - start;
    var div = document.createElement('div');

    div.style.height = SCHEDULEDIVHEIGHT;
    div.style.width = (duration/MINUTESPERDAY * 100).toString() + "%";
    div.dataset.toggle = "tooltip";
    div.title = intToTime(info.SlotStart) + " a " + intToTime(info.SlotStop);

    if (info.SlotID == -1) { // slot is free
        div.classList.add("schedule-free");
        div.addEventListener("click", function () {
            ltc.value = intToTime(start);
            utc.value = intToTime(stop);
            updateMarkers();
        });
    } else  {// slot is mine
        div.classList.add("schedule-booked");
        div.dataset.id = info.SlotID;
        div.addEventListener("click", function () {
            removeSlot($(this).data('id'));
            drawSchedule();
        });
    }
    SCHEDULE.appendChild(div);
}

function removeSlot(id) {
    var newScheduleData = [];

    for (var i = 0; i < scheduleData.length; i++) {
        if(scheduleData[i].SlotID != id)
            newScheduleData.push(scheduleData[i]);
    }
    scheduleData = newScheduleData;
}


function compareSlot(a,b) {
  if (a.SlotStart < b.SlotStart)
    return -1;
  if (a.SlotStart > b.SlotStart)
    return 1;
  return 0;
}

function joinAdjacentSlots() {
    var joinedSlot = -1; // initial invalid ID
    for (var i = 0; i < scheduleData.length - 1; i++) {
        if(scheduleData[i].SlotStop == scheduleData[i+1].SlotStart) {
            scheduleData[i].SlotStop = scheduleData[i+1].SlotStop; // enlarge first slot
            joinedSlot = scheduleData[i + 1].SlotID; // mark the now invalid slot for deletion
            //console.log(scheduleData);
            //console.log("Found Adjacent Slots!");
            break; // escape the for loop
        }
    }
    removeSlot(joinedSlot);
    //console.log(scheduleData);
}

function updateSchedule() {
    updateMarkers();
    if(!overlap) {
        var newSlot = {
            SlotStart: timeToInt(ltc.value),
            SlotStop: timeToInt(utc.value),
            SlotID: slotIDCounter
        }
        slotIDCounter++;
        scheduleData.push(newSlot);
        scheduleData.sort(compareSlot);
        joinAdjacentSlots();
        drawSchedule();
        $('[data-toggle="tooltip"]').tooltip({container: 'body'});
    }
}

function computeTotalTime() {
    var time = 0;
    for(var i = 0; i < scheduleData.length; i++) {
        time += scheduleData[i].SlotStop - scheduleData[i].SlotStart;
    }
    totalTime.innerText = intToTime(time);
}

function drawSchedule() {
    SCHEDULE.innerHTML = ""; // reset the schedule div
    //console.log(scheduleData);
    var emptySlot = {
        SlotStart: 0,
        SlotStop: MINUTESPERDAY, // initially, full day.
        SlotID: -1, // no
    };
    if(scheduleData.length == 0) { // if nothing received, show clear schedule
        addScheduleDiv(emptySlot);
    } else {
        var lastStop = 0;
        for(var i = 0; i < scheduleData.length; i++) {
            var thisStart = scheduleData[i].SlotStart;
            var thisStop = scheduleData[i].SlotStop;
            //console.log("thisStart = " + thisStart);
            //console.log("lastStop = " + lastStop);
            if (parseInt(thisStart,10) > parseInt(lastStop,10)) { // if there's free time in the middle
                emptySlot.SlotStart = lastStop;
                emptySlot.SlotStop = thisStart;
            //    console.log("Drawing empty div at " + lastStop + " to " + thisStart);
                addScheduleDiv(emptySlot);
            }
            //console.log("Drawing occupied div at " + scheduleData[i].SlotStart + " to " + scheduleData[i].SlotStop);
            addScheduleDiv(scheduleData[i]);
            lastStop = thisStop;
        }
        if (lastStop < MINUTESPERDAY) {
            emptySlot.SlotStart = lastStop;
            emptySlot.SlotStop = MINUTESPERDAY;
            addScheduleDiv(emptySlot);
        }
    }
    updateMarkers();
    computeTotalTime();
}

function alertUser(alertType, alertText, alertDiv) {
    var htmlAlert = '<br/><div class="alert alert-' + alertType + '" role="alert"><div class = "text-center"><strong>';
    switch (alertType){
        case "info":
            htmlAlert += 'Información';
            break;
        case "success":
            htmlAlert += 'Éxito';
            break;
        case "warning":
            htmlAlert += 'Advertencia';
            break;
        case "danger":
            htmlAlert += "Error";
            break;
        case "loading":
            htmlAlert = '<br/><div class="alert alert-info alert-loader" role="alert"><div class = "text-center"><strong>Cargando';
            alertText = '<br/><div class = "loader"></div>'
            break;
    }
    htmlAlert += '</strong></div><div>' + alertText + '</div>';

    alertDiv.innerHTML = htmlAlert;
}
