let videoDetails = {};
let urlSelected;
let codeSelected;
$(document).ready(function () {
	init();
});

function init() {
	registerEventListeners();
	youtubeGetCheck();
}

function registerEventListeners() {
	$("#btnSearch").click(btnSearchClick);
	$("#btnDownload").click(btnDownloadClick);
	$("#btnExDownload").click(btnExDownloadClick);
	$("#txtVidUrl").on("keyup paste", vidUrlValidate);
}


function btnSearchClick() {
	if (vidUrlValidate()) {
		$("#btnSearch").attr("disabled", true);
		$("#progressSearch").fadeIn();
		let url = $("#txtVidUrl").val();
		detailsGet(url, function () {
			let formats = videoDetails.formats;

			// video info card
			$("#imgVidThumb").attr("src", videoDetails.thumbnail);
			$("#lblVidTitle").text(videoDetails.title);
			$("#lblVidDuration").text(fancyTimeFormat(videoDetails.duration));

			// loop through formats
			for (i in formats) {
				$("#listDownloads").append(`
				<li onclick="vidDownloadSelect(this, ${i})" class="list-group-item">
				${listItemTextGet(formats[i])}
				</li>`);
			}

			$("#progressSearch").hide();
			$("#panelSearch").hide();
			$("#btnDownload").attr("disabled", true);
			$("#panelDown").fadeIn();
		});
	}
}

// external download via s1
function btnExDownloadClick() {
	$("#btnExDownload").attr("disabled", true);
	$("#progressDownload").fadeIn();

	let data = {
		"url": $("#txtVidUrl").val(),
		"code": codeSelected
	};

	let url = "./request/download.php";

	$.get(url, data, function (data) {
		window.location = data;
	});
}

function listItemTextGet(file) {
	let filesize = file.filesize !== "best" ? (formatBytes(file.filesize)).trim() : "best";
	let format = (((file.format).split("-"))[1]).trim();
	let ext = file.ext;
	let tbr = Math.round(file.tbr);
	if (format.indexOf("audio only (DASH audio)") > -1) {
		return (`${format} - ${tbr}k - ${ext} - (${filesize})`);
	} else {
		return (`video - ${format} - ${ext} - (${filesize})`);
	}
}

function vidDownloadSelect(elem, code) {
	$(".list-group-item").removeClass("active");
	$(elem).addClass("active");
	urlSelected = videoDetails["formats"][code]["url"];
	codeSelected = code;
	$("#btnDownload").attr("disabled", false);
	$("#btnExDownload").attr("disabled", false);
}

function btnDownloadClick() {
	window.location = urlSelected;
}

function detailsGet(url, callback) {
	$.get("./request/info.php", { url, url }, function (data) {
		videoDetails = data;
		callback();
	}, "json")
}

function formatBytes(bytes, decimals) {
	if (bytes == 0) return '0 Bytes';
	var k = 1024,
		dm = decimals <= 0 ? 0 : decimals || 2,
		sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
		i = Math.floor(Math.log(bytes) / Math.log(k));
	return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function vidUrlValidate() {
	let val = $("#txtVidUrl").val();
	let regEx = /^(?:https?:\/\/)?(?:youtu\.be\/|(?:www\.|m\.)?youtube\.com\/(?:watch|v|embed)(?:\.php)?(?:\?.*v=|\/))([a-zA-Z0-9\-_]+)+/;
	if (regEx.test(val)) {
		$("#txtUrlGroup").removeClass("has-error");
		$("#txtUrlGroup").addClass("has-success");
		return (true);
	} else {
		$("#txtUrlGroup").removeClass("has-success");
		$("#txtUrlGroup").addClass("has-error");
		// return (false);
	}
}

function fancyTimeFormat(time) {
	// Hours, minutes and seconds
	var hrs = ~~(time / 3600);
	var mins = ~~((time % 3600) / 60);
	var secs = ~~time % 60;

	// Output like "1:01" or "4:03:59" or "123:03:59"
	var ret = "";

	if (hrs > 0) {
		ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
	}

	ret += "" + mins + ":" + (secs < 10 ? "0" : "");
	ret += "" + secs;
	return ret;
}

// support for youtubeget.ml redirects
function youtubeGetCheck() {
	let currentUrl = window.location.href;
	if (currentUrl.indexOf("?url=") > -1) {
		let ytUrl = currentUrl.split("url=")[1];
		$("#txtVidUrl").val(ytUrl);
		vidUrlValidate();
		btnSearchClick();
	}
}