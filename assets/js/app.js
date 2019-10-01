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

function getFirstHr (firstTime) {
    return parseInt(firstTime.split(":")[0]);
}

function getFirstMin (firstTime) {
    return parseInt(firstTime.split(":")[1]);
}


function formatAMPM(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
}

function isMilitaryTime(time) {
    var num = "1234567890"
    if ((time.length !== 5) || (time.slice(0,2)%1 !== 0) || (time.slice(3,5)%1 !== 0)) {
        alert("You have entered an invalid value for First Train Time. Please enter time in (HH:mm - military time)")
        return false;
    }else {
        return true;
    }
};

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
    if (isMilitaryTime(firstTime)) {
        var newTrain = new train(trainName, destination, firstTime, frequency, firebase.database.ServerValue.TIMESTAMP);
        // pushing the data back to firebase database
        database.ref().push(
            newTrain
        );
    };
});

// Firebase watcher + initial loader HINT: This code behaves similarly to .on("value")
database.ref().on("child_added", function(childSnapshot) {
    // get current time and date
    var today = new Date();
    var currentTime = today.getHours() + ":" + today.getMinutes();

    
    var firstHr = getFirstHr(childSnapshot.val().firstTime);
    var firstMin = getFirstMin(childSnapshot.val().firstTime);
    var arrival = getNextArrival(firstHr, firstMin, childSnapshot.val().frequency);

    // formatted version of time
    var formattedArrival = formatAMPM(arrival);
    var formattedCurrentTime = formatAMPM(today);

    // total minutes away
    var minAway = (arrival.getHours() - today.getHours())*60 + (arrival.getMinutes() - today.getMinutes());

    // TESTING & DEBUGGING
    console.log(`
    ${childSnapshot.val().name} | ${childSnapshot.val().destination} | freq = ${childSnapshot.val().frequency} | arrival = ${formattedArrival} | min away = ${minAway} | first time = ${childSnapshot.val().firstTime} | currentTime = ${formattedCurrentTime}`);

    // append html to DOM
    $("#current-train").append(`
        <tr>
            <th>${childSnapshot.val().name}</th>
            <th>${childSnapshot.val().destination}</th>
            <th>${childSnapshot.val().frequency}</th>
            <th>${formattedArrival}</th>
            <th>${minAway}</th>
        </tr>
        `);

    // Handle the errors
    }, function(errorObject) {
    console.log("Errors handled: " + errorObject.code);
});