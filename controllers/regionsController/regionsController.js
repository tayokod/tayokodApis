import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();







// Get all regions
 export const GetRegionsController = async (req, res) => {
    try {
        const regions = await prisma.region.findMany({
            include: {
                zones: true,
            },
        });
        res.json(regions);
    } catch (error) {
        console.error('Error fetching regions:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


// post a new region
export const PostRegionsController = async (req, res) => {
    const {
        name,
        capital,
        population,
        areaKm2,
        languages,
        administrationType,
        latitude,
        longitude,
        flag,
        image,
        images, } = req.body;
    try {
        const newRegion = await prisma.region.create({
            data: {
                name,
                capital,
                population,
                areaKm2,
                languages,
                administrationType,
                latitude,
                longitude,
                flag,
                image,
                images,
            },
        });
        res.status(201).json(newRegion);
    } catch (error) {
        console.error('Error creating region:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// update a region by id
export const UpdateRegionController = async (req, res) => {
    const { id } = req.params;
    const {
        areaKm2 } = req.body;
    try {
        const updatedRegion = await prisma.region.update({
            where: { id: +id},
            data: {
                areaKm2, 
            },
        });
        res.json(updatedRegion);
    } catch (error) {
        console.error('Error updating region:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};