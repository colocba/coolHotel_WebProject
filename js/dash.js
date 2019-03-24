
var clientsRef;
var roomsRef;
var profitsRef;
var messagesRef;
var currentTableShowing = "charts";

firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        var uid = user.uid;
        // current user is connected
        // firebase database references
        clientsRef = firebase.database().ref('clients/');
        roomsRef = firebase.database().ref('rooms/');
        usersRef = firebase.database().ref('users/');
        profitsRef = firebase.database().ref('profits/');
        messagesRef = firebase.database().ref('messages/');

        // Making users table
        usersRef.once('value').then(function (snapshot) {
            var val = snapshot.val();
            // Saying hi to the current user connected
            document.getElementById("user-name").innerHTML = val[uid].name;
            changeUIforUserType(uid, val);
        });

        usersRef.on('value', function (snapshot) {
            var val = snapshot.val();
            $('#users-table').bootstrapTable('destroy');
            updateTableFromDB('#users-table', snapshot.val());
        })

        // Making clients table
        clientsRef.on('value', function (snapshot) {
            $('#clients-table').bootstrapTable('destroy');
            updateTableFromDB('#clients-table', snapshot.val());
            $('#num-of-clients').html('   ' + snapshot.numChildren());
        });

        // Initializing messages dropdown
        messagesRef.on('value', function (snapshot) {
            $('#accordion').remove();
            $('#modal-body-message').html('<div id="accordion"></div>');
            updateMessageDropdown(snapshot);
            $('#num-msg').html('    ' + snapshot.numChildren());
        });

        // Making rooms table
        roomsRef.on('value', function (snapshot) {

            // Chart of occupancy for each type of room
            var data = getRoomsAvailability(snapshot.val());
            setOccupancyCard(data);
            var ctx1 = document.getElementById("barChart");
            makeBarChart(ctx1, data);

            // Update table of rooms
            updateRoomsTableFromDB(snapshot.val());
        });

        // Chart for profits on each month
        profitsRef.on('value', function (snapshot) {
            var data = getProfitsData(snapshot.val());
            var ctx2 = document.getElementById("linearChart");
            makeLineChart(ctx2, data);
        });


    } else {
        window.location.href = "admin.html"
    }
});

// If the current connected user is admin everything is open
// If its normal, then apply restrictions for him
function changeUIforUserType(uid, users) {
    // Users is normal type
    if (users[uid].userType === "normal") {
        // TODO:
        document.getElementById("manageUsers-btn").style.display = "none";
        document.getElementById("row-of-profit-chart").style.display = "none";

    }
}

function showClientsTable() {
    if (currentTableShowing != "clients-div") {
        if (currentTableShowing != "") {
            var elementShowend = document.getElementById(currentTableShowing);
            elementShowend.classList.add("d-none");
        }
        var element = document.getElementById("clients-div");
        element.classList.remove("d-none");
        currentTableShowing = "clients-div";
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
                swal(newname + ' ' + lastname + ' was added successfully!', "", "success");

            }).catch(function failure(error) {
                var errorCode = error.code;
                var errorMessage = error.message;
                swal("You havent choose any client to delete!", "", "error");
            });
    } else {
        swal("You have to enter all data", "", "warning");
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

    $('#rooms-table-normal').bootstrapTable('destroy');
    $('#rooms-table-deluxe').bootstrapTable('destroy');
    $('#rooms-table-suite').bootstrapTable('destroy');

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
            maintainAspectRatio: false,
            responsive: true,
            title: {
                text: "Occupancy on each type of room right now",
                display: true,
                fontSize: 15
            },
            scales: {
                yAxes: [{
                    ticks: {
                        suggestedMin: 0,
                        suggestedMax: 3,
                        stepSize: 1
                    }
                }],
                xAxes: [
                    {
                        barThickness: 80
                    }
                ]
            },

            layout: {
                padding: {
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0
                }
            }
        }
    });

    $('#loader').attr("style", "display: none !important;");
    $('#charts').removeClass("d-none");
}

function setOccupancyCard(data) {
    var sum = 0;
    for (var num in data) {
        sum += parseInt(data[num]);
    }
    var avg = Math.round((sum / 9) * 100);
    $('#ocup-average').html("   " + avg + "%");
}

function float2dollar(value) {
    return "$ " + (value).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
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
            maintainAspectRatio: false,
            responsive: true,
            title: {
                text: "Profits on current year",
                display: true,
                fontSize: 15
            },
            scales: {
                yAxes: [{
                    ticks: {
                        min: 0,
                        max: 1000,
                        stepSize: 100,
                        callback: function (value, index, values) {
                            return float2dollar(value);
                        }
                    }
                }],
            },

            layout: {
                padding: {
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0
                }
            }
        }
    });

    $('#loader').attr("style", "display: none !important;");
    $('#charts').removeClass("d-none");
}

function getRoomsAvailability(dataFromDB) {
    var arrayOfNormalRooms = makeArrayFromJSON(dataFromDB.Normal);
    var arrayOfDeluxeRooms = makeArrayFromJSON(dataFromDB.Deluxe);
    var arrayOfSuiteRooms = makeArrayFromJSON(dataFromDB.Suite);
    var arrayOfResults = [];
    var counter = 0;

    var checkIn;
    var checkOut;

    for (var room in arrayOfNormalRooms) {
        var bookHistory = arrayOfNormalRooms[room].bookingHistory;
        for (var booking in bookHistory) {
            if (bookHistory[booking].checkIn === "none") { continue; }
            checkIn = stringToDate(bookHistory[booking].checkIn);
            checkOut = stringToDate(bookHistory[booking].checkOut);
            if (!roomIsAvailableNow(checkIn, checkOut)) { counter++; break; }
        }
    }
    arrayOfResults.push(counter);
    counter = 0;

    for (var room in arrayOfDeluxeRooms) {
        var bookHistory = arrayOfDeluxeRooms[room].bookingHistory;
        for (var booking in bookHistory) {
            if (bookHistory[booking].checkIn === "none") { continue; }
            checkIn = stringToDate(bookHistory[booking].checkIn);
            checkOut = stringToDate(bookHistory[booking].checkOut);
            if (!roomIsAvailableNow(checkIn, checkOut)) { counter++; break; }
        }
    }
    arrayOfResults.push(counter);
    counter = 0;

    for (var room in arrayOfSuiteRooms) {
        var bookHistory = arrayOfSuiteRooms[room].bookingHistory;
        for (var booking in bookHistory) {
            if (bookHistory[booking].checkIn === "none") { continue; }
            checkIn = stringToDate(bookHistory[booking].checkIn);
            checkOut = stringToDate(bookHistory[booking].checkOut);
            if (!roomIsAvailableNow(checkIn, checkOut)) { counter++; break; }
        }
    }
    arrayOfResults.push(counter);
    counter = 0;

    return arrayOfResults;

}

function stringToDate(str) {
    var parts = str.split('/');
    var myDate = new Date(parts[2], parts[1] - 1, parts[0]);
    return myDate;
}
function roomIsAvailableNow(checkInDate, checkOutDate) {
    if (Date.now() > checkInDate && Date.now() < checkOutDate) { return false; }
    return true;
}

function getProfitsData(dataFromDB) {
    var ret = makeArrayFromJSON(dataFromDB);
    return ret;
}

function updateMessageDropdown(dataFromDB) {

    var msgCounter = 0;

    var data = dataFromDB.val();

    $('#num-of-msgs').html(dataFromDB.numChildren());

    for (var msg in data) {
        var message = data[msg].message;
        var name = data[msg].firstName;
        var lastName = data[msg].lastName;
        var email = data[msg].email;
        var btnClasses;
        var expanded;
        var $card = $('<div>').attr("class", "card");
        var $cardHeader = $('<div>').attr({ "class": "card-header", "id": "msg" + msgCounter });
        var $partH5 = $('<h5>').attr("class", "mb-0");
        var $answerButton = $('<button>').attr({ "class": "btn btn-primary", "onclick": "answerTo(this)", "email": email })
            .html("Answer to " + name);
        var $deleteMsgButton = $('<button>').attr({ "class": "btn btn-primary", "onclick": "deleteMsg(this)", "msg-id": msg })
            .html("Delete this message");

        if (msgCounter === 0) {
            btnClasses = "btn btn-link";
            expanded = true;
        } else {
            btnClasses = "btn btn-link collapsed";
            expanded = false;
        }

        var $collapseBtn = $('<button>').attr({
            "class": btnClasses
            , "data-toggle": "collapse", "data-target": "#collapse" + msgCounter, "aria-expanded": expanded
            , "aria-controls": "collapse" + msgCounter
        }).html("Message from " + name + " " + lastName);
        var $cardContent = $('<div>').attr({
            "id": "collapse" + msgCounter, "class": "collapse container"
            , "aria-labelledby": "msg" + msgCounter, "data-parent": "#accordion"
        });
        var $cardBody = $('<div>').attr("class", "card-body");

        $("#accordion").append($card.append($cardHeader.append($partH5.append($collapseBtn)))
            , $cardContent.append($cardBody.html(message), $answerButton, $deleteMsgButton));


        msgCounter++;
    }
}

function answerTo(e) {
    window.open('mailto:' + e.getAttribute("email"));
}

function deleteMsg(e) {
    swal({
        title: "Are you sure you want to delete this message?",
        text: "Your will not be able to recover this information!",
        icon: "warning",
        buttons: true,
        dangerMode: true,
      }).then((willDelete) => {
          if (willDelete) {
            messagesRef.child(e.getAttribute("msg-id")).remove();
            swal("Deleted!", "The message has been removed from data base", "success");
          }
      });
}


// Clients table listeners for checks and unchecks
var checkedCustomersRows = [];
$('#clients-table').on('check.bs.table', function (e, row) {
    checkedCustomersRows.push({ email: row.email });
});
$('#clients-table').on('uncheck.bs.table', function (e, row) {
    $.each(checkedCustomersRows, function (index, value) {
        if (value.email === row.email) {
            checkedCustomersRows.splice(index, 1);
        }
    });
});

function deleteClientsSelected() {
    if (checkedCustomersRows.length === 0) {
        swal("You havent choose any client to delete!", "", "warning");
        return;
    }

    swal({
        title: "Are you sure you want to delete this client?",
        text: "Your will not be able to recover this information!",
        icon: "warning",
        buttons: true,
        dangerMode: true,
      }).then((willDelete) => {
          if (willDelete) {
            var clientsRef = firebase.database().ref('clients/');
            clientsRef.once('value').then(function (snapshot) {
                var clients = snapshot.val();
                for (var row in checkedCustomersRows) {
                    for (var uid in clients) {
                        if (checkedCustomersRows[row].email === clients[uid].email) {
                            // Delete user with this uid from db
                            clientsRef.child(uid).remove();
                            break;
                        }
                    }
                }
            });
            swal("Deleted!", "The client has been removed from data base", "success");
          }
      });
}

// Users table listeners for checks and unchecks
var checkedUsersRows = []
$('#users-table').on('check.bs.table', function (e, row) {
    checkedUsersRows.push({ email: row.email });
});
$('#users-table').on('uncheck.bs.table', function (e, row) {
    $.each(checkedUsersRows, function (index, value) {
        if (value.email === row.email) {
            checkedUsersRows.splice(index, 1);
        }
    });
});

function deleteUsersSelected() {
    if (checkedUsersRows.length === 0) {
        swal("You havent choose any user to delete!", "", "warning");
        return;
    }

    swal({
        title: "Are you sure you want to delete this user?",
        text: "Your will not be able to recover this information!",
        icon: "warning",
        buttons: true,
        dangerMode: true,
    }).then((willDelete) => {
        if (willDelete) {
            var usersRef = firebase.database().ref('users/');
            usersRef.once('value').then(function (snapshot) {
                var users = snapshot.val();
                for (var row in checkedUsersRows) {
                    for (var uid in users) {
                        if (checkedUsersRows[row].email === users[uid].email) {
                            // Delete user with this uid from db
                            usersRef.child(uid).remove();
                            break;
                        }
                    }
                }
            });
            swal("Deleted!", "The user has been removed from data base", "success");
        }
    });
}
