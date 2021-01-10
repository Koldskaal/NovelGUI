import { PythonShell, Options} from "python-shell"

let pyshell: PythonShell;

function searchPython(query : string) {
  const pp = {"command": "search", 
  "data": {
    "query": query
  }};
  const options : Options = {
    mode: 'json',
    args: [JSON.stringify(pp)]
  };
  pyshell = new PythonShell('./tryout.py', options);

  pyshell.on('message', function (message) {
    // received a message sent from the Python script (a simple "print" statement)
    console.log(message);
    pyshell.send({"confirmed": 1})
  });

}

function sendCommand() {
  pyshell.send({"command": "FIGHT!", "args": ["as", 1, 23, "penis"]})
}

function quitCommand() {
  pyshell.send({"quit": 0})
}

export { searchPython, sendCommand, quitCommand }