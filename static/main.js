function onLoad() {
    var socket = io.connect("http://127.0.0.1:5000");
    socket.onconnect(() => {
        socket.emit("connect");
    });

    socket.on("startSelect", function(filmInfo) {
        document.getElementById("page3").remove();

        var p4instruct = document.createElement("h3");
        p4instruct.id = "p4instruct";
        var p4instructTextNode = document.createTextNode("Now we're going to give you some movies! Tell us if you'd want to watch it or not.");
        p4instruct.appendChild(p4instructTextNode);
        document.getElementById("page4").appendChild(p4instruct);

        var p4movieCard = document.createElement("div");

        var p4title = document.createElement("h3");
        p4title.id = "p4title";
        var p4titleTextNode = document.createTextNode(filmInfo["title"]);
        p4title.appendChild(p4titleTextNode);
        p4movieCard.appendChild(p4title);

        var p4descript = document.createElement("p");
        p4descript.id = "p4descript";
        var p4descriptTextNode = document.createTextNode(filmInfo["overview"]);
        p4descript.appendChild(p4descriptTextNode);
        p4movieCard.appendChild(p4descript);

        var p4rating = document.createElement("h4");
        p4rating.id = "p4rating";
        var p4ratingTextNode = document.createTextNode(filmInfo["rating"]);
        p4rating.appendChild(p4ratingTextNode);
        p4movieCard.appendChild(p4rating);

        var p4poster = document.createElement("img");
        p4poster.src = "https://www.themoviedb.org/t/p/w600_and_h900_bestv2/" + filmInfo["poster_path"];
        p4movieCard.appendChild(p4poster);

        document.getElementById("page4").appendChild(p4movieCard);
    });

    socket.on("chooseDifferentGenres", () => {
        alert("No movies available for this genre combination.");
    });

    socket.on("addMoreGenres", () => {
        alert("Please add at least one genre");
    });

    socket.on("updateGenres", function(genres) {
        for (var i = 0; i < genres.length; i++) {
            document.getElementById("p3checkbox" + genres[i]).checked = true;
        }
    });

    socket.on("switchPageThree", function(genres) {
        document.getElementById("page2").remove();

        var p3title = document.createElement("h3");
        p3title.id = "p3title";
        var p3titleTextNode = document.createTextNode("Alright, let's start by choosing the genre(s)! Only hit Submit once everyone's agreed on which genre/genre combo to watch.");
        p3title.appendChild(p3titleTextNode);
        document.getElementById("page3").appendChild(p3title);

        var p3checkboxGroup = document.createElement("div");
        p3checkboxGroup.id = "p3checkboxGroup";
        for (var i = 0; i < 19; i++) {
            var p3checkbox = document.createElement("input");
            p3checkbox.type = "checkbox";
            p3checkbox.id = "p3checkbox" + i.toString();
            p3checkbox.addEventListener("click", () => {
                var checked = [];
                for (var i = 0; i < 19; i++) {
                    if (document.getElementById("p3checkbox" + i.toString()).checked) {
                        checked.push(i);
                        document.getElementById("p3checkbox" + i.toString()).checked = false;
                    }
                }
                socket.emit("genreSelect", checked);
            });
            p3checkboxGroup.appendChild(p3checkbox)

            var p3label = document.createElement("label");
            p3label.for = "p3checkbox" + i.toString();
            var p3labelTextNode = document.createTextNode(genres["genres"][i]["name"]);
            p3label.appendChild(p3labelTextNode);
            p3checkboxGroup.appendChild(p3label);
        }
        var p3button = document.createElement("button");
        p3button.id = "p3button";
        var p3buttonTextNode = document.createTextNode("Submit Genres");
        p3button.appendChild(p3buttonTextNode);
        p3button.addEventListener("click", () => {
            socket.emit("page4");
        });
        document.getElementById("page3").appendChild(p3checkboxGroup);
        document.getElementById("page3").appendChild(p3button);
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
        p2start.addEventListener("click", () => {
            socket.emit("page3");
        });
        var p2startTextNode = document.createTextNode("Start Choosing");
        p2start.appendChild(p2startTextNode);

        document.getElementById("page2").appendChild(p2title);
        document.getElementById("page2").appendChild(p2start);
    });
};