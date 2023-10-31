import { Request, Response, NextFunction } from "express";

export const validateLocation = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const location = req.body?.provider?.location;
    const type = ['CONSTANT', 'VARIABLE']
    if (!location) {
        return next()
    }
    location?.map(async (circle: any) => {
        if (!type.includes(circle?.radius?.type)) {
            return await res.status(400).json({ message: "Please provide a proper type" });
        }
        return next()
    })
};

