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
        const reviewsCollection = database.collection('reviews');
        const usersCollection = database.collection('users');

        /*------------------------------------------------
                start get ,set, update api
         ----------------------------------------------- */

        /* -------------- GET API ------------------*/
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

        // GET ORDER API
        app.get('/orders', async (req, res) => {
            const cursor = ordersCollection.find({});
            const orders = await cursor.toArray();


            res.send(orders);
        })


        // GET user Orders API
        app.get('/userOrders', async (req, res) => {
            const queryEmail = req.query.email;
            const find = { email: queryEmail }
            const result = await ordersCollection.find(find).toArray();
            res.json(result);
        })

        // GET Reviews API
        app.get('/reviews', async (req, res) => {
            const cursor = reviewsCollection.find({});
            const reviews = await cursor.toArray();


            res.send(reviews);
        })

        // get user email for admin
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })




        /* -------------- POST API ------------------*/
        // products store
        app.post('/products', async (req, res) => {
            const products = req.body;
            const result = await productsCollection.insertOne(products);
            // console.log(result);
            res.json(result)
        });

        // Place order store
        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await ordersCollection.insertOne(order);
            // console.log(result);
            res.json(result)
        });

        // reviews store
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviewsCollection.insertOne(review);
            // console.log("reviews are .. : ",result);
            res.json(result);
        });

        /* ------------- Delete API ---------------- */
        // Delete order 
        app.delete("/cancelOrder/:id", (req, res) => {
            ordersCollection.deleteOne({ _id: ObjectId(req.params.id) })
                .then(result => {
                    // console.log(result.deletedCount)
                    res.send(result.deletedCount > 0);

                })
        })

        // Delete products service 
        app.delete("/cancelProduct/:id", (req, res) => {
            productsCollection.deleteOne({ _id: ObjectId(req.params.id) })
                .then(result => {
                    // console.log(result.deletedCount)
                    res.send(result.deletedCount > 0);

                })
        })

        // Post for Users info 
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            console.log(result);
            res.json(result);
        });

        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });


        // For make admin Api
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            console.log('put', user);
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };

            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);

        })



        /* ------------- Update API ---------------- */

        //UPDATE STATUS

        app.patch('/updateOrderStatus', (req, res) => {
            // console.log(req.body);
            ordersCollection.updateOne({ _id: ObjectId(req.body.orderId) },
                {
                    $set: { status: req.body.status }
                })
                .then(result => {
                    // console.log(result);
                    res.send(result.modifiedCount > 0);
                })
        })
    }




    finally {
        // await client.close();
    }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('Welcome to Car Galleria')
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})

