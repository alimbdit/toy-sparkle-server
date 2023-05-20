const express = require('express');
const cors = require('cors');
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const port = process.env.PORT || 5000;

const app = express();



// middleware

app.use(cors());
app.use(express.json());





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.h73vuqp.mongodb.net/?retryWrites=true&w=majority`;

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


    
    const toyCollection = client.db("toySparkleDB").collection("allToys");


    app.post('/toys', async(req, res) => {
        const body = req.body;
        console.log(body)
        const result = await toyCollection.insertOne(body);
        res.send(result)
    })

    app.get('/toys', async(req, res) => {
        let query = {}

        const options = {
        
        projection: { toyName: 1, price: 1, sellerName: 1, subCategory: 1, quantity: 1 },
      };
        const result = await toyCollection.find(query, options).limit(20).toArray();
        res.send(result)
    })

    app.get('/toysByName/:name', async(req, res) => {

      const name = req.params.name;
      
      const result = await toyCollection.find({ toyName: { $regex: name, $options: 'i' } }).toArray();
      res.send(result);
    })



    app.post('/toys/:email', async(req, res) => {
      const email = req.params.email;
      // console.log(req.body)
      let sort;
      if(req.body.sortText === 'ascending'){
        sort = 1
      }
      else if(req.body.sortText === 'descending'){
        sort = -1
      }
      const result = await toyCollection.find({sellerEmail: email}).sort({price: sort}).toArray();
      res.send(result)
    })
    app.get('/toys/:email', async(req, res) => {
      const email = req.params.email;
    //  console.log(req.body)
      const result = await toyCollection.find({sellerEmail: email}).toArray();
      res.send(result)
    })

    app.get('/toy/:id', async(req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.findOne(query);
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
    res.send('toySparkle is running')
})


app.listen(port, ()=> {
    console.log(`toySparkle is running on port ${port}`)
})