function onLoad() {
    var socket = io.connect("http://127.0.0.1:5000");
    socket.onconnect(() => {
        socket.emit("connect");
    });

    socket.on("startRanking", function(films) {
        localStorage.setItem("rankedFilms", films);

        document.getElementById("page4").remove();

        var p5title = document.createElement("h3");
        p5title.id = "p5title";
        p5title.innerText = "Here are the movies you\'re interested in watching. Rank them from 1 to " + films.length + " in order of preference.";
        document.getElementById("page5").appendChild(p5title);

        var p5rankingGroup = document.createElement("div");
        p5rankingGroup.id = "p5rankingGroup";

        for (var i = 0; i < films.length; i++) {
            var p5rankinput = document.createElement("input");
            p5rankinput.id = "p5rankinput" + i;
            p5rankinput.type = "text";

            var p5ranklabel = document.createElement("label");
            p5ranklabel.id = "p5ranklabel" + i;
            p5ranklabel.innerText = films[i];
            p5ranklabel.for = "p5rankinput" + i;

            p5rankingGroup.appendChild(p5ranklabel);
            p5rankingGroup.appendChild(p5rankinput);
        }

        document.getElementById("page5").appendChild(p5rankingGroup);

        var p5submit = document.createElement("button");
        p5submit.id = "p5submit";
        p5submit.innerText = "Submit Rankings";
        p5submit.addEventListener("click", () => {
            var films = localStorage.getItem("rankedFilms").split(',');
            var scores = [];
            for (var i = 0; i < films.length; i++) {
                var input = document.getElementById("p5rankinput" + i).value;
                if (isNaN(input) || input > 3 || input < 1) {
                    alert("Please make sure that all numbers inputted are between 1 and " + films.length);
                    return;
                } else {
                    scores.push(input);
                }
            }
            console.log(scores);
            var users = localStorage.getItem("users");
            var room = localStorage.getItem("room");
            socket.emit("sendRanking", {"films": films, "scores": scores, "users": users, "room": room});
        });

        document.getElementById("page5").appendChild(p5submit);
    });

    socket.on("waitForVote", () => {
        document.getElementById("p4done").innerText = parseInt(document.getElementById("p4done").innerText) + 1;
    });

    socket.on("nextMovie", function(filmInfo) {
        localStorage.setItem("title", filmInfo["title"]);
        localStorage.setItem("id", filmInfo["id"]);
        localStorage.setItem("orderNumber", filmInfo["orderNumber"]);

        document.getElementById("p4title").innerText = filmInfo["title"];
        document.getElementById("p4descript").innerText = filmInfo["overview"];
        document.getElementById("p4rating").innerText = filmInfo["rating"];
        document.getElementById("p4poster").src = "https://www.themoviedb.org/t/p/w600_and_h900_bestv2/" + filmInfo["poster_path"];

        document.getElementById("p4users").innerText = localStorage.getItem("users");
        document.getElementById("p4done").innerText = 0;

        document.getElementById("p4watch").style.visibility = "visible";
        document.getElementById("p4not").style.visibility = "visible";
    });

    socket.on("leaveUser", function(data) {
        if (data["page"] === 2)
        {
            document.getElementById("p2room").innerHTML = "Users in room: " + 0;
        }
        location.reload();
    });

    socket.on("newUser", function(users) {
        document.getElementById("p2room").innerHTML = "Users in room: " + users;
    });

    socket.on("startSelect", function(filmInfo) {
        localStorage.setItem("title", filmInfo["title"]);
        localStorage.setItem("id", filmInfo["id"]);
        localStorage.setItem("room", filmInfo["room"]);
        localStorage.setItem("orderNumber", 0);

        document.getElementById("page3").remove();

        document.getElementById("page4").className = "mt-auto mr-auto mb-auto w-5/6 h-2/3 bg-indigo-400 rounded-tr-lg rounded-tl-lg rounded-br-lg rounded-bl-lg shadow align-middle flex flex-col justify-center items-center";

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
        p4poster.id = "p4poster";
        p4poster.className = "w-16 h-48";
        p4poster.src = "https://www.themoviedb.org/t/p/w600_and_h900_bestv2/" + filmInfo["poster_path"];
        p4movieCard.appendChild(p4poster);

        var p4watch = document.createElement("button");
        p4watch.id = "p4watch";
        p4watch.innerHTML = "<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' fill='currentColor' class='bi bi-camera-reels-fill' viewBox='0 0 16 16'><path d='M6 3a3 3 0 1 1-6 0 3 3 0 0 1 6 0z'/><path d='M9 6a3 3 0 1 1 0-6 3 3 0 0 1 0 6z'/><path d='M9 6h.5a2 2 0 0 1 1.983 1.738l3.11-1.382A1 1 0 0 1 16 7.269v7.462a1 1 0 0 1-1.406.913l-3.111-1.382A2 2 0 0 1 9.5 16H2a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h7z'/></svg>Watch";
        p4watch.addEventListener("click", () => {
            document.getElementById("p4title").innerText = "Waiting for everyone to vote...";
            //document.getElementById("p4done").innerText = parseInt(document.getElementById("p4done").innerText) + 1;
            document.getElementById("p4watch").style.visibility = "hidden";
            document.getElementById("p4not").style.visibility = "hidden";
            var users = parseInt(document.getElementById("p4users").innerText);
            var done = parseInt(document.getElementById("p4done").innerText) + 1;
            socket.emit("postVote", {"vote": true, "users": users, "done": done, "room": localStorage.getItem("room"), "title": localStorage.getItem("title"), "id": localStorage.getItem("id"), "orderNumber": localStorage.getItem("orderNumber"), "genres": localStorage.getItem("genres")});
        });

        var p4not = document.createElement("button");
        p4not.id = "p4not";
        p4not.innerHTML = "<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' fill='currentColor' class='bi bi-x-lg' viewBox='0 0 16 16'><path d='M1.293 1.293a1 1 0 0 1 1.414 0L8 6.586l5.293-5.293a1 1 0 1 1 1.414 1.414L9.414 8l5.293 5.293a1 1 0 0 1-1.414 1.414L8 9.414l-5.293 5.293a1 1 0 0 1-1.414-1.414L6.586 8 1.293 2.707a1 1 0 0 1 0-1.414z'/></svg>Not";
        p4not.addEventListener("click", () => {
            document.getElementById("p4title").innerText = "Waiting for everyone to vote...";
            //document.getElementById("p4done").innerText = parseInt(document.getElementById("p4done").innerText) + 1;
            document.getElementById("p4watch").style.visibility = "hidden";
            document.getElementById("p4not").style.visibility = "hidden";
            var users = parseInt(document.getElementById("p4users").innerText);
            var done = parseInt(document.getElementById("p4done").innerText) + 1;
            socket.emit("postVote", {"vote": false, "users": users, "done": done, "room": localStorage.getItem("room"), "title": localStorage.getItem("title"), "id": localStorage.getItem("id"), "orderNumber": localStorage.getItem("orderNumber"), "genres": localStorage.getItem("genres")});
        });

        var p4userInfo = document.createElement("div");
        p4userInfo.id = "p4userInfo";
        var p4users = document.createElement("p");
        p4users.id = "p4users";
        p4users.innerText = filmInfo["users"];
        localStorage.setItem("users", filmInfo["users"]);
        var p4done = document.createElement("p");
        p4done.id = "p4done";
        p4done.innerText = "0";

        p4userInfo.appendChild(p4users);
        p4userInfo.appendChild(p4done);

        document.getElementById("page4").appendChild(p4movieCard);
        document.getElementById("page4").appendChild(p4watch);
        document.getElementById("page4").appendChild(p4not);
        document.getElementById("page4").appendChild(p4userInfo);
    });

    socket.on("chooseDifferentGenres", () => {
        alert("No movies available for this genre combination.");
    });

    socket.on("addMoreGenres", () => {
        alert("Please add at least one genre");
    });

    socket.on("updateGenres", function(data) {
        var genres = data["genres"];
        var ids = data["ids"];
        localStorage.setItem("genres", ids);
        for (var i = 0; i < genres.length; i++) {
            document.getElementById("p3checkbox" + genres[i]).checked = true;
        }
    });

    socket.on("switchPageThree", function(genres) {
        document.getElementById("page2").remove();

        document.getElementById("page3").className = "mt-auto mr-auto mb-auto w-5/6 h-2/3 bg-indigo-400 rounded-tr-lg rounded-tl-lg rounded-br-lg rounded-bl-lg shadow align-middle flex flex-col justify-center items-center";

        var p3title = document.createElement("h3");
        p3title.id = "p3title";
        p3title.className = "text-center";
        var p3titleTextNode = document.createTextNode("Alright, let's start by choosing the genre(s)! Only hit Submit once everyone's agreed on which genre/genre combo to watch. Only whoever chose the last genre may submit.");
        p3title.appendChild(p3titleTextNode);
        document.getElementById("page3").appendChild(p3title);

        var p3checkboxGroup = document.createElement("div");
        p3checkboxGroup.id = "p3checkboxGroup";
        for (var i = 0; i < 19; i++) {
            var p3checkbox = document.createElement("input");
            p3checkbox.type = "checkbox";
            p3checkbox.id = "p3checkbox" + i.toString();
            p3checkbox.className = "form-checkbox";
            p3checkbox.addEventListener("click", () => {
                var checked = [];
                for (var i = 0; i < 19; i++) {
                    if (document.getElementById("p3checkbox" + i.toString()).checked) {
                        checked.push(i);
                        document.getElementById("p3checkbox" + i.toString()).checked = false;
                    }
                }
                document.getElementById("p3button").style.visibility = "visible";
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
        p3button.className = "text-center bg-red-300 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-full";
        p3button.style.visibility = "hidden";
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

        var leaveButton = document.createElement("button");
        leaveButton.id = "leaveButton";
        leaveButton.className = "text-center bg-blue-300 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-full";
        var leaveButtonTextNode = document.createTextNode("Close Room");
        leaveButton.appendChild(leaveButtonTextNode);
        leaveButton.addEventListener("click", () => {
            var page;
            if (!!document.getElementById("page2")) {
                page = 2;
            } else {
                page = 3;
            }
            socket.emit("disconnected", {"groupCode": groupCode, "page": page});
        });
        document.getElementById("leave").appendChild(leaveButton);
        document.getElementById("page2").className = "mt-auto mb-auto mr-auto w-5/6 h-2/3 bg-indigo-400 rounded-tr-lg rounded-tl-lg rounded-br-lg rounded-bl-lg shadow align-middle flex flex-col justify-center items-center";

        var p2title = document.createElement("h3");
        p2title.id = "p2title";
        var p2titleTextNode = document.createTextNode("Great, your group code is " + groupCode + "! Please wait for everyone to join before starting.");
        p2title.appendChild(p2titleTextNode);

        var p2room = document.createElement("p");
        p2room.id = "p2room";
        /*var p2roomTextNode = document.createTextNode("Users in room: " + people);
        p2title.appendChild(p2roomTextNode);*/

        var p2start = document.createElement("button");
        p2start.id = "p2start";
        p2start.className = "text-center bg-red-300 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-full";
        p2start.addEventListener("click", () => {
            var text = document.getElementById("p2room").innerText;
            socket.emit("page3", text.replace("Users in room: ", ""));
        });
        var p2startTextNode = document.createTextNode("Start Choosing");
        p2start.appendChild(p2startTextNode);

        document.getElementById("page2").appendChild(p2title);
        document.getElementById("page2").appendChild(p2room);
        document.getElementById("page2").appendChild(document.createElement("br"));
        document.getElementById("page2").appendChild(document.createElement("br"));
        document.getElementById("page2").appendChild(p2start);
    });
};