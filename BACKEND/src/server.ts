import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// Důležité: Přidána přípona .js, aby ESM loader soubor našel
import reservationRoutes from './routes/reservationRoutes.js';
import authRoutes from './routes/authRoutes.js';

dotenv.config();

const app = express();

// Nastaven port 5001 dle tvé aktuální konfigurace
const PORT = process.env.PORT || 5001;

// Middleware pro povolení komunikace s Frontendem
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
// Propojení tvých rout pro rezervace (Constraint & Priority Engine)
app.use('/api/reservations', reservationRoutes);

// Základní cesta pro ověření, že backend žije
app.get('/', (req, res) => {
  res.send('🚀 reserVUT API is running on port 5001...');
});

// Start serveru
app.listen(PORT, () => {
  console.log(`
  ================================================
  ✅ SERVER BĚŽÍ: http://localhost:${PORT}
  🛠️  MODE: Development (ts-node/esm)
  👤 IDENTITY: Head Admin (Lucie Riederová) active
  ================================================
  `);
});
