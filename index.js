const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to serve static files
app.use(express.static('public'));

// Route 1: GET / - Displays HTML with list of files
app.get('/', (req, res) => {
  const dataDir = path.join(__dirname, 'data');
  
  fs.readdir(dataDir, (err, files) => {
    if (err) {
      return res.status(500).send('Error reading data directory');
    }
    
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    const usernames = jsonFiles.map(file => file.replace('.json', ''));
    
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>NST BLR Superstars</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            background-color: #f5f5f5;
          }
          h1 {
            color: #333;
          }
          ul {
            list-style-type: none;
            padding: 0;
          }
          li {
            background-color: white;
            margin: 10px 0;
            padding: 15px;
            border-radius: 5px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
          }
          a {
            color: #007bff;
            text-decoration: none;
          }
          a:hover {
            text-decoration: underline;
          }
        </style>
      </head>
      <body>
        <h1>NST BLR Superstars</h1>
        <h2>User List</h2>
        <ul>
          ${usernames.map(username => `
            <li><a href="/${username}">${username}</a></li>
          `).join('')}
        </ul>
      </body>
      </html>
    `;
    
    res.send(html);
  });
});

// Route 2: GET /api/users - Lists all the files in data in a JSON array
app.get('/api/users', (req, res) => {
  const dataDir = path.join(__dirname, 'data');
  
  fs.readdir(dataDir, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Error reading data directory' });
    }
    
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    const usernames = jsonFiles.map(file => file.replace('.json', ''));
    
    res.json(usernames);
  });
});

// Route 4: GET /api/users/:username - Fetch JSON file for user
app.get('/api/users/:username', (req, res) => {
  const username = req.params.username;
  const filePath = path.join(__dirname, 'data', `${username}.json`);
  
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        return res.status(404).json({ error: 'User not found' });
      }
      return res.status(500).json({ error: 'Error reading user file' });
    }
    
    try {
      const userData = JSON.parse(data);
      res.json(userData);
    } catch (parseErr) {
      res.status(500).json({ error: 'Error parsing user data' });
    }
  });
});

// Route 3: GET /:username - Display HTML with user information
app.get('/:username', (req, res) => {
  const username = req.params.username;
  const filePath = path.join(__dirname, 'data', `${username}.json`);
  
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        return res.status(404).send(`
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>User Not Found</title>
          </head>
          <body>
            <h1>User Not Found</h1>
            <p>The user "${username}" does not exist.</p>
            <a href="/">Back to user list</a>
          </body>
          </html>
        `);
      }
      return res.status(500).send('Error reading user file');
    }
    
    try {
      const userData = JSON.parse(data);
      const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${userData.name || username}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              max-width: 800px;
              margin: 50px auto;
              padding: 20px;
              background-color: #f5f5f5;
            }
            .profile-card {
              background-color: white;
              padding: 30px;
              border-radius: 10px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            h1 {
              color: #333;
              margin-top: 0;
            }
            .profile-field {
              margin: 15px 0;
            }
            .profile-label {
              font-weight: bold;
              color: #666;
            }
            .back-link {
              display: inline-block;
              margin-top: 20px;
              color: #007bff;
              text-decoration: none;
            }
            .back-link:hover {
              text-decoration: underline;
            }
          </style>
        </head>
        <body>
          <div class="profile-card">
            <h1>${userData.name || username}</h1>
            ${userData.username ? `<div class="profile-field"><span class="profile-label">Username:</span> ${userData.username}</div>` : ''}
            ${userData.email ? `<div class="profile-field"><span class="profile-label">Email:</span> ${userData.email}</div>` : ''}
            ${userData.bio ? `<div class="profile-field"><span class="profile-label">Bio:</span> ${userData.bio}</div>` : ''}
            ${userData.location ? `<div class="profile-field"><span class="profile-label">Location:</span> ${userData.location}</div>` : ''}
            <a href="/" class="back-link">← Back to user list</a>
          </div>
        </body>
        </html>
      `;
      
      res.send(html);
    } catch (parseErr) {
      res.status(500).send('Error parsing user data');
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
