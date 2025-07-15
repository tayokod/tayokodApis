
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();


// get all zones
app.get('/zones', async (req, res) => {
    try {
        const zones = await prisma.zone.findMany({
            include: {
                region: true,
            },
        });
        res.json(zones);
    } catch (error) {
        console.error('Error fetching zones:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



// register a zone
app.post('/zones', async (req, res) => {
    const { name, regionId, population, areaKm2, latitude, longitude } = req.body;
    
    try {
        const newZone = await prisma.zone.create({
            data: {
                name,
                regionId,
                population,
                areaKm2,
                latitude,
                longitude,
            },
        });
        res.status(201).json(newZone);
    } catch (error) {
        console.error('Error creating zone:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
