# CI/CD-ed or something

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
