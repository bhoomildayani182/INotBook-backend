const express = require("express");
const router = express.Router();
const fetchuser = require("../middleware/fetchuser");
const Note = require('../models/Notes');
const { body, validationResult } = require("express-validator");

//Route 1 : GET all the notes using : GET/api/notes/getuser. Login required
router.get("/fetchallnotes", fetchuser, async (req, res) => {
    try {
    const notes = await Note.find({ user: req.user.id });
    res.json(notes);
    } catch (error){
        console.error(error.message);
        res.status(500).send("Internal Server Error")
      }
});

//Route 2 : Add a new notes using : POST/api/notes/addnote. Login required
router.post(
  "/addnote",
  fetchuser,
  [
    body("title", "Enter a valid Title").isLength({ min: 3 }),
    body("description", "description must be atleast 5 characters ").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    try {
      const { title, description, tag } = req.body;
      //IF there are errors, return bad request and the errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const note = new Note({
        title,
        description,
        tag,
        user: req.user.id,
      });
      const savedNote = await note.save();

      res.json(savedNote);
    } catch (error){
        console.error(error.message);
        res.status(500).send("Internal Server Error")
      }
  }
);

//Route 3 : Updating existing Notes using : POST/api/notes/addnote. Login required
router.put(
  "/updatenote/:id",
  fetchuser,async (req, res) => {
    const { title, description, tag } = req.body;
    //create new notes object
    const newNote={};
    if(title){newNote.title=title};      
    if(description){newNote.description=description};
    if(tag){newNote.tag=tag};

    //Find the note to be updaate and update it
    let note = await Note.findById(req.params.id);
    if(!note){
      return res.status(404).send("Note Found This Id's")
    }

    if(note.user.toString() != req.user.id){
      return res.status(401).send("Not Allowed")
    }

    note = await Note.findByIdAndUpdate(req.params.id, {$set : newNote}, {new:true})
    res.json({note});
  } );

module.exports = router;