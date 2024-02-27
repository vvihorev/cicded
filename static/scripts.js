var coll = document.getElementsByClassName("collapsible");
var i;

for (i = 0; i < coll.length; i++) {
  coll[i].addEventListener("click", function() {
    this.classList.toggle("active");
    var content = this.nextElementSibling;
    if (content.style.maxHeight){
      content.style.maxHeight = null;
    } else {
      content.style.maxHeight = content.scrollHeight + "px";
    }
  });
}

function runChain(chain) {
  // Collapse all output windows
  var coll = document.getElementsByClassName("collapsible");
  for (var i = 0; i < coll.length; i++) {
    var content = coll[i].nextElementSibling;
    content.style.maxHeight = null;
  }

  // Set status of all jobs to pending
  var cmdElems = document.getElementsByClassName("command");
  for (var i = 0; i < cmdElems.length; i++) {
    var status = cmdElems[i].getElementsByClassName("status")[0];
    var output = cmdElems[i].getElementsByClassName("content")[0];

    status.classList = "status yellow";
    output.innerHTML = "";
  }

  // Run the command chain
  axios.post("http://localhost:8080/chains/" + chain + "/run")
  .then(function (response) {
    updateCommands(response.data.result);
  })
  .catch(function (error) {
    console.error(error);
  });
}

function updateCommands(commands) {
  var cmdElems = document.getElementsByClassName("command");

  for (var i = 0; i < commands.length; i++) {
    var status = cmdElems[i].getElementsByClassName("status")[0];
    var output = cmdElems[i].getElementsByClassName("content")[0];

    if (commands[i].status == "2") {
      status.classList = "status yellow";
    } else if (commands[i].status == "3") {
      status.classList = "status red";
      output.innerHTML = "<pre>" + commands[i].output + "</pre>";
    } else if (commands[i].status == "4") {
      status.classList = "status green";
      output.innerHTML = "<pre>" + commands[i].output + "</pre>";
    } else {
      status.classList = "status";
    }

  }
}
