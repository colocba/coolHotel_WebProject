
$('.carousel').carousel({
    interval: 5000
})

document.getElementById("checkin").onclick = function() {
    pureJSCalendar.open('dd/MM/yyyy', 30, 720, 1, '2018-5-5', '2019-8-20', 'checkin', 100);
};  

document.getElementById("checkout").onclick = function() {
    pureJSCalendar.open('dd/MM/yyyy', 300, 720, 1, '2018-5-5', '2019-8-20', 'checkout', 20);
};  

//show the number on the comboBox-button, by click and select this number (1 by default)
$(".dropdown-menu .dropdown-item").click(function () {
    $(this).parents(".dropdown").find('.btn').html($(this).text() + ' <span class="caret"></span>');
    $(this).parents(".dropdown").find('.btn').val($(this).data('value'));
});

function goToCards() {
    $('html,body').animate({
        scrollTop: $("#room-cards").offset().top},
        'slow');

    //search room
    searchInSpecificRoomType("Normal", 1);
    searchInSpecificRoomType("Deluxe", 2);
    searchInSpecificRoomType("Suite", 3);
    
}

function goToBooking() {
    $('html,body').animate({
        scrollTop: $("#booking-div").offset().top},
        'slow');
}

function stringToDate(str) {
    var parts = str.split('/');
    var myDate = new Date(parts[2], parts[1] - 1, parts[0]);
    return myDate;
}
function roomIsAvailable(checkInDate, checkOutDate, selectedCheckIn, selectedCheckOut) {
    
    if((selectedCheckIn > checkInDate && selectedCheckIn < checkOutDate)
        || (selectedCheckOut < checkOutDate && selectedCheckOut > checkInDate)) return false;
    return true;
}

function searchRoom(roomType, floorNum, snapshot, selectedCheckIn, selectedCheckOut) {
        var size = snapshot.numChildren();
        var roomAvailable = false;
        for (var i = 0; i < size; i++) {
            var checkIn = snapshot.child((floorNum*100 + i) + "/checkIn").val();
            var checkOut = snapshot.child((floorNum*100 + i) + "/checkOut").val();
            if (checkIn === "none" || checkOut === "none")
                roomAvailable = true;
            else {
                checkInDate = stringToDate(checkIn);
                checkOutDate = stringToDate(checkOut);
                var roomAvailable = roomIsAvailable(checkInDate, checkOutDate, selectedCheckIn, selectedCheckOut);
            }
            if (roomAvailable === true) break;
    }
    if (roomAvailable === false) {
        blockRoom(roomType);
    }
    else {
        unBlockRoom(roomType);
    }
    return roomAvailable;
}

function searchInSpecificRoomType(roomType, floorNum) {
    firebase.database().ref('/rooms/' + roomType).once('value').then(function (snapshot) {
        var selectedCheckIn = stringToDate(document.getElementById("checkin").value);
        var selectedCheckOut = stringToDate(document.getElementById("checkout").value);
        searchRoom(roomType, floorNum, snapshot, selectedCheckIn, selectedCheckOut);
    });
}

function blockRoom(roomType) {
    if (roomType === "Deluxe") {
        $(card1).css("opacity", "0.3");
        $(card1Text).css("display", "none");
        $(bookBtn1).css("display", "none");
        $(card1NoRooms).css("display", "block");
    }
    if (roomType === "Normal") {
        $(card2).css("opacity", "0.3");
        $(card2Text).css("display", "none");
        $(bookBtn2).css("display", "none");
        $(card2NoRooms).css("display", "block");
    }
    if (roomType === "Suite") {
        $(card3).css("opacity", "0.3");
        $(card3Text).css("display", "none");
        $(bookBtn3).css("display", "none");
        $(card3NoRooms).css("display", "block");
    }
}

function unBlockRoom(roomType) {
    if (roomType === "Deluxe") {
        $(card1).css("opacity", "0.7");
        $(card1Text).css("display", "block");
        $(bookBtn1).css("display", "block");
        $(card1NoRooms).css("display", "none");
    }
    if (roomType === "Normal") {
        $(card2).css("opacity", "0.7");
        $(card2Text).css("display", "block");
        $(bookBtn2).css("display", "block");
        $(card2NoRooms).css("display", "none");
    }
    if (roomType === "Suite") {
        $(card3).css("opacity", "0.7");
        $(card3Text).css("display", "block");
        $(bookBtn3).css("display", "block");
        $(card3NoRooms).css("display", "none");
    }
}
