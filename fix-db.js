const mongoose = require('mongoose');
const db = 'mongodb+srv://pk9621535_db_user:6300502004@cluster0.qocen3y.mongodb.net/?appName=Cluster0';

mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    try {
      const collection = mongoose.connection.collection('users');
      // Drop the problematic email_1 index
      await collection.dropIndex('email_1').catch(() => {
        console.log('email_1 index does not exist');
      });
      console.log('✓ Successfully fixed database - dropped email_1 index');
      mongoose.connection.close();
    } catch (err) {
      console.error('Error:', err.message);
      mongoose.connection.close();
    }
  })
  .catch(err => console.error('Connection error:', err));
