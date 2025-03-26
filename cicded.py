from threading import Thread
import json

from bottle import DictProperty, FormsDict, run, template, get, static_file, post, request, delete, put, redirect

from command import CommandChain, Command, CommandStatus


chains = {}


@get("/static/<filepath:re:.*\\.css>")
def css(filepath):
    return static_file(filepath, root="static")


@get("/static/<filepath:re:.*\\.js>")
def js(filepath):
    return static_file(filepath, root="static")


@get("/<filepath:re:.*\\.ico>")
def img(filepath):
    return static_file(filepath, root="static")


@get('/')
def index():
    return template("templates/index", chains=chains)


@get('/chains/<chain>')
def chain(chain):
    return template("templates/chain", chain=chain, commands=chains[chain].commands, project_path=chains[chain].project_path)


@post('/chains')
def create_chain():
    assert isinstance(request.forms, FormsDict)
    name = request.forms.get("name")
    path = request.forms.get("path")
    if name and path:
        chains[name] = CommandChain(name, path, [])
    redirect('/')


@delete('/chains/<chain>')
def delete_chain(chain):
    chains.pop(chain)
    redirect('/')


@put('/chains/<chain>')
def update_chain(chain):
    assert isinstance(request.forms, FormsDict)
    name = request.forms.get("name")
    path = request.forms.get("path")
    chains[chain].name = name
    chains[chain].project_path = path
    redirect('/')


@post('/chains/<chain>/run')
def run_chain(chain):
    chain = chains[chain]
    chain.run()
    return {"result": chain.get_output()}


@post('/chains/<chain>/commands')
def create_command(chain):
    chain = chains[chain]
    chain.commands.append(Command(chain.project_path, ""))
    return {"result": "ok"}


@put('/chains/<chain>/commands/<command>')
def update_command(chain, command):
    chain = chains[chain]
    body = json.loads(request.body.read())
    chain.commands[int(command)] = Command(chain.project_path, body["cmd"])
    return {"result": "ok"}


@delete('/chains/<chain>/commands/<command>')
def delete_command(chain, command):
    chain = chains[chain]
    chain.commands.pop(int(command))
    return {"result": "ok"}


@post('/chains/<chain>/commands/<command>/run')
def run_command(chain, command):
    chain = chains[chain]
    return {"result": chain.run_command(int(command))}


if __name__ == "__main__":
    try:
        with open("config.json", "r") as file:
            config = json.loads(file.read())
        for name, chain in config.items():
            saved_commands = list(chain["commands"].keys())
            chains[name] = CommandChain(name, chain["path"], saved_commands)
            for command in chains[name].commands:
                saved_command = chain["commands"][command.cmd]
                command.status = CommandStatus(saved_command["status"])
                command.output = saved_command["output"]
            chains[name].last_run_datetime = chain["last_run"]
            chains[name].status = CommandStatus(chain["status"])
    except FileNotFoundError:
        print("config.json not found, a new one will be created")

    run(host='localhost', port=1212)

    state = {}
    for name, chain in chains.items():
        state[name] = {}
        state[name]["path"] = chain.project_path
        state[name]["status"] = chain.status.value
        state[name]["commands"] = {}
        for command in chain.commands:
            state[name]["commands"][command.cmd] = {
                "status": command.status.value,
                "output": command.output
            }
        state[name]["last_run"] = chain.last_run_datetime

    with open("config.json", "w") as file:
        config = json.dumps(state, indent=4)
        file.write(config)

