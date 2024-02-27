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
    var status = cmdElems[i].getElementsByClassName("status")[0];
    var output = cmdElems[i].getElementsByClassName("content")[0];

    status.classList = "status " + status;
    output.innerHTML = "";
  }
}

function runChain(chain) {
  // Collapse all output windows
  var coll = document.getElementsByClassName("collapsible");
  for (var i = 0; i < coll.length; i++) {
    var content = coll[i].nextElementSibling;
    content.style.maxHeight = null;
  }

  resetCommandStatus("yellow");

  // Run the command chain
  axios.post("http://localhost:8080/chains/" + chain + "/run")
  .then(function (response) {
    updateCommands(response.data.result);
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

    axios.put("http://localhost:8080/chains/" + chainId + "/commands/" + commandId, {
      cmd: input.value
    })
    .then(function (response) {
      console.log(response);
      var cmdElems = document.getElementsByClassName("command");
      cmdElems[commandId].getElementsByClassName("status")[0].classList = "status";
    })
    .catch(function (error) {
      alert(error);
    });
  } else {
    button.classList.add("green");
    input.removeAttribute("disabled");
  }
}

function removeCommand(commandId) {
  var chainId = document.getElementById("chain-id").innerHTML;
  axios.delete("http://localhost:8080/chains/" + chainId + "/commands/" + commandId)
  .then(function (response) {
    console.log(response);
    document.location.reload();
  })
  .catch(function (error) {
    alert(error);
  });
}

function createCommand() {
  axios.post("http://localhost:8080/chains/" + chainId + "/commands")
  .then(function (response) {
    console.log(response);
    document.location.reload();
  })
  .catch(function (error) {
    alert(error);
  });
}

function createChain(event) {
  console.log(event.target.elements);
  // axios.post("http://localhost:8080/chains/" + chainId + "/commands")
  // .then(function (response) {
  //   console.log(response);
  //   document.location.reload();
  // })
  // .catch(function (error) {
  //   alert(error);
  // });
}
