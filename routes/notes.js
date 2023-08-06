// express.Router class to create modular, mountable route handlers
const notes = require("express").Router();
// Helper method for generating unique ids
const { v4: uuidv4 } = require("uuid");
const {
  readAndAppend,
  readFromFile,
  writeToFile,
} = require("../helpers/fsUtils");

// GET Route for retrieving all the notes
notes.get("/", (req, res) =>
  readFromFile("./db/db.json").then((data) => res.json(JSON.parse(data)))
);
// GET Route for a specific note
notes.get("/:notes_id", (req, res) => {
  const noteId = req.params.notes_id;
  // readfromfile function in fsUtils.js file
  readFromFile("./db/db.json")
    .then((data) => JSON.parse(data))
    .then((json) => {
      //filters out matching note
      const result = json.filter((note) => note.note_id === noteId);
      return result.length > 0
        ? res.json(result)
        : res.json("No note with that ID");
    });
});
// Delete note with specific id
notes.delete("/:notes_id", (req, res) => {
  const noteId = req.params.notes_id;
  readFromFile("./db/db.json")
    .then((data) => JSON.parse(data))
    .then((json) => {
      // Make a new array of all notes except the one with the ID provided in the URL
      const result = json.filter((note) => note.note_id !== noteId);

      // Save that array to the filesystem
      writeToFile("./db/db.json", result);

      // Respond to the DELETE request
      res.json(`Item ${noteId} has been deleted 🗑️`);
    });
});

// POST Route for submitting notes
notes.post("/", (req, res) => {
  // Destructuring assignment for the items in req.body
  const { title, text } = req.body;

  // If all the required properties are present
  if (title && text) {
    // Variable for the object we will save
    const newNote = {
      title,
      text,
      note_id: uuidv4(),
    };
    // read all notes and append new note to db.json file
    readAndAppend(newNote, "./db/db.json");

    const response = {
      status: "success",
      body: newNote,
    };

    res.status(201).json(response);
  } else {
    res.status(500).json("Error in adding note");
  }
});

module.exports = notes;
