import prisma from '../../lib/prisma.js';
import { ApiError } from '../../lib/errors.js';
import { parseId, zoneCreateSchema, zoneUpdateSchema, zonesQuerySchema } from '../../lib/validate.js';

// get all zones, optionally filtered by ?regionId= and paginated
export const getAllZones = async (req, res) => {
    const { regionId, page, limit } = zonesQuerySchema.parse(req.query);

    const where = regionId ? { regionId } : {};

    // Without page/limit keep the original plain-array response
    if (page === undefined && limit === undefined) {
        const zones = await prisma.zone.findMany({
            where,
            include: { region: true },
        });
        return res.json(zones);
    }

    const currentPage = page ?? 1;
    const pageSize = limit ?? 20;

    const [zones, total] = await Promise.all([
        prisma.zone.findMany({
            where,
            include: { region: true },
            skip: (currentPage - 1) * pageSize,
            take: pageSize,
        }),
        prisma.zone.count({ where }),
    ]);

    res.json({
        data: zones,
        pagination: {
            page: currentPage,
            limit: pageSize,
            total,
            totalPages: Math.ceil(total / pageSize),
        },
    });
};

// get a zone by id
export const getZoneById = async (req, res) => {
    const id = parseId(req.params.id);
    const zone = await prisma.zone.findUnique({
        where: { id },
        include: { region: true },
    });
    if (!zone) {
        throw new ApiError(404, 'Zone not found');
    }
    res.json(zone);
};

// register a zone
export const registerZone = async (req, res) => {
    const data = zoneCreateSchema.parse(req.body);
    const newZone = await prisma.zone.create({ data });
    res.status(201).json(newZone);
};

// update a zone by id
export const updateZone = async (req, res) => {
    const id = parseId(req.params.id);
    const data = zoneUpdateSchema.parse(req.body);
    const updatedZone = await prisma.zone.update({
        where: { id },
        data,
    });
    res.json(updatedZone);
};

// delete a zone by id
export const deleteZone = async (req, res) => {
    const id = parseId(req.params.id);
    await prisma.zone.delete({ where: { id } });
    res.status(204).send();
};
