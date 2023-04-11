const API_URL = "http://localhost:5200/api";
const WEBSITE_URL = "http://yourarchiv.com";

const params = Object.fromEntries(new URLSearchParams(location.search));
var position;
var size;

var canvas;
var ctx;
var image;

chrome.runtime.onMessage.addListener(
	function (message, sender, sendResponse) {
		console.log("message");
	});

document.addEventListener('DOMContentLoaded', function () {
	setTimeout(OnLoad, 0);
});

function OnLoad() {


	canvas = document.getElementById('canvas');

	if (!canvas) {
		console.error("Canvas element not found");
		return;
	}

	if (!canvas.getContext) {
		console.error("Canvas context not supported");
		return;
	}

	ctx = canvas.getContext('2d');

	image = new Image();
	image.src = params.capture;
	image.src = "https://live.staticflickr.com/47/150654741_ae02588670_b.jpg";
	image.addEventListener('load', function () {
		canvas.width = image.width;
		canvas.height = image.height;

		$("#container").css("width", image.width);
		$("#container").css("height", image.height);

		ctx.drawImage(image, 0, 0);
	}, false);

	document.getElementById("btn-select").addEventListener("click", SelectArea);
	document.getElementById("btn-upload").addEventListener("click", Upload);
	document.getElementById("btn-crop").addEventListener("click", Crop);

	var s = $("#handle-s");
	$("#target").resizable({
		containment: "parent",
		helper: "ui-resizable-helper",
		handles: {
			'n': '.ui-resizable-n',
			'e': '.ui-resizable-e',
			's': '.ui-resizable-s',
			'w': '.ui-resizable-w',
			'ne': '.ui-resizable-ne',
			'se': '.ui-resizable-se',
			'sw': '.ui-resizable-sw',
			'nw': '.ui-resizable-nw'
		},
		stop: function (event, ui) {
			size = ui.size;
		}
	});
	$("#target").draggable({
		containment: "parent",
		stop: function (event, ui) {
			position = ui.position;
		}
	});
}




function SelectArea() {
	if ($("#target").is(":visible")) {
		$("#target").hide();
		$("#btn-select").show();
		$("#btn-upload").show();
		$("#btn-crop").hide();
		$("#btn-cancel").hide();
	} else {
		$("#target").show();
		$("#btn-select").hide();
		$("#btn-upload").hide();
		$("#btn-crop").show();
		$("#btn-cancel").show();
	}
}

function Crop() {
	var posX = position.left;
	var posY = position.top - 50;
	var w = size.width;
	var h = size.height;
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	canvas.width = w;
	canvas.height = h;
	$("#container").css("width", w);
	$("#container").css("height", h);
	ctx.drawImage(image, posX, posY, w, h, 0, 0, w, h);
	SelectArea();
	$("#btn-select").addClass("disabled");
}


function Upload() {
	chrome.storage.local.get(nuu, (res) => {
		var captureData = localStorage.getItem("captureData");
		if (captureData) {
			captureData = JSON.parse(captureData);

			var username = captureData.username;
			var password = captureData.password;
			var selections = captureData.selections;
			var connections = captureData.connections;
			var metadata = {
				title: captureData.title,
				description: captureData.description,
				date: captureData.date,
				url: captureData.url,
				pageDate: captureData.pageDate
			};
			var quality = captureData.quality;
			var capture = canvas.toDataURL('image/jpeg', quality / 100);

			$.ajax({
				type: "POST", url: `${API_URL}/ext/upload`, dataType: "json",
				async: false, contentType: 'application/json',
				data: JSON.stringify({
					selections, connections, metadata, capture
				}),
				beforeSend: function (xhr) {
					xhr.setRequestHeader("Authorization", "bearer " + res.token);
				},
				success: function (x) {
					alert("Capture uploaded succesfully");
					window.close();
				},
				error: function (error) {

					console.log("error uploading:");
					console.log(error);
				}
			});
		}
	})
}

function drawimg(idata) {
	var img = new Image();
	img.onload = function () {
		ctx.drawImage(img, 33, 71, 104, 124, 21, 20, 87, 104);
	};
	img.src = idata;
}