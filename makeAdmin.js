const { MongoClient } = require('mongodb');

async function makeAdmin() {
  const client = new MongoClient('mongodb://localhost:27017/payfusion');
  
  try {
    await client.connect();
    const db = client.db('payfusion');
    
    const result = await db.collection('users').updateOne(
      { email: "john.doe@example.com" }, // Replace with your email
      { $set: { role: "admin" } }
    );
    
    console.log(`User updated: ${result.modifiedCount} document(s) modified`);
  } catch (error) {
    console.error('Error updating user:', error);
  } finally {
    await client.close();
  }
}

makeAdmin();