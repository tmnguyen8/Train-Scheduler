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
var firstHr = 0;
var firstMin = 0;
var firstTime = "";
var frequency = 0;
var arrival = "";

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
 
    var arrival = new Date();
    arrival.setMinutes(firstTime.getMinutes() + minIncrement*frequency);

    return arrival;
}

function getFirstHr (firstTime) {
    return parseInt(firstTime.split(":")[0]);
}

function getFirstMin (firstTime) {
    return parseInt(firstTime.split(":")[1]);
}

// EVENTS & EXECUTION
// *******************************


$("#submit").on("click", function(event) {
    // Don't refresh the page!
    event.preventDefault();

    // Code in the logic for storing and retrieving data
    // Don't forget to provide initial data to your Firebase database.
    trainName = $("#train-name").val().trim();
    destination = $("#destination").val().trim();
    firstTime = $("#first-train-time").val().trim();

    

    frequency = $("#frequency").val().trim();

    var newTrain = new train(trainName, destination, firstTime, frequency, firebase.database.ServerValue.TIMESTAMP);

    database.ref().push(
        newTrain
    );
});

// Firebase watcher + initial loader HINT: This code behaves similarly to .on("value")
database.ref().on("child_added", function(childSnapshot) {
    // get current time and date
    var today = new Date();

    var currentTime = today.getHours() + ":" + today.getMinutes();
    console.log(`current time is `, currentTime);
    
    firstHr = getFirstHr(childSnapshot.val().firstTime);
    firstMin = getFirstMin(childSnapshot.val().firstTime);
    arrival = getNextArrival(firstHr, firstMin, childSnapshot.val().frequency);


    var formattedArrival = (arrival.getHours() + ":" + arrival.getMinutes());
    var minAway = arrival.getMinutes() - today.getMinutes();

    console.log(`arrival min = ${arrival.getMinutes()} | current min = ${today.getMinutes()}`);
    // Log everything that's coming out of snapshot
    console.log(`
    ${childSnapshot.val().name} | ${childSnapshot.val().destination} | freq = ${childSnapshot.val().frequency} | arrival = ${formattedArrival} | min away = ${minAway} | first time = ${childSnapshot.val().firstTime} | currentTime = ${currentTime}`);

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