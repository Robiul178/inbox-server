const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
        const submissionCollection = client.db("task-server").collection("mySubmission")
        const withdrawCollection = client.db("task-server").collection("withdrawInfo")


        //users api
        app.get('/users', async (req, res) => {
            const result = await userCollection.find().toArray();
            res.send(result);
        })


        app.post('/users', async (req, res) => {
            const user = req.body;
            const role = user?.userRole.value;
            const email = user?.email;

            const existingUser = await userCollection.findOne({ 'user.email': email });
            if (existingUser) {
                return res.status(400).send('User already exists.');
            }

            let coin = 0;
            if (role === 'worker') {
                coin = 10;
            } else if (role == 'taskCreator') {
                coin = 50;
            } else {
                res.send('invalid role')
            }
            const result = await userCollection.insertOne({ user, coin })
            res.send(result)
        });

        app.put('/users/updateCoin/:email', async (req, res) => {
            const email = req.params.email;
            const postCoin = req.body;
            const taskAddCoin = postCoin.totalCost;
            const coinUser = await userCollection.findOne({ 'user.email': email })
            const userCoin = coinUser.coin;

            const updateCoin = userCoin - taskAddCoin;
            const filter = { 'user.email': email }
            const updatedDocs = {
                $set: {
                    coin: updateCoin,
                }
            }
            const result = await userCollection.updateOne(filter, updatedDocs)
            res.send(result)
        })



        //task
        app.get('/task', async (req, res) => {
            const result = await taskCollection.find().toArray();
            res.send(result)
        })

        app.get('/task/creatorEmail/:email', async (req, res) => {
            const email = req.params.email;
            const query = { creator_email: email };
            const result = await taskCollection.find(query).toArray();
            res.send(result)
        })
        app.post('/tasks', async (req, res) => {
            const data = req.body;
            const result = await taskCollection.insertOne(data)
            res.send(result)
        });
        app.delete('/task/myTask/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await taskCollection.deleteOne(query);
            res.send(result)
        })

        //mysubmission
        app.post('/mysubmission', async (req, res) => {
            const data = req.body;
            const result = await submissionCollection.insertOne(data);
            res.send(result)
        })

        app.get('/user/email/:email', async (req, res) => {
            const email = req.params.email;
            const query = { worker_email: email };
            const result = await submissionCollection.find(query).toArray();
            res.send(result)
        })

        app.get('/user/creatorEmail/:email', async (req, res) => {
            const email = req.params.email;
            const query = { creator_email: email };
            const result = await submissionCollection.find(query).toArray();
            res.send(result)
        })

        //withdrawCollection
        app.post('/withdraw', async (req, res) => {
            const data = req.body;
            const result = await withdrawCollection.insertOne(data);
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