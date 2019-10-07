// GLOBAL VARIABLES
// *******************************
// Initialize Firebase
var config = {
    apiKey: "AIzaSyCd7B-L22EFddL8StrZb7Qs6ChUbbq5k2c",
    authDomain: "gtbootcamp-projects.firebaseapp.com",
    databaseURL: "https://gtbootcamp-projects.firebaseio.com",
    projectId: "gtbootcamp-projects",
    storageBucket: "",
};

firebase.initializeApp(config);

// Create a variable to reference the database
var database = firebase.database();

var trainName = "";
var destination = "";
var firstTime = "";
var frequency = 0;

class train {
    constructor(name, destination, firstTime, frequency, dateAdded) {
        this.name = name;
        this.destination = destination;
        this.firstTime = firstTime;
        this.frequency = frequency;
        this.dateAdded = dateAdded;
    }
}

// FUNCTIONS
// *******************************
// function to get the arrival time
function getNextArrival(firstHr, firstMin, frequency) {
    var currentTime = new Date();
    var minIncrement = Math.ceil(((currentTime.getHours()-firstHr)*60 + (currentTime.getMinutes()-firstMin))/frequency) ;

    var firstTime = new Date();
    firstTime.setHours(firstHr);
    firstTime.setMinutes(firstMin);
 
    // setting arrival time
    var arrival = new Date();
    var totalArrival = firstTime.getHours()*60+ firstTime.getMinutes() + minIncrement*frequency;
    arrivalHr = totalArrival/60;
    arrivalMin = totalArrival%60;
    arrival.setHours(arrivalHr);
    arrival.setMinutes(arrivalMin);

    return arrival;
}
// function to get the first time hour
function getFirstHr (firstTime) {
    return parseInt(firstTime.split(":")[0]);
}
// function to get the first time minutes
function getFirstMin (firstTime) {
    return parseInt(firstTime.split(":")[1]);
}
// function to format military time to AM / PM time
// ****** NOT USED - USE MOMENT.JS INSTEAD *********
// function formatAMPM(date) {
//     var hours = date.getHours();
//     var minutes = date.getMinutes();
//     var ampm = hours >= 12 ? 'pm' : 'am';
//     hours = hours % 12;
//     hours = hours ? hours : 12; // the hour '0' should be '12'
//     minutes = minutes < 10 ? '0'+minutes : minutes;
//     var strTime = hours + ':' + minutes + ' ' + ampm;
//     return strTime;
// }
// funtion to check if the input is military time format
function isMilitaryTime(time) {
    var num = "1234567890"
    if ((time.length !== 5) || (time.slice(0,2)%1 !== 0) || (time.slice(3,5)%1 !== 0) || time.slice(0,2)>24 || time.slice(3,5)>60) {
        alert("You have entered an invalid value for First Train Time. Please enter time in (HH:mm - military time)")
        return false;
    }else {
        return true;
    }
};
// function to check if the input is minute for frequency
function isValidFreq(min) {
    if (min <= 60 && min>=0) {
        return true;
    } else {
        alert("You have entered an invalid value for frequency minute.")
        return false;
    }
}
// EVENTS & EXECUTION
// *******************************
$("#submit").on("click", function(event) {
    // Don't refresh the page!
    event.preventDefault();
    
    // Code in the logic for storing and retrieving data
    trainName = $("#train-name").val().trim();
    destination = $("#destination").val().trim();
    firstTime = $("#first-train-time").val().trim();
    frequency = $("#frequency").val().trim();

    // check if all inputs are valid first before storing the values to firebase
    if (isMilitaryTime(firstTime) && isValidFreq(frequency)) {
        var newTrain = new train(trainName, destination, firstTime, frequency, firebase.database.ServerValue.TIMESTAMP);
        // pushing the data back to firebase database
        database.ref("train-scheduler").push(newTrain);
    };
});

// Firebase watcher + initial loader HINT: This code behaves similarly to .on("value")
database.ref("train-scheduler").on("child_added", function(childSnapshot) {
    // get current time and date
    var today = new Date();
    var currentTime = today.getHours() + ":" + today.getMinutes();

    
    var firstHr = getFirstHr(childSnapshot.val().firstTime);
    var firstMin = getFirstMin(childSnapshot.val().firstTime);
    var arrival = getNextArrival(firstHr, firstMin, childSnapshot.val().frequency);

    // formatted version of time
    var formattedArrival = moment(arrival).format('h:mm a');
    var formattedCurrentTime = moment(today).format('h:mm a');

    // total minutes away
    var minAway = (arrival.getHours() - today.getHours())*60 + (arrival.getMinutes() - today.getMinutes());

    // TESTING & DEBUGGING
    console.log(`
    ${childSnapshot.val().name} | ${childSnapshot.val().destination} | freq = ${childSnapshot.val().frequency} | arrival = ${formattedArrival} | min away = ${minAway} | first time = ${childSnapshot.val().firstTime} | currentTime = ${formattedCurrentTime}`);

    // append html to DOM
    $("#current-train").append(`
        <tr>
            <th><input class="result-form trainName-${childSnapshot.key}" placeholder="${childSnapshot.val().name}"></th>
            <th><input class="result-form trainDestination-${childSnapshot.key}" placeholder="${childSnapshot.val().destination}"></th>
            <th><input class="result-form trainFrequency-${childSnapshot.key}" placeholder="${childSnapshot.val().frequency}"></th>
            <th>${formattedArrival}</th>
            <th>${minAway}</th>
            <th>
                <i class="fas fa-trash-alt delete" data-delete="${childSnapshot.key}"></i>
                    
                <i class="fas fa-edit edit" data-edit="${childSnapshot.key}" 
                data-destination="${childSnapshot.val().destination}" 
                data-first-time="${childSnapshot.val().firstTime}" 
                data-frequency="${childSnapshot.val().frequency}" 
                data-name="${childSnapshot.val().name}">
                
                </i>
            </th>

        </tr>
    `);


    // Handle the errors
    }, function(errorObject) {
    console.log("Errors handled: " + errorObject.code);
});

// On click delete to remove the entry in firebase and reload the page
$(document).on("click", ".delete", function() {
    var dataId = $(this).data("delete");
    database.ref("train-scheduler").child(dataId).remove();
    // reload the page
    location.reload();
});
// on click edit to modify name, destination, frequency on firebase and reload the page
$(document).on("click", ".edit", function() {
    var dataId = $(this).data("edit");
    var firstTime = $(this).data("first-time");
    var newTrainName = $(`.trainName-${dataId}`).val();
    var newTrainDestination = $(`.trainDestination-${dataId}`).val();
    var newTrainFrequency = $(`.trainFrequency-${dataId}`).val();

    // check if all inputs are valid first before storing the values to firebase
    if ((newTrainName==="")||(newTrainDestination==="")||(newTrainFrequency==="")) {
        alert("Invalid edit entry. Please try again.");
    } else if (isValidFreq(frequency)){
        console.log(`${newTrainName} | ${newTrainDestination} | ${firstTime}| ${newTrainFrequency}`);
        var newTrain = new train(newTrainName, newTrainDestination, firstTime, newTrainFrequency, firebase.database.ServerValue.TIMESTAMP);
        // pushing the data back to firebase database
        database.ref("train-scheduler").child(dataId).set(newTrain);
    };
    // reload the page
    location.reload();
    
});