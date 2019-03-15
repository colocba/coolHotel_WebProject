
var clientsRef;
var roomsRef;
var profitsRef;
var currentTableShowing = "charts";

firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        // current user is connected
        // firebase database references
        clientsRef = firebase.database().ref('clients/');
        roomsRef = firebase.database().ref('rooms/');
        usersRef = firebase.database().ref('users/');
        profitsRef = firebase.database().ref('profits/');


        // Making clients table
        clientsRef.once('value').then(function (snapshot) {
            var val = snapshot.val();
            updateTableFromDB('#clients-table', snapshot.val());
        });

        // Making rooms table
        roomsRef.once('value').then(function (snapshot) {
            var val = snapshot.val();

            // Chart of occupancy for each type of room
            var data = getRoomsAvailability(snapshot.val());
            var ctx1 = document.getElementById("barChart");
            makeBarChart(ctx1, data);

            // Update table of rooms
            updateRoomsTableFromDB(snapshot.val());
        });

        // Chart for profits on each month
        profitsRef.once('value').then(function (snapshot) {
            var data = getProfitsData(snapshot.val());
            var ctx2 = document.getElementById("linearChart");
            makeLineChart(ctx2, data);
        });

        // Making users table
        usersRef.once('value').then(function (snapshot) {
            var val = snapshot.val();
            updateTableFromDB('#users-table', snapshot.val());
        });


    } else {
        window.location.href = "admin.html"
    }
});

function showClientsTable() {
    if (currentTableShowing != "clients-table") {
        if (currentTableShowing != "") {
            var elementShowend = document.getElementById(currentTableShowing);
            elementShowend.classList.add("d-none");
        }
        var element = document.getElementById("clients-table");
        element.classList.remove("d-none");
        currentTableShowing = "clients-table";
    }
}

function showRoomsTable() {
    if (currentTableShowing != "rooms-div") {
        if (currentTableShowing != "") {
            var elementShowend = document.getElementById(currentTableShowing);
            elementShowend.classList.add("d-none");
        }
        var element = document.getElementById("rooms-div");
        element.classList.remove("d-none");
        currentTableShowing = "rooms-div";
    }
}

function manageUsers() {
    if (currentTableShowing != "users-div") {
        if (currentTableShowing != "") {
            var elementShowend = document.getElementById(currentTableShowing);
            elementShowend.classList.add("d-none");
        }
        var element = document.getElementById("users-div");
        element.classList.remove("d-none");
        currentTableShowing = "users-div";
    }
}

function signupBtn() {

    if (checkInputs() == true) {
        var newname = $('#name').val();
        var lastname = $('#lastname').val();
        var permission = $('#permission').val();
        var email = $('#email').val();
        var password = $('#password').val();

        // For not disconnecting currently user when creating new one 
        var config = {
            apiKey: "AIzaSyBV4ZUpD-VGeQyQMwvXxHVhC4gG2pvf_pk",
            authDomain: "coolhotel-f70fd.firebaseapp.com",
            databaseURL: "https://coolhotel-f70fd.firebaseio.com"
        };
        var secondaryApp = firebase.initializeApp(config, "Secondary");

        secondaryApp.auth().createUserWithEmailAndPassword(email, password)
            .then(function success(userData) {
                var uid = userData.user.uid;
                var email = userData.user.email;
                // TODO: enter all data to the db
                firebase.database().ref('users/' + uid + '/').set({
                    name: newname,
                    lastName: lastname,
                    userType: permission,
                    email: email
                });
                alert(newname + ' ' + lastname + ' was added successfully!');
            }).catch(function failure(error) {
                var errorCode = error.code;
                var errorMessage = error.message;
                alert(errorCode + " " + errorMessage);
            });
    } else {
        alert('You have to enter all the data!');
    }
}

function checkInputs() {
    if ($('#name').val() == "" || $('#lastname').val() == "" || $('#permission').val() == ""
        || $('#email').val() == "" || $('#password').val() == "") {
        return false;
    } else {
        return true;
    }
}
function showDashboard() {
    if (currentTableShowing != "charts") {
        if (currentTableShowing != "") {
            var elementShowend = document.getElementById(currentTableShowing);
            elementShowend.classList.add("d-none");
        }
        var element = document.getElementById("charts");
        element.classList.remove("d-none");
        currentTableShowing = "charts";
    }
}

function logout() {
    firebase.auth().signOut().then(function () {
        window.location.href = "admin.html"
    }).catch(function (error) {
        // An error happened.
    });
}

function updateTableFromDB(tableId, dataFromDB) {
    var arraOfUsers = makeArrayFromJSON(dataFromDB)
    $(tableId).bootstrapTable({
        data: arraOfUsers
    })
}

function updateRoomsTableFromDB(dataFromDB) {
    var arrayOfNormalRooms = makeArrayFromJSON(dataFromDB.Normal);
    var arrayOfDeluxeRooms = makeArrayFromJSON(dataFromDB.Deluxe);
    var arrayOfSuiteRooms = makeArrayFromJSON(dataFromDB.Suite);
    $('#rooms-table-normal').bootstrapTable({
        data: arrayOfNormalRooms
    })
    $('#rooms-table-deluxe').bootstrapTable({
        data: arrayOfDeluxeRooms
    })
    $('#rooms-table-suite').bootstrapTable({
        data: arrayOfSuiteRooms
    })
}

function makeArrayFromJSON(data) {
    var array = [];
    for (var key in data) {
        array.push(data[key]);
    }
    return array;
}

function makeBarChart(ctx1, dataArray) {
    var myBarChart = new Chart(ctx1, {
        type: 'bar',
        data: {
            datasets: [{
                label: 'Ocuppancy',
                data: dataArray,
                backgroundColor: [
                    'rgba(63, 191, 63, 0.5)',
                    'rgba(54, 162, 235, 0.5)',
                    'rgba(255, 206, 86, 0.5)'
                ],
            }],
            labels: ["Normal", "Deluxe", "Suite"]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        suggestedMin: 0,
                        suggestedMax: 3,
                        stepSize: 1
                    }
                }]
            },

            layout: {
                padding: {
                    left: 50,
                    right: 0,
                    top: 0,
                    bottom: 0
                }
            }
        }
    });
}

function makeLineChart(ctx2, dataArray) {
    var stackedLine = new Chart(ctx2, {
        type: 'line',
        data: {
            datasets: [{
                label: 'First dataset',
                data: dataArray,
                backgroundColor: [
                    'rgba(102, 204, 102, 0.5)'
                ]
            }],
            labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September',
                'October', 'November', 'December']
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        min: 0,
                        max: 1000,
                        stepSize: 100
                    }
                }]
            },

            layout: {
                padding: {
                    left: 50,
                    right: 0,
                    top: 0,
                    bottom: 0
                }
            }
        }
    });
}

function getRoomsAvailability(dataFromDB) {
    var arrayOfNormalRooms = makeArrayFromJSON(dataFromDB.Normal);
    var arrayOfDeluxeRooms = makeArrayFromJSON(dataFromDB.Deluxe);
    var arrayOfSuiteRooms = makeArrayFromJSON(dataFromDB.Suite);
    var arrayOfResults = [];
    var counter = 0;

    for (var room in arrayOfNormalRooms) {
        if (arrayOfNormalRooms[room].occupied == true) { counter++; }
    }
    arrayOfResults.push(counter);
    counter = 0;

    for (var room in arrayOfDeluxeRooms) {
        if (arrayOfDeluxeRooms[room].occupied == true) { counter++; }
    }
    arrayOfResults.push(counter);
    counter = 0;

    for (var room in arrayOfSuiteRooms) {
        if (arrayOfSuiteRooms[room].occupied == true) { counter++; }
    }
    arrayOfResults.push(counter);
    counter = 0;

    return arrayOfResults;

}

function getProfitsData(dataFromDB) {
    var ret = makeArrayFromJSON(dataFromDB);
    return ret;
}