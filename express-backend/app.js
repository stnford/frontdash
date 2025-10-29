const express = require('express')
const mysql = require('mysql2');


const connection  = mysql.createPool({
  connectionLimit : 10,
  host            : 'localhost',
  port            : 3306,
  user            : 'frontdash_user',
  password        : 'frontdash_password',
  database        : 'frontdash'
});


const app = express()
app.use(express.json());
const port = 8080

app.get('/', (req, res) => {
    connection.query('SELECT * from Address', function (error, results, fields) {
        if (error) throw error;
        res.send(results)
    });
})

app.get('/address', (req, res) => {
    connection.query('SELECT * from Address', function (error, results, fields) {
        if (error) throw error;
        res.send(results)
    });
})


app.post('/authenticate', (req, res) => {
    const username = req.body['username'];
    const password = req.body['password'];
    const userType = req.body['userType'];
    connection.query('SELECT username, userType from LoginCredentials WHERE username = ? and password = ? and userType = ?', [username, password, userType], function (error, results) {
        if (error) throw error;
        if (results.length == 1) {
            res.send({
                username: username,
                userType: results[0].userType
            })
        } else {
            res.status(400)
        }
    });
})


app.post('/staff', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ message: 'username and password are required' });
  }

  const sql = `
    INSERT INTO LoginCredentials (username, password, userType)
    VALUES (?, ?, 'Staff')
  `;

  connection.query(sql, [username, password], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'database error', error: err });
    }

    return res.status(201).json({
      message: 'Staff account created',
      username
    });
  });
});


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})