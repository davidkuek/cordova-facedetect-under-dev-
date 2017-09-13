



document.addEventListener("deviceready", onDeviceReady, false);
function onDeviceReady() {
    document.getElementById('openCamera').addEventListener('click',openCamera,false);
    // document.getElementById('openLibrary').addEventListener('click',openFilePicker,false);
    // document.getElementById('faceDetect').addEventListener('click',faceDetect,false);    
}

var cc = document.getElementById('image').getContext('2d');
var overlay = document.getElementById('overlay');
var overlayCC = overlay.getContext('2d');
var ctrack = new clm.tracker({stopOnConvergence : true});
var imagePath;
ctrack.init();




// =========== Cordova Camera function =============

function setOptions(srcType) {
    var options = {
        // Some common settings are 20, 50, and 100
        quality: 100,
        destinationType: Camera.DestinationType.FILE_URI,
        // In this app, dynamically set the picture source, Camera or photo gallery
        sourceType: srcType,
        encodingType: Camera.EncodingType.JPEG,
        mediaType: Camera.MediaType.PICTURE,
        allowEdit: false,
        correctOrientation: true,
        targetHeight : 266,
        targetWidth : 200
        
          //Corrects Android orientation quirks
    }
    return options;
}

function openCamera(selection,canvas) {

    var srcType = Camera.PictureSourceType.CAMERA;
    var options = setOptions(srcType);
    // var func = createNewFileEntry;
    // alert('Please face the camera');
    navigator.camera.getPicture(function cameraSuccess(imageUri) {


        displayImage(imageUri);
        console.log(imageUri);
        faceDetect(imageUri);
        
        
        

        // You may choose to copy the picture, save it somewhere, or upload.
        // func(imageUri);
    }, function cameraError(error) {
        console.debug("Unable to obtain picture: " + error, "app");

    }, options);
}

function displayImage(imageUri) {

    
    var img = new Image();
        img.onload = function() {
          cc.drawImage(img,0,0,200,266);
        };
    img.src = imageUri;
    
    
    
}


// ================ Handling face detection =============

var drawRequest;

function faceDetect(imageUri) {
  ctrack.start(document.getElementById('image'));
  drawLoop();
  window.imagePath = imageUri;
}

function drawLoop() {
  drawRequest = requestAnimFrame(drawLoop);
  overlayCC.clearRect(0, 0,300,300);
  if (ctrack.getCurrentPosition()) {
    ctrack.draw(overlay);
  }
}

// ============== Deleting saved image ===============



function deleteFile(imagePath){


var path = "file:///storage/emulated/0/Android/data/com.example.cordovacamera7/cache/";
var convertString = String(imagePath);
var fileName = convertString.slice(73,92);
alert(fileName);


window.resolveLocalFileSystemURL(path, function(dir) {
  dir.getFile(fileName, {create:false}, function(fileEntry) {
              fileEntry.remove(function(){
                alert('file deleted');
                  // The file has been removed succesfully
              },function(error){
                alert('error of' + error);    
                  // Error deleting the file
              },function(){
                alert('no file exist');
                 // The file doesn't exist
              });
  });
});
}


// ================= Event handler for face detect ========

document.addEventListener("clmtrackrConverged", function(event) {
  
  var position = ctrack.getCurrentPosition();
  
  alert('Face detected');
  console.log(position);
          // stop drawloop
  cancelRequestAnimFrame(drawRequest);
  ctrack.reset(overlay);
}, false);


document.addEventListener("clmtrackrNotFound", function(event) {
    
    var position = ctrack.getCurrentPosition();
    
    ctrack.stop();
    alert("Please try again.")
    console.log(position);
    deleteFile(imagePath);
    ctrack.reset(overlay);
  }, false);


        // detect if tracker loses tracking of face
document.addEventListener("clmtrackrLost", function(event) {
  
  var position = ctrack.getCurrentPosition();
  
  ctrack.stop();
  alert("Track Lost.");
  console.log(position);
  deleteFile(imagePath);
  ctrack.reset(overlay);
}, false);