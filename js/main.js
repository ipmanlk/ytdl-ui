let videoDetails = {};
let urlSelected;
let codeSelected;
$(document).ready(function () {
	init();
});

function init() {
	registerEventListeners();
	youtubeGetCheck();
	recentVidsLoad();
}

function registerEventListeners() {
	$("#btnSearch").click(btnSearchClick);
	$("#btnDownload").click(btnDownloadClick);
	$("#txtVidUrl").on("keyup paste", vidUrlValidate);
}


function btnSearchClick() {
	if (vidUrlValidate()) {
		$("#btnSearch").attr("disabled", true);
		$("#alertOutput").hide();
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
				$("#tblDownloads tbody").append(tdGet(formats[i], i));
			}

			$("#progressSearch").hide();
			$("#panelSearch").hide();
			$("#btnDownload").attr("disabled", true);
			$("#panelDown").fadeIn();
		});
	}
}


function tdGet(file, code) {
	let filesize = file.filesize !== "best" ? (formatBytes(file.filesize)).trim() : "best";
	let format = (((file.format).split("-"))[1]).trim();
	let ext = file.ext;
	let tbr = Math.round(file.tbr) + "k";
	let td;
	if (format.indexOf("audio only (DASH audio)") > -1) {
		td = `
		<tr onclick="vidDownloadSelect(this, ${code})">
			<td>Audio</td>
			<td>${tbr}</td>
			<td>${ext}</td>
			<td>${filesize}</td>
		</tr>`
	} else {
		td = `
		<tr onclick="vidDownloadSelect(this, ${code})">
			<td>Video</td>
			<td>${format}</td>
			<td>${ext}</td>
			<td>${filesize}</td>
		</tr>`
	}

	return (td);
}

function vidDownloadSelect(elem, code) {
	$("tr").removeClass("info");
	$(elem).addClass("info");
	urlSelected = videoDetails["formats"][code]["url"];
	codeSelected = code;
	$("#btnDownload").attr("disabled", false);
}

function btnDownloadClick() {
	var server = $("#cmbServer").val();
	if (server == "yt") {
		window.location = urlSelected;
	} else {
		$("#btnDownload").attr("disabled", true);
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
}

function detailsGet(url, callback) {
	$.get("./request/info.php", { url, url }, function (data) {
		if (data.title !== null) {
			videoDetails = data;
			callback();
		} else {
			$("#alertOutput").text("Youtube link doesn't exist!");
			$("#progressSearch").hide();
			$("#alertOutput").fadeIn();
			$("#btnSearch").attr("disabled", false);
		}
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

function recentVidsLoad() {
	$.get("./log/getLogs.php", function (data) {
		for (let i in data) {
			$("#listRecentVids").append(`
			<a class="list-group-item" onclick="recentVidSearch('${data[i].url}')">${data[i].title}</a>
			`);
		}
		$("#listRecentVids").parent().fadeIn();
	}, "json");
}

function recentVidSearch(ytUrl) {
	$("#txtVidUrl").val(ytUrl);
	btnSearchClick();
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