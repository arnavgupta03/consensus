function onLoad() {
    var socket = io.connect("http://127.0.0.1:5000");
    socket.on("connect", function() {
        socket.emit("connect");
    });

    document.getElementById("p1joinCreateGroup").addEventListener("click", function() {
        const groupCode = document.getElementById("p1groupCode").value;
        socket.emit("join", groupCode);
        document.getElementById("page1").remove();
        var p2title = document.createElement("h3");
        p2title.id = "p2title";
        var p2titleTextNode = document.createTextNode("Great, your group code is " + groupCode + "! Please wait for everyone to join before starting.");
        p2title.appendChild(p2titleTextNode);
        var p2start = document.createElement("button");
        p2start.id = "p2start";
        var p2startTextNode = document.createTextNode("Start Choosing");
        p2start.appendChild(p2startTextNode);
        document.getElementById("page2").appendChild(p2title);
        document.getElementById("page2").appendChild(p2start);
    });
};