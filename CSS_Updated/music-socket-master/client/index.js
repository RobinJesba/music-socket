let socket;

fetch(`http://${location.hostname}:8081/ip`)
  .then((response) => response.json())
  .then((data) => {
    console.log(data);
    socket = new WebSocket(`ws://${data.ip}:8081`);
    // Event handler for WebSocket connection open
    socket.onopen = () => {
      console.log("Connected to the WebSocket server");
    };
    // Event handler for receiving messages from the server
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log("receivin from server:", message);
      if (message.type === "scale") {
        updateToggle(message.isMinor);
        renderChords(message.value, message.isMinor);
      } else if (message.type === "progression") {
        renderProgression(message.value);
      }
    };
    // Event handler for WebSocket connection close
    socket.onclose = () => {
      console.log("Disconnected from the WebSocket server");
    };
  });

function sendMessage(payload) {
  socket.send(JSON.stringify(payload));
}

const buttons = document.querySelectorAll("#scales > button");

buttons.forEach((button) => {
  button.addEventListener("click", (e) => {
    const scaleToggle = document.querySelector(".switch input");
    const scale = e.target.innerText;
    sendMessage({ type: "scale", isMinor: scaleToggle.checked, value: scale });
    renderChords(scale, scaleToggle.checked);
  });
});

function updateToggle(isMinor) {
  document.querySelector(".switch input").checked = isMinor;
}

function renderChords(scale, isMinor) {
  const chordHeading = document.querySelector("#ThisChord");
  chordHeading.style.display = "block";
  if (isMinor) {
    chordHeading.textContent = scale + " Minor";
  } else {
    chordHeading.textContent = scale + " Major";
  }
  document.querySelector("#progression-container h2").style.display = "none";
  document.querySelector("#progression").innerHTML = "";
  document.querySelector("#chords-container h2").style.display = "block";
  const chords = generateChords(scale, isMinor);
  const chordsDiv = document.querySelector("#chords");
  chordsDiv.innerHTML = "";
  chords.forEach((chord) => {
    const chordBtn = document.createElement("button");
    chordBtn.innerText = chord;
    chordBtn.addEventListener("click", (e) => {
      renderProgression(chord);
      sendMessage({ type: "progression", value: chord });
    });
    chordsDiv.appendChild(chordBtn);
  });
}

function renderProgression(chord) {
  const progressionDiv = document.querySelector("#progression");
  document.querySelector("#progression-container h2").style.display = "block";
  const progressionBtn = document.createElement("button");
  progressionBtn.innerText = chord;
  progressionDiv.appendChild(progressionBtn);
}

window.generateChords = (key, isMinorScale) => {
  const chords = [];
  const noteOrder = [
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B",
  ];
  const keyIndex = noteOrder.indexOf(key);
  const minorChordTypes = ["min", "dim", "maj", "min", "min", "maj", "maj"];
  const minorIntervals = [0, 2, 3, 5, 7, 8, 10];
  const majorChordTypes = ["maj", "min", "min", "maj", "maj", "min", "dim"];
  const majorIntervals = [0, 2, 4, 5, 7, 9, 11];

  // Object to map keys with flats to their corresponding index in the noteOrder array
  const flatKeys = {
    Ab: 8,
    Bb: 10,
    Db: 1,
    Eb: 3,
    Gb: 6,
  };

  // Check if the key is a flat key, and use the corresponding index if it is
  const useFlatKey = flatKeys[key] !== undefined;
  const keyIndexOffset = useFlatKey ? flatKeys[key] : keyIndex;

  for (let i = 0; i < 7; i++) {
    const rootNote =
      noteOrder[
        (keyIndexOffset +
          (isMinorScale ? minorIntervals[i] : majorIntervals[i])) %
          12
      ];
    const chordType = isMinorScale ? minorChordTypes[i] : majorChordTypes[i];
    const chord = rootNote + chordType;
    chords.push(chord);
  }
  return chords;
};
