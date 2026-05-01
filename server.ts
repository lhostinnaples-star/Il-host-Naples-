import express from 'express';
import cors from 'cors';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './backend/config/db';
import authRoutes from './backend/routes/authRoutes';
import coreRoutes from './backend/routes/coreRoutes';
import { generateSitemapXML } from './src/utils/sitemap';
import Service from './backend/models/Service';

import bcrypt from 'bcryptjs';
import User, { UserRole } from './backend/models/User';
import Hotel from './backend/models/Hotel';
import { seedProperties } from './backend/data/seedData';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api', coreRoutes);

  // Test Database Connection
  try {
    await db.authenticate();
    console.log('Mock database initialized successfully.');
    
    // Seed an admin user for testing
    const adminEmail = 'admin@stayease.com';
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      name: 'Admin User',
      email: adminEmail,
      password: hashedPassword,
      role: UserRole.ADMIN,
      status: 'active'
    });
    console.log('Seeded admin user: admin@stayease.com / admin123');

    // Seed the 40 authentic Italian properties
    for (const h of seedProperties) {
      await Hotel.create({ ...h, ownerId: admin.id });
    }
    console.log('Seeded 40 authentic Italian properties.');
    
  } catch (error) {
    console.error('Database connection error:', error instanceof Error ? error.message : error);
    console.info('Tip: Ensure DATABASE_URL is set in the Secrets panel if using a remote PostgreSQL instance.');
  }

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Lhost in Naples API is running' });
  });

  app.get('/sitemap.xml', async (req, res) => {
    try {
      const hotels = await Hotel.findAll();
      const services = await Service.findAll();
      const xml = generateSitemapXML(hotels, services);
      res.header('Content-Type', 'application/xml');
      res.send(xml);
    } catch (error) {
      console.error('Error generating sitemap:', error);
      res.status(500).send('Error generating sitemap');
    }
  });

  // Vite Middleware for Development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
