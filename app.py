import json

from bottle import run, template, get, static_file, post, request

from command import CommandChain, Command


chains = {
    "minimal_config": CommandChain("minimal_config",
                                   "/home/vvihorev/code/minimal_config",
                                   ["git status", "git lag", "git log"]),
}

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


@post('/chains/<chain>/run')
def run_chain(chain):
    chain = chains[chain]
    chain.run()
    return {"result": chain.get_output()}


@post('/chains/<chain>/commands/<command>')
def update_command(chain, command):
    chain = chains[chain]
    body = json.loads(request.body.read())
    chain.commands[int(command)] = Command(chain.project_path, body["cmd"])
    return {"result": "ok"}


run(host='localhost', port=8080, reloader=True)
