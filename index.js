const express = require("express");
const app = express();
require('dotenv').config();
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000;

// middlewares
app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zlbqiwd.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");


        // db & collections
        const database = client.db("db_1");
        const icons = database.collection("icons");



        app.get("/", (req, res) => {
            res.send({ status: "OK", message: "Server is up and running!" });
        })

        app.get("/icons", async (req, res) => {

            // get the tagsToFilterIcons state as a string from the client side
            const tagsString = req.query?.tags;
            // create an array from the string by splitting tags by comma
            const tags = tagsString.split(",");

            // get the sortOrder from the client side
            const sortOrder = parseInt(req.query?.sortOrder);

            // query to filter out icons
            let query = {};

            // if tags exist, add tags property to the query object to query using tags to filter out icons
            if (tagsString.length) {
                query.tags = { $in: tags }
            }

            // result to send to the client side
            let result;

            // if sortOrder not zero sort alphabetically
            if (sortOrder) {
                result = await icons.find(query).sort({ name: sortOrder }).toArray();
            } else {
                result = await icons.find(query).toArray();
            }

            // send response back to the client side
            res.send(result);
        })




    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}

run().catch(console.dir);




app.listen(port, () => {
    console.log("Server is running in port ", port);
})