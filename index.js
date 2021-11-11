const express = require('express')
const { MongoClient } = require('mongodb');
const cors = require('cors')

require('dotenv').config();

// WHEN DELETE ELEMENT, single element ,THAN USE THIS ID
const ObjectId = require('mongodb').ObjectId;


const app = express()

const port = process.env.PORT || 5000

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ug0c1.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

console.log(uri);

//main 
async function run() {

    try {
        await client.connect();
        const database = client.db('car_galleria');
        const productsCollection = database.collection('products');
        const ordersCollection = database.collection('orders');

        // start get ,set, update api

        // GET Products API
        app.get('/products', async (req, res) => {
            const cursor = productsCollection.find({});
            const products = await cursor.toArray();


            res.send(products);
        })

        //FOR SINGLE Pro INFO
        app.get('/products/:id', async (req, res) => {

            const id = req.params.id;
            const query = { _id: ObjectId(id) };

            const product = await productsCollection.findOne(query);
            console.log('load product with id: ', id);

            res.send(product);

        })


        // products store
        app.post('/products', async (req, res) => {
            const products = req.body;
            const result = await productsCollection.insertOne(products);
            console.log(result);
            res.json(result)
        });

        // Place order store
        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await ordersCollection.insertOne(order);
            console.log(result);
            res.json(result)
        });
    }




    finally {
        // await client.close();
    }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})

