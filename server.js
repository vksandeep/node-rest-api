const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors');


const app = express();
const port = 3030;
app.use(cors()); // Adds Access-Control-Allow-Origin: * to responses
app.use(bodyParser.json());

// Read the JSON file
const readFile = (callback) => {
  fs.readFile('./data.json', 'utf8', (err, data) => {
    if (err) {
      callback([]);
    } else {
      callback(JSON.parse(data));
    }
  });
};

// Write the JSON file
const writeFile = (data, callback) => {
  fs.writeFile('./data.json', JSON.stringify(data, null, 2), callback);
};

// Get all items
app.get('/todos', (req, res) => {
  readFile((data) => {
    res.json(data);
  });
});

// Get a specific item by ID
app.get('/todos/:id', (req, res) => {
  const itemId = req.params.id;

  readFile((data) => {
    const result = data.find((item) => item.id == itemId);
    if (result) {
      res.json(result);
    } else {
      res.status(404).json({ error: 'Item not found' });
    }
  });
});

// Create a new item
app.post('/todos', (req, res) => {
  const newItem = req.body;

  readFile((data) => {
    const nextId = data.length > 0 ? data[data.length - 1].id + 1 : 1;
    newItem.id = nextId;
    data.push(newItem);

    writeFile(data, (err) => {
      if (err) {
        res.status(500).json({ error: 'Failed to create item' });
      } else {
        res.status(201).json(newItem);
      }
    });
  });
});

// Update an existing item
app.put('/todos/:id', (req, res) => {
  const itemId = req.params.id;
  const updatedItem = req.body;

  readFile((data) => {
    const itemIndex = data.findIndex((item) => item.id == itemId);
    if (itemIndex !== -1) {
      data[itemIndex] = { ...data[itemIndex], ...updatedItem };

      writeFile(data, (err) => {
        if (err) {
          res.status(500).json({ error: 'Failed to update item' });
        } else {
          res.json(data[itemIndex]);
        }
      });
    } else {
      res.status(404).json({ error: 'Item not found' });
    }
  });
});

// Delete an item
app.delete('/todos/:id', (req, res) => {
  const itemId = req.params.id;

  readFile((data) => {
    const itemIndex = data.findIndex((item) => item.id == itemId);
    if (itemIndex !== -1) {
      const deletedItem = data[itemIndex];
      data.splice(itemIndex, 1);

      writeFile(data, (err) => {
        if (err) {
          res.status(500).json({ error: 'Failed to delete item' });
        } else {
          res.json(deletedItem);
        }
      });
    } else {
      res.status(404).json({ error: 'Item not found' });
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
