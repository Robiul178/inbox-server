const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pg5idq6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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

        //dbCollections
        const userCollection = client.db("task-server").collection("users")
        const taskCollection = client.db("task-server").collection("task")


        //users api
        app.post('/users', async (req, res) => {
            const user = req.body;
            const role = user?.userRole.value;
            const email = user?.email;

            if (!email || !role) {
                return res.send('User Already Exist')
            }

            let coin = 0;
            if (role === 'worker') {
                coin = 10;
            } else if (role == 'taskCreator') {
                coin = 50;
            } else {
                res.send('invalid role')
            }

            const result = await userCollection.insertOne({ user, role, coin })
            res.send(result)
        })


        //task
        app.get('/task', async (req, res) => {
            const result = await taskCollection.find().toArray();
            res.send(result)
        })






        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);









app.get('/', (req, res) => {
    res.send("test server")
});
app.listen(port, () => {
    console.log(`test server running in port ${port}`)
})