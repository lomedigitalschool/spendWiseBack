import express from 'express';
import cors from 'cors';
import router from './routes';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', router); // Préfixe toutes les routes par /api

export default app;