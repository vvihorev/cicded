# 👴🏼 CI/CD-ed 

Get a barebones UI in your local browser. Run deployment pipelines specified as series of bash commands on the server.

![image](https://github.com/vvihorev/cicded/assets/33204359/0ac8d6ed-be64-45b8-bd41-17d06ed8a4c7)

Run on a server with 
```
nohup python3 cicded.py &
```

Forward a port to access the WebUI from a local browser
```
ssh -L 1212:localhost:1212 user@host
```

Create command chains in the WebUI, or specify them in `config.json`

Run a chain by calling an endpoint
```
curl -X POST http://localhost:1212/chains/test_repo/run | python -m json.tool
```

# Planned Features

- [ ] Securing the application
- [ ] Blocking command execution until triggered manually
- [ ] Alerting on command failures
- [ ] Edit commands as lines in a text area
