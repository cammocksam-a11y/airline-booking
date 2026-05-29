import { MongoClient, ServerApiVersion } from 'mongodb'

const uri = process.env.MONGODB_URI as string

let client: MongoClient
let clientPromise: Promise<MongoClient>

declare global {
  var _mongoClientPromise: Promise<MongoClient>
}

if (!global._mongoClientPromise) {
  client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
    tls: true,
    tlsAllowInvalidCertificates: false,
  })
  global._mongoClientPromise = client.connect()
}
clientPromise = global._mongoClientPromise

export default clientPromise