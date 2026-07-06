import prisma from '../../lib/prisma.js';
import { ApiError } from '../../lib/errors.js';
import { parseId, regionCreateSchema, regionUpdateSchema } from '../../lib/validate.js';

// Get all regions
export const GetRegionsController = async (req, res) => {
    const regions = await prisma.region.findMany({
        include: {
            zones: true,
        },
    });
    res.json(regions);
};

// get a region by id
export const GetRegionByIdController = async (req, res) => {
    const id = parseId(req.params.id);
    const region = await prisma.region.findUnique({
        where: { id },
        include: { zones: true },
    });
    if (!region) {
        throw new ApiError(404, 'Region not found');
    }
    res.json(region);
};

// get the zones of a region
export const GetRegionZonesController = async (req, res) => {
    const id = parseId(req.params.id);
    const region = await prisma.region.findUnique({
        where: { id },
        include: { zones: true },
    });
    if (!region) {
        throw new ApiError(404, 'Region not found');
    }
    res.json(region.zones);
};

// post a new region
export const PostRegionsController = async (req, res) => {
    const data = regionCreateSchema.parse(req.body);
    const newRegion = await prisma.region.create({ data });
    res.status(201).json(newRegion);
};

// update a region by id
export const UpdateRegionController = async (req, res) => {
    const id = parseId(req.params.id);
    const data = regionUpdateSchema.parse(req.body);
    const updatedRegion = await prisma.region.update({
        where: { id },
        data,
    });
    res.json(updatedRegion);
};

// delete a region by id
export const DeleteRegionController = async (req, res) => {
    const id = parseId(req.params.id);
    await prisma.region.delete({ where: { id } });
    res.status(204).send();
};
