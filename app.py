import json

from bottle import run, template, get, static_file, post, request, delete, put, redirect

from command import CommandChain, Command


chains = {}


@get("/static/<filepath:re:.*\.css>")
def css(filepath):
    return static_file(filepath, root="static")


@get("/static/<filepath:re:.*\.js>")
def js(filepath):
    return static_file(filepath, root="static")


@get('/')
def index():
    return template("templates/index", chains=chains.keys())


@get('/chains/<chain>')
def chain(chain):
    return template("templates/chain", chain=chain, commands=chains[chain].commands)


@post('/chains')
def chain():
    name = request.forms.get("name")
    path = request.forms.get("path")
    if name and path:
        chains[name] = CommandChain(name, path, [])
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


if __name__ == "__main__":
    try:
        with open("config.json", "r") as file:
            config = json.loads(file.read())
        print(config)
        for name, chain in config.items():
            chains[name] = CommandChain(name, chain["path"], chain["commands"])
    except:
        pass

    try:
        run(host='localhost', port=8080, reloader=True)
    except KeyboardInterrupt:
        pass

    state = {}
    for name, chain in chains.items():
        state[name] = {}
        state[name]["path"] = chain.project_path
        state[name]["commands"] = [cmd.cmd for cmd in chain.commands]

    with open("config.json", "w") as file:
        config = json.dumps(state, indent=4)
        file.write(config)

