const express = require('express');
const session = require('express-session');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const csurf = require('csurf');
const passport = require('passport');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

morgan.token('id', function getId(req) {
  return req.id;
});

const { jwtStrategy } = require('./config/passport');

const routes = require('./routes/v1');
const { assignId } = require('./utils/utils');
const auth = require('./middlewares/auth');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 4000;

app.use(assignId);
app.use(morgan('tiny'));

const expiryDate = new Date(Date.now() + 60 * 60 * 1000); //1 hour
app.use(
  session({
    secure: true,
    secret: process.env.SECRET,
    name: process.env.APP_NAME,
    proxy: true,
    resave: false,
    saveUninitialized: true,
    expires: expiryDate,
  })
);
app.use(bodyParser.json());
app.use(bodyParser.text());

// enable cors
app.use(
  cors({
    credentials: true,
    origin: true,
  })
);
app.use(helmet());
app.options('*', cors());

// jwt authentication
app.use(passport.initialize());
passport.use('jwt', jwtStrategy);

// v1 api routes
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/v1', routes);

app.use((error, req, res, next) => {
  console.log(error);
  res.status(error.status || 500);
  res.json({
    error: {
      status: true,
      message: error.message,
    },
  });
});

app.use(express.static(`${__dirname}/../public`));

app.listen(port, () => {
  mongoose.connect(process.env.DATABASE, {
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  });
  console.log(`App listening on port ${port}!`);
});
