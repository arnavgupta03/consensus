function onLoad() {
    var socket = io.connect("http://127.0.0.1:5000");
    socket.onconnect(function() {
        socket.emit("connect");
    });

    socket.on("switchPageThree", function(genres) {
        document.getElementById("page2").remove();

        var p3title = document.createElement("h3");
        p3title.id = "p3title";
        var p3titleTextNode = document.createTextNode("Alright, let's start by choosing the genre(s)!");
        p3title.appendChild(p3titleTextNode);
        document.getElementById("page3").appendChild(p3title);

        var p3checkboxGroup = document.createElement("div");
        p3checkboxGroup.id = "p3checkboxGroup";
        for (var i = 0; i < 18; i++) {
            var p3checkbox = document.createElement("input");
            p3checkbox.type = "checkbox";
            p3checkbox.id = "p3checkbox" + i.toString();
            p3checkboxGroup.appendChild(p3checkbox)

            var p3label = document.createElement("label");
            p3label.for = "p3checkbox" + i.toString();
            var p3labelTextNode = document.createTextNode(genres["genres"][i]["name"]);
            p3label.appendChild(p3labelTextNode);
            p3checkboxGroup.appendChild(p3label);

            //TODO: add onfocus to checkboxes to make sure they actually send the messages
        }
        document.getElementById("page3").appendChild(p3checkboxGroup);
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
        p2start.addEventListener("click", function() {
            socket.emit("page3");
        });
        var p2startTextNode = document.createTextNode("Start Choosing");
        p2start.appendChild(p2startTextNode);

        document.getElementById("page2").appendChild(p2title);
        document.getElementById("page2").appendChild(p2start);
    });
};