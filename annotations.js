
import express from 'express'
//importing and using CORS for security purposes - prevents domain from making requests to other domains
import cors from 'cors'
//creates new app using express middleware
const app = express();
//makes our app use CORS
app.use(cors())
//makes our app parse the request body to JSON by default
app.use(express.json())

//below is the storage that is given to us from express. we are setting up three variables - title, notes and items
app.locals.title = 'Trapper Keeper';
app.locals.notes = [];
app.locals.items = [];

//this is our get request - we are passing the correct endpoint, and then the request/response
app.get('/api/v1/notes', (request, response) => {
  //lines 20-21 are simple variable declarations
  const notes = app.locals.notes;
  const items = app.locals.items;
  //in our response, we send back a 200 status code, then we do the shorthand for setting the response type as application/json and send back an object with our notes and items from app.locals
  return response.status(200).json({ notes, items })
});

//this posts or adds a new note, again providing the endpoint and the request/response
app.post('/api/v1/notes', (request, response) => {
  //destructuring the id, title and items from the request body
  const { id, title, items } = request.body;

  //if there is no title in the request body
  if (!title) {
    // send back a response with a 422 status code and a message indicating that no title was provided
    return response.status(422).json('No note title provided');
  } else {
    // if there is a title provided in the request body, add the id and title to the notes in app.locals
    app.locals.notes.push({ id, title })
    // add the items to the items in app.locals
    app.locals.items.push(...items)
    //return a response with a 201 status code indicating succes and provide a JSON version of the id, title and items added
    return response.status(201).json({ id, title, items });
  }
});

//this is for getting a specific note based on the id provided in the url
app.get('/api/v1/notes/:id', (request, response) => {
  //destructuring id from the params property of the request
  const { id } = request.params;
  //declaring variable of note, which is assigned to value of the find function from the notes variable in app.locals
  const note = app.locals.notes.find(note => note.id == id);
  //decrlaring variable of items, which is assigned to value of filter function for items that match the id from the request
  const items = app.locals.items.filter(item => item.noteID == id)

  //if note is not undefined
  if (note) {
    //return the response with a status code of 200 and the note with its associated items
    return response.status(200).json({ note, items })
  } else {
    //otherwise, return a response with a 404 status code and a message that the note does not exist
    return response.status(404).json('That note does not exist!')
  }
});

//this is for deleting a specific note based on the id provided in the URL
app.delete('/api/v1/notes/:id', (request, response) => {
  //destructure the id from the request params
  const { id } = request.params;
  //declaring the new variables, which is all the notes/items that do not match the id passed in
  const updatedNotes = app.locals.notes.filter(note => note.id != id)
  const updatedItems = app.locals.items.filter(item => item.noteID != id)

  //this check confirms that the note has been deleted successfully
  if (updatedNotes.length !== app.locals.notes.length) {
    //reassigning app.locals.notes/items to the newly filtered notes and items from lines 69-70
    app.locals.notes = updatedNotes
    app.locals.items = updatedItems
    //return a response with a 202 status code and a message that the correct note has been deleted
    return response.status(202).json(`Note ${id} has been deleted successfully`)
  } else {
    //if there is nothing removed from the filters on 69-70, return a resposne with a 404 status code and a message that the note does not exist
    return response.status(404).json('That note does not exist, nothing was deleted')
  }
});

//Edit a specific note based on the id provided
app.put('/api/v1/notes/:id', (request, response) => {
  //detructure the id from request params
  const { id } = request.params;
  //destructure the title and items from request body
  const { title, items } = request.body
  //assign note to the evaluation of finding the note that matches the id provided
  const note = app.locals.notes.find(note => note.id == id);
  //if there is a note that is found
  if (note) {
    //go through all the notes, and adjust the title for the id that matches the note.id
    const updatedNotes = app.locals.notes.map(note => {
      if (note.id == id) {
        note.title = title
      }
      return note
      
    })
    //reassigns notes to the updatedNotes
    app.locals.notes = updatedNotes
    //go through all the items and return only those that don't match the id provided
    const cleanedItems = app.locals.items.filter(item => item.noteID != id)
    //reassign items to the filtered items and the added items from the request body
    app.locals.items = [...cleanedItems, ...items]
    //return a status code of 202 and a message that the specific note has been updated
    return response.status(202).json(`Note ${id} has been updated`)
  } else {
    //otherwise, if there is no matching note, return a 404 status code and a message indicating that there is no note
    return response.status(404).json('That note does not exist, nothing was edited')
  }
});

export default app