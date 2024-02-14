const express = require("express");
const cors = require("cors");
const { MongoClient } = require('mongodb');
const multer = require("multer");

const app = express();
const PORT = process.env.PORT || 5038;
const { ObjectId } = require('mongodb');


app.use(express.json()); // Parse JSON bodies
app.use(cors()); // Enable CORS

const uri = "mongodb+srv://yikhang10:yikhang123@cluster0.zeixozg.mongodb.net/?retryWrites=true&w=majority";
const databaseName = "todoappdb";

async function connectToDatabase() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        console.log("Connected to MongoDB!");
        return client.db(databaseName);
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw error;
    }
}

async function startServer() {
    try {
        const database = await connectToDatabase();

        // Define routes after the database connection is established
        app.get('/api/todoapp/GetNotes', async (request, response) => {
            try {
                const notes = await database.collection("todoappcollection").find({}).toArray();
                response.json(notes);
            } catch (error) {
                console.error("Error fetching notes:", error);
                response.status(500).json({ error: "Internal Server Error" });
            }
        });

        app.post('/api/todoapp/AddNotes', multer().none(), async (request, response) => {
            try {
                const newNote = request.body.newNote;
                const result = await database.collection("todoappcollection").insertOne({ description: newNote });
                response.json({ message: "Note added successfully", insertedId: result.insertedId });
            } catch (error) {
                console.error("Error adding note:", error);
                response.status(500).json({ error: "Internal Server Error" });
            }
        });

        app.put('/api/todoapp/UpdateNote/:id', multer().none(), async (request, response) => {
            try {
                const noteId = request.params.id;
                const objectId = new ObjectId(noteId);
                const newDescription = request.body.description;
                const result = await database.collection("todoappcollection").updateOne({ _id: objectId }, { $set: { description: newDescription } });
                console.log(result);
                if (result.modifiedCount === 1) {
                    response.json({ message: "Note updated successfully" });
                } else {
                    response.status(404).json({ error: "Note not found" });
                }
            } catch (error) {
                console.error("Error updating note:", error);
                response.status(500).json({ error: "Internal Server Error" });
            }
        });

        app.delete('/api/todoapp/DeleteNote/:id', async (request, response) => {
            try {
                const noteId = request.params.id;
                console.log(noteId);
                if (!ObjectId.isValid(noteId)) {
                    return response.status(400).json({ error: "Invalid note ID" });
                }
                const objectId = new ObjectId(noteId);
                const result = await database.collection("todoappcollection").deleteOne({ _id: objectId });
                console.log(noteId);
                console.log(result);
                if (result.deletedCount === 1) {
                    response.json({ message: "Note deleted successfully" });
                } else {
                    response.status(404).json({ error: "Note not found" });
                }
            } catch (error) {
                console.error("Error deleting note:", error);
                response.status(500).json({ error: "Internal Server Error" });
            }
        });

        app.get('/api/todoapp/SearchNotes', async (request, response) => {
            try {
                const searchTerm = request.query.term;
                const notes = await database.collection("todoappcollection").find({ description: { $regex: searchTerm, $options: 'i' } }).toArray();
                response.json(notes);
            } catch (error) {
                console.error("Error searching notes:", error);
                response.status(500).json({ error: "Internal Server Error" });
            }
        });

        app.listen(PORT, () => {
            console.log(`Server is listening on port ${PORT}`);
        });
    } catch (error) {
        console.error("Error starting server:", error);
        process.exit(1);
    }
}

startServer();