
/////////////////////////////////////////////////////////////////

const API_URL = "http://localhost:5200/api";

let shouldStop = false;
document.body.style.zoom = "80%";
let stopped = false;
const recordButton = document.getElementById('record');

const videoElement = document.getElementsByTagName("video")[0];

const recordBtn = document.querySelector("#recordvideo");
var cropp = document.querySelector('.resizers');
var crop = document.querySelector('#crop');

const stopButton = document.getElementById('stop');
const title = document.getElementById('title');
const description = document.getElementById('description');



const params = Object.fromEntries(new URLSearchParams(location.search));
console.log(params);



$('#start').prop('disabled', true);

$('#crop').prop('disabled', true);
$('#start').css('display', 'none');

function startRecord() {

    // $('.btn-info').prop('disabled', true);
    $('#start').prop('disabled', false);
    $('#re').prop('disabled', true);
    $('#record').prop('disabled', true);

    $('#stop').prop('disabled', false);
    $('#crop').prop('disabled', false);



}



function stopRecord() {
    $('#record').prop('disabled', false);

    $('#re').prop('disabled', false);
    $('#start').prop('disabled', true);

    $('.btn-info').prop('disabled', false);

    $('#stop').prop('disabled', true);
    $('#crop').prop('disabled', true);
    $('.resizers').css('display', 'none');

}
stopButton.addEventListener('click', function () {
    shouldStop = true;
    $('#start').css('display', 'none');

});
recordButton.addEventListener('click', function () {
    recordScreen();
});
crop.addEventListener('click', function () {
    $('.resizers').css('display', 'block');
    $('#start').css('display', 'initial');

});
const audioRecordConstraints = {

    echoCancellation: true

}






const handleRecord = function ({ stream, mimeType }) {

    startRecord()

    let recordedChunks = [];

    stopped = false;

    const mediaRecorder = new MediaRecorder(stream);



    mediaRecorder.ondataavailable = function (e) {

        if (e.data.size > 0) {
            recordedChunks.push(e.data);
        }

        if (shouldStop === true && stopped === false) {

            mediaRecorder.stop();

            stopped = true;

        }

    };



    mediaRecorder.onstop = function () {
        const blob = new Blob(recordedChunks, { type: mimeType });




        recordedChunks = [];
        var croppn = window.getComputedStyle(cropp, null).display;

        if (croppn === 'none') {
            const filename = window.prompt('Enter file name');
            const downloadLink = document.createElement("a");

            downloadLink.href = URL.createObjectURL(blob);

            downloadLink.download = `${filename || 'recording'}.mp4`;
            downloadLink.click();
            UploadVideo(blob);
            location.reload();

        } else {

            recordBtn.click();
        }
        stopRecord();

        videoElement.srcObject = null;

    };



    mediaRecorder.start(200);

};

async function UploadVideo(blob) {

    chrome.storage.local.get(null, (res) => {
        var url = `${API_URL}/video`;
        const formData = new FormData();
        formData.append("user", res.credentials.username);
        formData.append("title", title.value);
        formData.append("description", description.value);
        formData.append("date", (new Date().toISOString().slice(0, 16)));
        formData.append("video", blob);

        var request = new XMLHttpRequest();
        request.open("POST", url, false);
        xhr.setRequestHeader("Authorization", "bearer " + res.token);

        request.onreadystatechange = function () {
        };

        console.log('formData???????', formData);
        request.send(formData);
    })
}


async function recordAudio() {

    const mimeType = 'audio/webm';

    shouldStop = false;

    const stream = await navigator.mediaDevices.getUserMedia({ audio: audioRecordConstraints })

    handleRecord({ stream, mimeType })

}



async function recordVideo() {

    const mimeType = 'video/webm';

    shouldStop = false;

    const constraints = {

        audio: {

            "echoCancellation": true

        },

        video: {

            "width": {

                "min": 640,

                "max": 1024

            },

            "height": {

                "min": 480,

                "max": 768

            }

        }

    };

    const stream = await navigator.mediaDevices.getUserMedia(constraints);

    videoElement.srcObject = stream;

    handleRecord({ stream, mimeType })

}

/////////////////////////////////////////////
var voicene;
async function recordScreen() {

    const mimeType = 'video/mp4';

    shouldStop = false;

    const constraints = {

        video: {

            cursor: 'motion'

        }

    };

    if (!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia)) {

        return window.alert('Screen Record not supported!')

    }

    let stream = null;

    const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: { cursor: "motion" }, audio: { 'echoCancellation': true } });

    if (window.confirm("Record audio with screen?")) {

        // const audioContext = new AudioContext();



        // const voiceStream = await navigator.mediaDevices.getUserMedia({ audio: { 'echoCancellation': true }, video: false });

        // const userAudio = audioContext.createMediaStreamSource(voiceStream);



        // const audioDestination = audioContext.createMediaStreamDestination();

        // userAudio.connect(audioDestination);



        // if (displayStream.getAudioTracks().length > 0) {

        //     const displayAudio = audioContext.createMediaStreamSource(displayStream);

        //     displayAudio.connect(audioDestination);

        // }



        // const tracks = [...displayStream.getVideoTracks(), ...audioDestination.stream.getTracks()]
        voicene = displayStream.getAudioTracks();
        stream = displayStream;

        handleRecord({ stream, mimeType })

    } else {

        stream = displayStream;

        handleRecord({ stream, mimeType });

    };

    videoElement.srcObject = stream;

}
////////////////////////////////

const el = document.querySelector(".resizers");
const ot = document.querySelector(".vv");
const s_ont = ot.getBoundingClientRect();
var top_x_s = s_ont.top;
var left_x_s = s_ont.left;
el.style.left = left_x_s + 50 + 'px';
el.style.top = top_x_s + 50 + 'px';

let isResizing = false;

el.addEventListener("mousedown", mousedown);

function mousedown(e) {
    window.addEventListener("mousemove", mousemove);
    window.addEventListener("mouseup", mouseup);

    let prevX = e.clientX;
    let prevY = e.clientY;

    function mousemove(e) {
        if (!isResizing) {
            let newX = prevX - e.clientX;
            let newY = prevY - e.clientY;

            const rect = el.getBoundingClientRect();
            const ont = ot.getBoundingClientRect();
            var x = rect.left - newX;
            var y = rect.top - newY;

            // console.log(x, y);
            var bottom = ont.bottom;
            var top = ont.top;
            var bottom_h = bottom - el.offsetHeight;
            var right_w = ont.right - el.offsetWidth;
            console.log(bottom_h);

            if (x < right_w && x > ont.left && y > top && y < bottom_h) {
                el.style.left = x + "px";
                el.style.top = y + "px";
            }

            prevX = e.clientX;
            prevY = e.clientY;
        }
    }

    function mouseup() {
        window.removeEventListener("mousemove", mousemove);
        window.removeEventListener("mouseup", mouseup);
    }
}

const resizers = document.querySelectorAll(".resizer");
let currentResizer;

for (let resizer of resizers) {
    resizer.addEventListener("mousedown", mousedown);

    function mousedown(e) {
        currentResizer = e.target;
        isResizing = true;

        let prevX = e.clientX;
        let prevY = e.clientY;

        window.addEventListener("mousemove", mousemove);
        window.addEventListener("mouseup", mouseup);

        function mousemove(e) {
            const rect = el.getBoundingClientRect();
            // const bb = ot.getBoundingClientRect();


            // console.log(x, y);
            // var b_bottom_x = bb.bottom;
            // var b_top_x = bb.top;
            // var b_left_x = bb.left;
            // var b_right_x = bb.right;

            // var b_bottom_n = rect.bottom;
            // var b_top_n = rect.top;
            // var b_left_n = rect.left;
            // var b_right_n = rect.right;
            // var b_t = b_top_n - b_top_x;
            // el.style.borderTop = b_t+"px solid red";
            // console.log('hello')
            // console.log(b_t)
            if (currentResizer.classList.contains("se")) {
                el.style.width = rect.width - (prevX - e.clientX) + "px";
                el.style.height = rect.height - (prevY - e.clientY) + "px";
            } else if (currentResizer.classList.contains("sw")) {
                el.style.width = rect.width + (prevX - e.clientX) + "px";
                el.style.height = rect.height - (prevY - e.clientY) + "px";
                el.style.left = rect.left - (prevX - e.clientX) + "px";
            } else if (currentResizer.classList.contains("ne")) {
                el.style.width = rect.width - (prevX - e.clientX) + "px";
                el.style.height = rect.height + (prevY - e.clientY) + "px";
                el.style.top = rect.top - (prevY - e.clientY) + "px";
            } else {
                el.style.width = rect.width + (prevX - e.clientX) + "px";
                el.style.height = rect.height + (prevY - e.clientY) + "px";
                el.style.top = rect.top - (prevY - e.clientY) + "px";
                el.style.left = rect.left - (prevX - e.clientX) + "px";
            }

            prevX = e.clientX;
            prevY = e.clientY;
        }

        function mouseup() {
            const ttt = ot.getBoundingClientRect();
            const nnn = el.getBoundingClientRect();


            // console.log(x, y);
            var bottom_x = ttt.bottom;
            var top_x = ttt.top;
            var left_x = ttt.left;
            var right_x = ttt.right;

            var bottom_n = nnn.bottom;
            var top_n = nnn.top;
            var left_n = nnn.left;
            var right_n = nnn.right;
            console.log(bottom_n, bottom_x)

            if (right_n >= right_x || left_n <= left_x || bottom_n >= bottom_x || top_n <= top_x) {
                console.log("ok")
                el.style.width = 100 + "px";
                el.style.height = 100 + "px";
                el.style.left = left_x + 50 + 'px';
                el.style.top = top_x + 50 + 'px';
            }


            window.removeEventListener("mousemove", mousemove);
            window.removeEventListener("mouseup", mouseup);
            isResizing = false;
        }
    }
}



const canvas = document.querySelector("canvas");
const context = canvas.getContext("2d");
const constrains = {
    audio: {
        "echoCancellation": true
    },
    video: false
};

let recording = false;
let mediaRecorder;
let recordedChunks;

recordBtn.addEventListener("click", () => {
    recording = !recording;
    if (recording) {
        recordBtn.textContent = "Stop";
        const canvasStream = canvas.captureStream(30);
        if (voicene[0]) {
            canvasStream.addTrack(voicene[0]);
            console.log(voicene)
        }
        // --> joint the two streams
        mediaRecorder = new MediaRecorder(canvasStream, {
            // don't forget the audio codec
            mimeType: "video/webm; codecs=vp9,opus",
            // ignoreMutedMedia: false
        });
        recordedChunks = [];
        mediaRecorder.ondataavailable = e => {
            if (e.data.size > 0) {
                recordedChunks.push(e.data);
            }
        };
        mediaRecorder.start();

    } else {
        recordBtn.textContent = "Record";
        mediaRecorder.stop();
        setTimeout(() => {
            const blob = new Blob(recordedChunks, {
                type: "video/mp4"
            });
            UploadVideo(blob);
            const url = URL.createObjectURL(blob);

            const filename = window.prompt('Enter file name');

            const a = document.createElement("a");

            a.href = url;
            a.download = `${filename || 'recording'}.mp4`;
            a.click();

            URL.revokeObjectURL(url);
            location.reload();
        }, 0);
    }
});


var start = document.getElementById("start");
start.addEventListener("click", () => {
    $('.resizers').css('pointer-events', 'none');
    $('#start').prop('disabled', true);
    $('#crop').prop('disabled', true);
    var croppv = window.getComputedStyle(cropp, null).display;
    if (croppv === 'block') {
        // body...
        recordBtn.click();
        // $('#download').css('display', 'block');
        // $('.resizers').css('display', 'none');

        var canvas = document.getElementById('canvas');
        var ctx = canvas.getContext('2d');
        var video = document.getElementById('videoss');
        // video.addEventListener('play', function() {
        const m_ttt = ot.getBoundingClientRect();
        const m_nnn = el.getBoundingClientRect();


        // console.log(x, y);
        var top_x = m_ttt.top;
        var left_x = m_ttt.left;

        var top_n = m_nnn.top;
        var left_n = m_nnn.left;

        var m_t = top_n - top_x;
        var m_l = left_n - left_x;
        var wi = el.offsetWidth;
        var hi = el.offsetHeight;
        canvas.width = wi;
        canvas.height = hi;
        var $this = video; //cache
        console.log(m_l, m_t);
        (function loop() {
            if (!$this.paused && !$this.ended) {

                ctx.drawImage($this,
                    m_l, m_t, // Start at 70/20 pixels from the left and the top of the image (crop),
                    wi, hi, // "Get" a `50 * 50` (w * h) area from the source image (crop),
                    0, 0, // Place the result at 0, 0 in the canvas,
                    wi, hi);
                setTimeout(loop, 1000 / 30); // drawing at 30fps
            }
        })();
        // }, 0);
    }
});