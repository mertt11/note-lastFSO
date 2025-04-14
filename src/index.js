require("dotenv").config()
const express = require("express")
const app = express()
app.use(express.json())
app.use(express.static("dist"))
const Note = require("./models/note")

let notes = []

const requestLogger = (request, response, next) => {
  console.log("Method:", request.method)
  console.log("Path:  ", request.path)
  console.log("Body:  ", request.body)
  console.log("---")
  next()
}

app.use(requestLogger)

app.get("/api/notes", (request, response) => {
  Note.find({}).then((notes) => {
    response.json(notes)
  })
})

app.get("/", (request, response) => {
  response.send("<h1>Hello World!</h1>")
})

/*app.get("/api/notes", (request, response) => {
  response.json(notes)
})*/

app.get("/api/notes/:id", (request, response) => {
  const id = request.params.id
  const note = notes.find((note) => note.id === id)

  if (note) {
    response.json(note)
  } else {
    response.status(404).end()
  }
})

app.delete("/api/notes/:id", (request, response) => {
  Note.findByIdAndDelete(request.params.id).then((note) => {
    response.status(204).end()
  })
})

const generateId = () => {
  const maxId =
    notes.length > 0 ? Math.max(...notes.map((n) => Number(n.id))) : 0
  return String(maxId + 1)
}

app.post("/api/notes", (request, response) => {
  const body = request.body

  if (!body.content) {
    return response.status(400).json({
      error: "content missing",
    })
  }

  const note = new Note({
    content: body.content,
    important: body.important || false,
  })

  note.save().then((savedNote) => {
    response.json(savedNote)
  })
})

app.get("/api/notes/:id", (request, response) => {
  Note.findById(request.params.id)
    .then((returnedNote) => {
      if (returnedNote) {
        response.json(returnedNote)
      } else {
        response.status(404).end()
      }
    })
    .catch((err) => {
      console.log(error)
      response.status(500).end()
    })
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" })
}

app.use(unknownEndpoint)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
