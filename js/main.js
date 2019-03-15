
$('.carousel').carousel({
    interval: 5000
})

document.getElementById("checkin").onclick = function() {
    pureJSCalendar.open('dd.MM.yyyy', 110, 300, 1, '2018-5-5', '2019-8-20', 'checkin', 100);
};  

document.getElementById("checkout").onclick = function() {
    pureJSCalendar.open('dd.MM.yyyy', 110, 300, 1, '2018-5-5', '2019-8-20', 'checkout', 20);
};  

function goToCards() {
    $('html,body').animate({
        scrollTop: $("#room-cards").offset().top},
        'slow');
}

function goToBooking() {
    $('html,body').animate({
        scrollTop: $("#booking-div").offset().top},
        'slow');
}

firebase.database().ref('clients').push().set({
    firstName: "mflsa",
    lastName:"mvasc",
    email: "amir@gmail.com",
    country: "Argentina",
    PhoneNum: "91402914"
});