const chainId = document.getElementById("chain-id").innerHTML;

var coll = document.getElementsByClassName("collapsible");
for (var i = 0; i < coll.length; i++) {
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

function resetCommandStatus(status) {
  var cmdElems = document.getElementsByClassName("command");
  for (var i = 0; i < cmdElems.length; i++) {
    var statusElem = cmdElems[i].getElementsByClassName("status")[0];
    var output = cmdElems[i].getElementsByClassName("content")[0];

    statusElem.classList = "status " + status;
    output.innerHTML = "";
  }
}

function runChain(chain) {
  // Collapse all output windows
  var coll = document.getElementsByClassName("collapsible");
  for (var i = 0; i < coll.length; i++) {
    if (coll[i].classList.contains("active")) {
      coll[i].classList.toggle("active");
    }
    var content = coll[i].nextElementSibling;
    content.style.maxHeight = null;
  }

  resetCommandStatus("yellow");

  // Run the command chain
  axios.post("http://localhost:1212/chains/" + chain + "/run")
  .then(function (response) {
    updateCommands(response.data.result);
  })
  .catch(function (error) {
    alert(error);
  });
}

function runFullChain(chain) {
  var status = document.getElementById(chain + "-status");
  status.classList = "status yellow";
  axios.post("http://localhost:1212/chains/" + chain + "/run")
  .then(function (response) {
    var jobs = response.data.result;
    var good = true;
    for (var i = 0; i < jobs.length; i++) {
      if (jobs[i].status < 4) {
        status.classList = "status red";
        good = false;
        break;
      }
    }
    if (good) {
      status.classList = "status green";
    }
    document.location.reload();
  })
  .catch(function (error) {
    alert(error);
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

function editCommand(commandId) {
  var button = document.getElementById("edit-" + commandId);
  var input = document.getElementById("cmd-" + commandId);

  if (button.classList.contains("green")) {
    button.classList.remove("green");
    input.setAttribute("disabled", "");

    axios.put("http://localhost:1212/chains/" + chainId + "/commands/" + commandId, {
      cmd: input.value
    })
    .then(function (response) {
      var cmdElems = document.getElementsByClassName("command");
      cmdElems[commandId].getElementsByClassName("status")[0].classList = "status";
    })
    .catch(function (error) {
      alert(error);
    });
  } else {
    button.classList.add("green");
    input.removeAttribute("disabled");
    input.focus();
    input.select();
  }
}

function removeCommand(commandId) {
  var chainId = document.getElementById("chain-id").innerHTML;
  axios.delete("http://localhost:1212/chains/" + chainId + "/commands/" + commandId)
  .then(function (response) {
    document.location.reload();
  })
  .catch(function (error) {
    alert(error);
  });
}

function runCommand(commandId) {
  // collapse the command box
  var coll = document.getElementsByClassName("collapsible");
  if (coll[commandId].classList.contains("active")) {
    coll[commandId].classList.toggle("active");
  }
  var content = coll[commandId].nextElementSibling;
  content.style.maxHeight = null;

  // reset command status to yellow
  var cmdElems = document.getElementsByClassName("command");
  var statusElem = cmdElems[commandId].getElementsByClassName("status")[0];
  var output = cmdElems[commandId].getElementsByClassName("content")[0];
  statusElem.classList = "status " + "yellow";
  output.innerHTML = "";

  var chainId = document.getElementById("chain-id").innerHTML;
  axios.post("http://localhost:1212/chains/" + chainId + "/commands/" + commandId + "/run")
  .then(function (response) {
    updateCommands(response.data.result);
    document.location.reload();
  })
  .catch(function (error) {
    alert(error);
  });
}

function createCommand() {
  axios.post("http://localhost:1212/chains/" + chainId + "/commands")
  .then(function (response) {
    document.location.reload();
  })
  .catch(function (error) {
    alert(error);
  });
}

var inputElems = document.getElementsByTagName("input");
for (var i = 0; i < inputElems.length; i++) {
  inputElems[i].onkeyup = function(e){
    if(e.keyCode == 13){
      editCommand(this.id.split('-')[1]);
    }
  }
}

if (inputElems[inputElems.length - 1].value == "") {
  editCommand(inputElems.length - 1);
}

function removeChain(chainId) {
  axios.delete("http://localhost:1212/chains/" + chainId)
  .then(function (response) {
    document.location.reload();
  })
  .catch(function (error) {
    alert(error);
  });
}
