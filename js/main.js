
$("#bookModal").on('hide.bs.modal', function () {
    document.getElementById("totalPriceRM").innerHTML = "";
    $('#pay-btn-rm').addClass('disabled');
    $('#final-details-btn-rm').addClass('disabled');
    makeNavToInitialState();
});

function makeNavToInitialState() {
    $('#nav-tab-final-details').removeClass('active show');
    $('#final-details-btn-rm').removeClass('active');
    $('#nav-tab-card').removeClass('active show');
    $('#pay-btn-rm').removeClass('active');
    $('#nav-tab-details').addClass('active show');
    $('#initial-item-rm').addClass('active');
}


$('.carousel').carousel({
    interval: 5000
})


function goToBooking() {
    $('html,body').animate({
        scrollTop: $("#booking-div").offset().top - 100
    },
        'slow');
}

function checkInFromIndex() {
    
    var today = new Date();
    var tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    var dd = String(tomorrow.getDate()).padStart(2, '0');
    var mm = String(tomorrow.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    var day = yyyy + ' - ' + mm + ' - ' + dd;

    pureJSCalendar.open('dd/MM/yyyy', 30, 720, 1, day, '2020 - 12 - 31', 'checkin', 31);
}

function checkOutFromIndex() {

    var today = new Date();
    var dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(today.getDate() + 2);

    var dd = String(dayAfterTomorrow.getDate()).padStart(2, '0');
    var mm = String(dayAfterTomorrow.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = dayAfterTomorrow.getFullYear();
    var doDay = yyyy + ' - ' + mm + ' - ' + dd;

    pureJSCalendar.open('dd/MM/yyyy', 300, 720, 1, doDay, '2020 - 12 - 31', 'checkout', 31);

}

//show the number on the comboBox-button, by click and select this number (1 by default)
$(".dropdown-menu .dropdown-item").click(function () {
    $(this).parents(".dropdown").find('.btn').html($(this).text() + ' <span class="caret"></span>');
    $(this).parents(".dropdown").find('.btn').val($(this).data('value'));
});

function goToCards() {
    $('html,body').animate({
        scrollTop: $("#room-cards").offset().top
    },
        'slow');

    //search room
    var checkIn = $("#checkin").val();
    var checkOut = $("#checkout").val(); 
    if(searchInSpecificRoomType("Normal", 1, checkIn, checkOut) === -1){
        blockRoom("Normal");
    }
    else{ 
        unBlockRoom("Normal");
    }
    if(searchInSpecificRoomType("Deluxe", 2, checkIn, checkOut) === -1){
         blockRoom("Deluxe");
    }
    else{
        unBlockRoom("Deluxe");
    }
    if(searchInSpecificRoomType("Suite", 3, checkIn, checkOut) === -1){
        blockRoom("Suite");
    }
    else{
        unBlockRoom("Suite");
    }  
}

function goToContactUs() {
    $('html,body').animate({
        scrollTop: $("#send-message-div").offset().top - 100
    },
        'slow');
}

function goToImages() {
    $('html,body').animate({
        scrollTop: $("#pic-grid").offset().top - 100
    },
        'slow');
}

function stringToDate(str) {
    var parts = str.split('/');
    var myDate = new Date(parts[2], parts[1] - 1, parts[0]);
    return myDate;
}

function roomIsAvailable(checkInDate, checkOutDate, selectedCheckIn, selectedCheckOut) {
    if ((selectedCheckIn >= checkInDate && selectedCheckIn < checkOutDate)
        || (selectedCheckOut < checkOutDate && selectedCheckOut > checkInDate)) {
        return false;
    }
    if (selectedCheckIn <= checkInDate && selectedCheckOut > checkOutDate) return false;
    if (selectedCheckIn.getTime() === checkInDate.getTime() && selectedCheckOut.getTime() === checkOutDate.getTime()) return false;
    return true;
}

function searchAvailableRoom(roomType, floorNum, snapshot, selectedCheckIn, selectedCheckOut) {
    var roomAvailableFlag;
    var rooms = snapshot.numChildren();
    for (var i = 0; i < rooms; i++) {
        roomAvailableFlag = true;
        var roomNum = (floorNum * 100 + i);
        var bookingHistory = snapshot.child(roomNum + "/bookingHistory").val();
        for (var id in bookingHistory) {
            var checkIn = bookingHistory[id].checkIn;
            var checkOut = bookingHistory[id].checkOut;
            if (roomIsAvailable(stringToDate(checkIn), stringToDate(checkOut),
                stringToDate(selectedCheckIn), stringToDate(selectedCheckOut)) === false) {
                roomAvailableFlag = false;
            }
        }
        if (roomAvailableFlag) return roomNum;
    }
    if (!roomAvailableFlag) return -1;
}

function searchInSpecificRoomType(roomType, floorNum, selectedCheckIn, selectedCheckOut) {
    firebase.database().ref('/rooms/' + roomType).once('value').then(function (snapshot) {
        selectedCheckIn = document.getElementById("checkin").value;
        selectedCheckOut = document.getElementById("checkout").value;
        var roomAvailableFlag = searchAvailableRoom(roomType, floorNum, snapshot, selectedCheckIn, selectedCheckOut);
        if (roomAvailableFlag === -1) {
            blockRoom(roomType);
        }
        else {
            unBlockRoom(roomType);
        }
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

//on load the page set all rooms prices 
function setAllRoomsPrice(pageName) {
    setRoomPrice("Deluxe", 200, pageName);
    setRoomPrice("Normal", 100, pageName);
    setRoomPrice("Suite", 300, pageName);
}
//get the room price from data base (by room type) and put it on html page
function setRoomPrice(roomType, roomNum, pageName) {
    firebase.database().ref('/rooms/' + roomType).once('value').then(function (snapshot) {
        var price = snapshot.child((roomNum) + "/pricePerPe").val();
        if (roomType === "Deluxe") {
            if (pageName === "index")
                document.getElementById("price1").innerHTML = price;
            if (pageName === "rooms")
                document.getElementById("deluxe-price").innerHTML = price;
        }
        if (roomType === "Normal") {
            if (pageName === "index")
                document.getElementById("price2").innerHTML = price;
            if (pageName === "rooms")
                document.getElementById("normal-price").innerHTML = price;
        }
        if (roomType === "Suite") {
            if (pageName === "index")
                document.getElementById("price3").innerHTML = price;
            if (pageName === "rooms")
                document.getElementById("suite-price").innerHTML = price;
        }
    });
}

function indexUpdates() {
    var index = "index";
    setAllRoomsPrice(index);
}

function roomsUpdates() {

    var url = new URL(window.location.href);
    var roomType = url.searchParams.get("roomType");

    if (roomType !== null) {
        scrollToRoomType(roomType);
    }
    var rooms = "rooms";
    setAllRoomsPrice(rooms);
}

function scrollToRoomType(roomType) {

    if (roomType === "Normal") {
        $('html,body').animate({
            scrollTop: $("#normal-room-div").offset().top - 100
        },
            'slow');
        return;
    }
    if (roomType === "Deluxe") {
        $('html,body').animate({
            scrollTop: $("#deluxe-room-div").offset().top - 100
        },
            'slow');
        return;
    }
    if (roomType === "Suite") {
        $('html,body').animate({
            scrollTop: $("#suite-room-div").offset().top - 100
        },
            'slow');
        return;
    }
}

function showDetails(button) {

    var url = new URL(window.location.href);
    var checkIn = url.searchParams.get("checkindate");
    var checkOut = url.searchParams.get("checkoutdate");
    var adults = url.searchParams.get("adults");
    var childrens = url.searchParams.get("childrens");

    $('#checkInModal').val(checkIn);
    $('#checkOutModal').val(checkOut);
    $('#adoultsSelRM').val(adults);
    $('#childrenSelRM').val(childrens);

    if (button === "bookDeluxeButton")
        document.getElementById("roomTypeModal").innerHTML = "Deluxe";
    if (button === "bookNormalButton")
        document.getElementById("roomTypeModal").innerHTML = "Normal";
    if (button === "bookSuiteButton")
        document.getElementById("roomTypeModal").innerHTML = "Suite";
}
//TODO
function bookRoomFromIndex(buttonId) {

    var roomType = "";

    if(buttonId === "bookBtn1")
    {
        roomType = "Deluxe";   
    }
    if(buttonId === "bookBtn2")
    {
        roomType = "Normal";   
    }
    if(buttonId === "bookBtn3")
    {
        roomType = "Suite";   
    }

    $('#room-type-input').val(roomType);
}

function updateBookedRoomAndClient(roomType, floorNum, client, selectedCheckIn, selectedCheckOut,
    firstName, lastName, phoneNum, email, country, PriceToAdd, month) {
    firebase.database().ref('/rooms/' + roomType).once('value').then(function (snapshot) {
        var roomNum = searchAvailableRoom(roomType, floorNum, snapshot, selectedCheckIn, selectedCheckOut);
        if (roomNum === -1) {
            swal("We are full!", "There is no room available on that date for this type", "error");
            return false;
        }
        else {
            bookRoomInDB(snapshot, roomType, roomNum, client, selectedCheckIn, selectedCheckOut);
            pushClient(firstName, lastName, phoneNum, email, country, roomNum);
            updateProfits(PriceToAdd, month);
            return true;
        }
    });
}


function bookRoomInDB(snapshot, roomType, roomNum, client, selectedCheckIn, selectedCheckOut) {
    var postsRef = firebase.database().ref().child('/rooms/' + roomType + '/' + roomNum + '/bookingHistory');
    var newPostRef = postsRef.push();
    newPostRef.set({
        checkIn: selectedCheckIn,
        checkOut: selectedCheckOut,
        email: client
    });
    var postId = newPostRef.key;
}

function pushClient(firstName, lastName, phoneNum, email, country, roomNum) {
    var postsRef = firebase.database().ref().child("clients");
    var newPostRef = postsRef.push();
    newPostRef.set({
        PhoneNum: phoneNum,
        country: country,
        email: email,
        firstName: firstName,
        lastName: lastName,
        roomCheckedIn: roomNum
    });
    var postId = newPostRef.key;
}

function getFloorNum(roomType) {
    if (roomType === "Normal") return 1;
    if (roomType === "Deluxe") return 2;
    if (roomType === "Suite") return 3;
    return -1;
}

function getMonthFromStringDate(date) {
    var month = (stringToDate(date)).getMonth();
    return month + 1;
}

function confirmReservationFromRoom() {

    if (checkCreditCardInputs() === false) {
        return;
    }

    var firstName = document.getElementById("firstNameRoomModal").value;
    var lastName = document.getElementById("lastNameRoomModal").value;
    var phoneNum = document.getElementById("phoneNumberModal").value;
    var email = document.getElementById("mailModale").value;
    var country = document.getElementById("countryModal").value;
    var roomType = document.getElementById("roomTypeModal").textContent;
    var floorNum = getFloorNum(roomType);
    var selectedCheckIn = document.getElementById("checkInModal").value;
    var selectedCheckOut = document.getElementById("checkOutModal").value;
    var PriceToAdd = document.getElementById("totalPriceRM").textContent;
    var month = getMonthFromStringDate(selectedCheckIn);

    setTimeout(saySuccessAndBookRoom, 2000, roomType, floorNum, email, selectedCheckIn, selectedCheckOut,
        firstName, lastName, phoneNum, email, country, PriceToAdd, month);
}

// TODO: Finish checking inputs on credit card
function checkCreditCardInputs() {
    var creditCardNumber = $('#number-creditcard-rm').val();
    var creditCardName = $('#name-creditcard-rm').val();
    var creditCardMonth = $('#month-creditcard-rm').val();
    var creditCardYear = $('#year-creditcard-rm').val();
    var creditCardCvv = $('#cvv-creditcard-rm').val();

    if (checkIfIsOnlyLetters(creditCardName) === false) {
        swal("Error!", "Enter only letters on credit card name!", "error");
        return false;
    }

    if (checkIfIsOnlyNumbers(creditCardNumber) === false) {
        swal("Error!", "Enter only numbers on credit card number!", "error");
        return false;
    }

    if (creditCardNumber.length !== 16) {
        swal("Error!", "Credit card number must have 16 digits!", "error");
        return false;
    }

    if (checkIfIsOnlyNumbers(creditCardMonth) === true) {
        var monthInt = parseInt(creditCardMonth);
        if (monthInt < 1 || monthInt > 12) {
            swal("Error!", "Month must be from 1 to 12", "error");
            return false;
        }
    } else {
        swal("Error!", "Month must be only number between 1 to 12", "error");
        return false;
    }

    if (checkIfIsOnlyNumbers(creditCardYear) === true) {
        var yearInt = parseInt(creditCardYear);
        if (yearInt < 19 || yearInt > 40) {
            swal("Error!", "Year must be from 19 to 40", "error");
            return false;
        }
    } else {
        swal("Error!", "Year must be only number between 19 to 40", "error");
        return false;
    }

    if (checkIfIsOnlyNumbers(creditCardCvv) === true) {
        if (creditCardCvv.length !== 3) {
            swal("Error!", "CVV must be number of 3 digits", "error");
            return false;
        }
    } else {
        swal("Error!", "CVV must be number of 3 digits", "error");
        return false;
    }

    return true;

}

function checkIfIsOnlyLetters(str) {
    var re = /^[A-Za-z\s]+$/;
    if (re.test(str))
        return true;
    else
        return false;
}

function checkIfIsOnlyNumbers(str) {
    var re = /^\d+$/;
    if (re.test(str))
        return true;
    else
        return false;
}

function saySuccessAndBookRoom(roomType, floorNum, email, selectedCheckIn, selectedCheckOut,
    firstName, lastName, phoneNum, email, country, PriceToAdd, month) {
    swal("Success!", "Your credit card has been checked successfully", "success");
    updateBookedRoomAndClient(roomType, floorNum, email, selectedCheckIn, selectedCheckOut,
        firstName, lastName, phoneNum, email, country, PriceToAdd, month);
    $('#final-details-btn-rm').removeClass('disabled');
    makeFinalDetails(roomType, selectedCheckIn, selectedCheckOut, PriceToAdd);
}

function makeFinalDetails(roomType, selectedCheckIn, selectedCheckOut, PriceToAdd) {
    $('#ci-rm').html(selectedCheckIn);
    $('#co-rm').html(selectedCheckOut);
    $('#price-rm').html(PriceToAdd);
    $('#cc-number-rm').html($('#number-creditcard-rm').val());
    var childrens = $('#childrenSelRM').val();
    var adults = $('#adoultsSelRM').val();
    $('#people-number-rm').html(adults + " adults, " + childrens + " childrens");
    if (roomType === "Normal") {
        $('#room-size-rm').html("50 m2");
    } else if (roomType === "Deluxe") {
        $('#room-size-rm').html("100 m2");
    } else {
        $('#room-size-rm').html("150 m2");
    }
}

function calcTotalPriceForRoom(peopleNum, PricePerPe, checkIn, checkOut) {
    var date1 = stringToDate(checkIn);
    var date2 = stringToDate(checkOut);
    var timeDiff = Math.abs(date2.getTime() - date1.getTime());
    var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return (PricePerPe * peopleNum * diffDays);
}

function getPricePrePe(roomType) {
    if (roomType === "Deluxe") {
        return parseInt(document.getElementById("deluxe-price").textContent);
    }
    if (roomType === "Normal") {
        return parseInt(document.getElementById("normal-price").textContent);
    }
    if (roomType === "Suite") {
        return parseInt(document.getElementById("suite-price").textContent);
    }
}

function updateTotalPrice(buttonId) {
    var roomType = document.getElementById("roomTypeModal").textContent;
    if (buttonId === "shwoTotalPriceRM") {
        var adoults = document.getElementById("adoultsSelRM").value;
        var childrens = document.getElementById("childrenSelRM").value;
        var peopleNum = (parseInt(adoults) + parseInt(childrens));
        var PricePerPe = getPricePrePe(roomType);
        var checkIn = document.getElementById("checkInModal").value;
        var checkOut = document.getElementById("checkOutModal").value;

        if (checkDetailsInput() === false) {
            return;
        }
        if (checkValidationOfInputs(adoults, childrens, peopleNum, PricePerPe) === false) {
            alert("You have to enter all the information to make a book");
            return;
        }
        if (checkValidationOfDates(checkIn, checkOut) === false) {
            return;
        }

        firebase.database().ref('/rooms/' + roomType).once('value').then(function (snapshot) {
            var roomNum = searchAvailableRoom(roomType, getFloorNum(roomType), snapshot, checkIn, checkOut);
            if (roomNum === -1) {
                swal("We are full!", "There is no room available on that date for this type", "error");
                return;
            }
            var totalPrice = calcTotalPriceForRoom(peopleNum, PricePerPe, checkIn, checkOut);
            document.getElementById("totalPriceRM").innerHTML = totalPrice;
            $('#pay-btn-rm').removeClass('disabled');
        });
    }
}

function checkDetailsInput() {

    var fn = $('#firstNameRoomModal').val();
    var ln = $('#lastNameRoomModal').val();
    var email = $('#mailModale').val();
    var country = $('#countryModal').val();
    var phoneNum = $('#phoneNumberModal').val();

    if (checkIfIsOnlyLetters(fn) === false) {
        swal("Error", "Enter a valid name", "error");
        return false;
    }

    if (checkIfIsOnlyLetters(ln) === false) {
        swal("Error", "Enter a valid last name", "error");
        return false;
    }

    if (checkIfValidEmail(email) === false) {
        swal("Error", "Enter a valid email", "error");
        return false;
    }

    if (checkIfIsOnlyLetters(country) === false) {
        swal("Error", "Enter a valid country", "error");
        return false;
    }

    if (checkIfIsOnlyNumbers(phoneNum) === false) {
        swal("Error", "Enter a valid phone number", "error");
        return false;
    }

    return true;
}

function checkIfValidEmail(email) 
{
    var re = /\S+@\S+\.\S+/;
    return re.test(email);
}

function checkValidationOfDates(ci, co) {
    if (stringToDate(ci) < Date.now() || stringToDate(co) < Date.now()) {
        alert("You can book a room with a check in date from tomorrow and ahead");
        return false;
    }
    if (stringToDate(ci) < stringToDate(co)) {
        return true;
    } else {
        alert("The check out date must be after the check in date");
        return false;
    }
}

function checkValidationOfInputs() {
    var fn = $('#firstNameRoomModal').val();
    var ln = $('#lastNameRoomModal').val();
    var mail = $('#mailModale').val();
    var country = $('#countryModal').val();
    var phone = $('#phoneNumberModal').val();
    var adoults = $('#adoultsSelRM').val();
    var childrens = $('#childrenSelRM').val();


    if (fn === "" || ln === "" || mail === "" || country === "" || phone === ""
        || adoults === "Adoults number..." || childrens === "Childrens number...") {
        return false;
    }
    return true;
}



function updateProfits(priceToAdd, month) {
    var oldAmount = 0;
    var newAmount = priceToAdd;
    var myRef = firebase.database().ref('profits');
    myRef.once('value').then(function (snapshot) {
        oldAmount = snapshot.child(month).val();
        newAmount = parseInt(newAmount) + (oldAmount);

        myRef.update({
            [month]: newAmount
        });
    });
}

function checkMessageInputs() {
    if ($('#fname').val() === "" || $('#lname').val() === "" || $('#message').val() === "" || $('#email-input').val() === "") {
        return false;
    }
}

function submitMsg() {

    if (checkMessageInputs() === false) {
        alert("You need to fill every field to send a message");
        return;
    }
    var firstName = $('#fname').val();
    var lastName = $('#lname').val();
    var message = $('#message').val();
    var email = $('#email-input').val();

    var messageRef = firebase.database().ref('messages/');
    var pushedKey = messageRef.push();

    pushedKey.set({
        email: email,
        firstName: firstName,
        lastName: lastName,
        message: message
    });
}