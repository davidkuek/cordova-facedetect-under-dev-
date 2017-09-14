



document.addEventListener("deviceready", onDeviceReady, false);
function onDeviceReady() {
    document.getElementById('openCamera').addEventListener('click',openCamera,false);
    // document.getElementById('displayImage').addEventListener('click',displaySavedImage,false);
    
    // document.getElementById('openLibrary').addEventListener('click',openFilePicker,false);
    // document.getElementById('faceDetect').addEventListener('click',faceDetect,false);    
}


/* Global var */
var cc = document.getElementById('image').getContext('2d');
var overlay = document.getElementById('overlay');
var overlayCC = overlay.getContext('2d');
var ctrack = new clm.tracker({stopOnConvergence : true});
var drawRequest;
var imagePath;
ctrack.init();




/* Cordova Camera */
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
        
          
    };
    return options;
}

function openCamera(selection,canvas) {

    var srcType = Camera.PictureSourceType.CAMERA;
    var options = setOptions(srcType);
    // var func = createNewFileEntry;
    navigator.camera.getPicture(function cameraSuccess(imageUri) {

        displayImage(imageUri);
        faceDetect(imageUri);

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


/* Face Detect Function */
function faceDetect(imageUri) {
  ctrack.start(document.getElementById('image'));
  drawLoop();
  window.imagePath = imageUri; //declaring a global var.
}

function drawLoop() {
  drawRequest = requestAnimFrame(drawLoop);
  overlayCC.clearRect(0, 0,300,300);
  if (ctrack.getCurrentPosition()) {
    ctrack.draw(overlay);
  }
}


/* Delete saved image  */
function deleteFile(imagePath){

var fileName = imagePath.substr(imagePath.lastIndexOf("cache/") + 6); //getting file
var path = imagePath.slice(0,imagePath.lastIndexOf(fileName)); //getting path without filename

window.resolveLocalFileSystemURL(path, function(dir) {
  dir.getFile(fileName, {create:false}, function(fileEntry) {
              fileEntry.remove(function(){
                console.log('file deleted');
                  
              },function(error){
                console.log('error of' + error.code);    
                  
              },function(){
                console.log('no file exist');
                 
              });
  });
});
}


/* Move files after camera success */
function moveFile(imagePath) {
    window.resolveLocalFileSystemURL(
          imagePath,

          function(fileEntry){
                newFileUri  = cordova.file.dataDirectory;
                oldFileUri  = imagePath;
                newFileName = oldFileUri.substr(oldFileUri.lastIndexOf("cache/") + 6);
                
                window.resolveLocalFileSystemURL(newFileUri,
                        function(dirEntry) {
                            // move the file to a new directory and rename it
                            fileEntry.moveTo(dirEntry, newFileName, successCallback, errorCallback);
                        },
                        errorCallback);
          },
          errorCallback);

  function successCallback(entry) {
    console.log("New Path: " + entry.fullPath);
  }

  function errorCallback(error) {
    console.log("Error:" + error.code);
  }   

}



/* display file from internal data */
function displaySavedImage(imagePath){

  var path = cordova.file.dataDirectory;
  var fileName = "1505366034749.jpg"

    window.resolveLocalFileSystemURL(path, function(dir){
      dir.getFile(fileName, {create:false}, function(fileEntry){

        var elem = document.getElementById('imageFile');
        elem.src = fileEntry.toURL();

      },function(err){
        alert('error');

      },function(){
        alert('not found');

      });
    });
}




/* handling face detect event listener from clmtrackr.js */
document.addEventListener("clmtrackrConverged", function(event) {
  
  var position = ctrack.getCurrentPosition();
  

  alert('Face detected');
  console.log(position);
  cancelRequestAnimFrame(drawRequest);
  moveFile(imagePath);
  ctrack.reset(overlay);
}, false);


document.addEventListener("clmtrackrNotFound", function(event) {
    
    var position = ctrack.getCurrentPosition();
    
    ctrack.stop(document.getElementById('image'));
    cancelRequestAnimFrame(drawRequest);
    alert("Please try again.");
    console.log(position);
    deleteFile(imagePath);
    ctrack.reset(overlay);
  }, false);


document.addEventListener("clmtrackrLost", function(event) {
  
  var position = ctrack.getCurrentPosition();
  
  ctrack.stop(document.getElementById('image'));
  cancelRequestAnimFrame(drawRequest);
  alert("Track Lost.");
  console.log(position);
  deleteFile(imagePath);
  ctrack.reset(overlay);
}, false);