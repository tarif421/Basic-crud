const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 3000;
// console.log(process.env);

//  middleware
app.use(cors());
app.use(express.json());

// const uri =
//   "mongodb+srv://smartDBUser:ETMSM2pHt5eTBvHt@cluster0.9aos02c.mongodb.net/?appName=Cluster0";

const uri = `mongodb+srv://${process.env.DV_USER}:${process.env.DB_PASS}@cluster0.9aos02c.mongodb.net/?appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.get("/", (req, res) => {
  res.send("smart server is running");
});

async function run() {
  try {
    await client.connect();

    const db = client.db("smart_db");
    const productsCollection = db.collection("products");
    const bidsCollection = db.collection("bids");
    const userCollection = db.collection("users");

    // users API
    app.post("/users", async (req, res) => {
      const newUser = req.body;

      const email = req.body.email;
      const query = { email: email };
      const existingUsers = await userCollection.findOne(query);

      const result = await userCollection.insertOne(newUser);
      if (existingUsers) {
        res.send("user already exists . do not need to insert  again");
      } else {
        const result = await userCollection.insertOne(newUser);
        res.send(result);
      }
    });

    // products API
    app.get("/products", async (req, res) => {
      //   const projectField = {_id: 0 ,title: 1, category: 1, email: 1}
      // const cursor = productsCollection.find().sort({ price_min:-1}).limit(5).project(projectField);

      console.log(req.query);
      const email = req.query.email;
      const query = {};

      if (email) {
        query.email = email;
      }

      const cursor = productsCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: id };
      const result = await productsCollection.findOne(query);
      console.log(result);
      res.send(result);
    });

    //  latest products
    app.get("/latest-products", async (req, res) => {
      const cursor = productsCollection
        .find()
        .sort({ created_at: -1 })
        .limit(6);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/products", async (req, res) => {
      const newProducts = req.body;
      const result = await productsCollection.insertOne(newProducts);

      res.send(result);
    });

    app.patch("/products/:id", async (req, res) => {
      const id = req.params.id;
      const updateProduct = req.body;
      const query = { _id: new ObjectId(id) };
      const update = {
        $set: {
          name: updateProduct.name,
          price: updateProduct.price,
        },
      };

      const result = await productsCollection.updateOne(query, update);
      res.send(result);
    });

    app.delete("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productsCollection.deleteOne(query);
      res.send(result);
    });

    // Bids api is here
    app.get("/bids", async (req, res) => {
      const email = req.query.email;
      const query = {};
      if (email) {
        query.buyer_email = email;
      }

      const cursor = bidsCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });
    //////
    app.get("/products/bids/:productId", async (req, res) => {
      const result = await bidsCollection
        .find({ Product: req.params.productId })
        .toArray();

      res.send(result);
    });

    //  my bids
    app.get("/bids", async (req, res) => {
      const query = {};

      if (req.query.email) {
        query.buyer_email = req.query.email;
      }

      const result = await bidsCollection.find(query).toArray();
      res.send(result);
    });
    // delete bids
    app.delete("/bids/:id", async (req, res) => {
      const id = req.params.id;
      const result = await bidsCollection.deleteOne({
        _id: new ObjectId(id),
      });
      res.send(result);
    });
    app.post("/bids", async (req, res) => {
      const newBid = req.body;
      const result = await bidsCollection.insertOne(newBid);
      res.send(result);
    });

    app.delete("/bids/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await bidsCollection.deleteOne(query);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment . You successfully connected to MongoDB"
    );
  } finally {
  }
}

run().catch(console.dir);

app.listen(port, () => {
  console.log(`smart server is running on port: ${port}`);
});
