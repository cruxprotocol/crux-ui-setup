document.getElementById('retry-button').onclick = function(e){
	// document.getElementById("error-message").classList.remove("loading");
	document.getElementById("error-message").style.display = "none";
	document.getElementById("overlay").style.display = "none";
}


document.getElementById('send-payment-request').onclick = function(e){
	document.getElementById("error-message").classList.add("loading");
	document.getElementById("error-message-text").innerHTML = "Please login into your OpenPay enabled app where you want to receive payment request.";
	document.getElementById("error-message").style.display = "block";
	document.getElementById("overlay").style.display = "block";
}

function transaction_failed() {
	document.getElementById("error-message").classList.remove("loading");
	document.getElementById("error-message-text").innerHTML = "Payment failed because OpenPay request expired.";
}

function transaction_channel_creation_acknowledged() {
	document.getElementById("error-message-text").innerHTML = "Please accept the request from Uber on your OpenPay enabled app.";
}

function transaction_success() {
	document.getElementById("error-message").classList.remove("loading");
	document.getElementById("error-message-text").innerHTML = "Transaction confirmed";
}
