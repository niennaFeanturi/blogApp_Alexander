require('dotenv').config();
const fs = require('fs');
const express = require('express');
const config = require('./config/config');
const compression = require('compression');
const helmet = require('helmet');
const https = require('https');
const dynamoose = require('dynamoose');
const AWS = require('aws-sdk');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const MongoStore = require('connect-mongo');
const DynamoDBStore = require('dynamodb-store');
const mongoSanitize = require('express-mongo-sanitize');
const User = require('./models/user');
const userRouter = require('./routes/user.routes');
const postRouter = require('./routes/post.routes');
const configPromise = require('./config/config');


// Set up AWS SDK
dynamoose.aws.sdk = AWS;
AWS.config.update({ region: 'us-west-2' });

// Set up Express app
const app = express();
const privateKeyPath = './ssl/private-key.pem';
const certificatePath = './ssl/certificate.pem';
const privateKey = fs.readFileSync(privateKeyPath, 'utf8');
const certificate = fs.readFileSync(certificatePath, 'utf8');
const credentials = { key: privateKey, cert: certificate };

// Create an HTTPS server
const httpsServer = https.createServer(credentials, app);

// Express app configurations
app.set('view engine', 'ejs');
app.use(helmet());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(compression());
app.use(mongoSanitize());
app.use(express.static('public'));
app.set('trust proxy', 1); // trust first proxy



const ssmClient = new AWS.SSM({
  apiVersion: '2014-11-06',
  region: 'us-west-2'
});

const getMongoDBUrl = async () => {
  try {
    
  ssmClient.getParameter({
  Name: 'mongo_db_url',
  WithDecryption: true // To decrypt the secret value
    }, (err, data) => {
  if (err) {
    console.error('Error getting parameter:', err);
    return;
  }

  // Output the parameter value
  console.log('\npassword retreived successfully.')
  //console.log('Parameter Value:', data.Parameter.Value);
  return data.Parameter.Value;
});
  } catch (error) {
    console.error('Error getting MongoDB URL:', error);
    return null;
  }
};
let mongo_db_url;
(async () => {
  // Use an IIFE (Immediately Invoked Function Expression) to handle async behavior
  const mb = await getMongoDBUrl();
  
  
  //mongo_db_url = mongo_db_urlObject ? mongo_db_urlObject.Value : null;

console.log(mb);
// MongoDB and DynamoDB configurations
const blogDB = config.get('db.name');
const blog_db_url =
  config.get('db.db_url') +
  config.get('db.password') +
  config.get('db.host') +
  blogDB +
  '?retryWrites=true&w=majority';
  
//console.log(blog_db_url);
//const mongoStore = MongoStore.create({
  //mongoUrl: blog_db_url,
 // ttl: 2 * 24 * 60 * 60,
//});
const dynamoDBStore = new DynamoDBStore({
  table: 'your-dynamodb-table-name',
  // Add other DynamoDB options as needed
});

// Set up MongoDB connection
const dbConnection = mongoose.connect(blog_db_url, (err) => {
  if (err) {
    console.log(err);
  }
});

// Set up session middleware
app.use(
  session({
    secret: config.get('secret'),
    resave: false,
    saveUninitialized: false,
    cookie: { secure: 'auto' },
    store: dynamoDBStore, // Use an array of stores
  })
);

// Set up Passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(User.createStrategy());
passport.serializeUser(function (user, done) {
  done(null, user.id);
});
passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

// Middleware to pass authentication status to views
app.use(function (req, res, next) {
  res.locals.isAuthenticated = req.isAuthenticated();
  next();
});

// Set up routes
app.use('/user', userRouter);
app.use('/post', postRouter);

// Default route
app.all('*', function (req, res) {
  res.redirect('/post/about');
});

// Start the HTTPS server
const port = config.get('port') || 8080;
httpsServer.listen(port, () => {
  console.log(`Listening... Server started on port ${port}`);

});

})();
module.exports = app;