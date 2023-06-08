//These functions will give a timer to the flasher message, giving
//the user time to read the message before it goes away.
setTimeout(function () {
    $("#flash-msg").fadeOut("slow");
  }, 3000);
  
  setTimeout(function () {
    $("#success").fadeOut("slow");
  }, 3000);
  
  setTimeout(function () {
    $("#error").fadeOut("slow");
  }, 3000);

  