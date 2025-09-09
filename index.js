import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import connectDB from './db/db.js';
import routes from './routes.js';
dotenv.config();


const app = express();
const PORT = process.env.PORT || 5000;
const corsOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: true,
  optionsSuccessStatus: 204, // some legacy browsers (IE11, various SmartTVs) choke on 204
};


app.use(helmet());
app.use(morgan('dev'));
app.use(cors(corsOptions));
app.use(express.json());
 
(async()=>{
    try {
        await connectDB();
        routes.map(route =>{
             app.use('/api/v1'+route.path,route.handler)
        });
      app.get('/api/v1', (req, res) => {
          res.send('Welcome to the API');
      });
      console.log('MongoDB connected and Routes are set up');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);   
    }
})();
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});