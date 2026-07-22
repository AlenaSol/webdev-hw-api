import { connectToMongoose } from "@/libs/onlineStore";
import { Product } from "@/model/onlineStore/schema";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { force } = req.query;
    if (force === 'true') {
        return res.status(500).json({ error: "Сервер не отвечает" });
    }

    try {
        await connectToMongoose();

        const {
            page = 1,
            limit = 10,
            priceMin,
            priceMax,
            color,
            roomType,
            deliveryDays,
            sortBy,
            order,
            special,
            sort: sortParam,
        } = req.query;

        const filter = {};

        if (priceMin !== undefined || priceMax !== undefined) {
            filter.price = {};
            if (priceMin) filter.price.$gte = Number(priceMin);
            if (priceMax) filter.price.$lte = Number(priceMax);
        }

        // Регистронезависимый поиск по цветам
        if (color) {
            const colorValues = color.split(",").map(c => c.trim());
            const colorRegexes = colorValues.map(c => new RegExp(`^${c}$`, 'i'));
            filter.colors = { $in: colorRegexes };
        }

        // Регистронезависимый поиск по типам комнат
        if (roomType) {
            const roomValues = roomType.split(",").map(r => r.trim());
            const roomRegexes = roomValues.map(r => new RegExp(`^${r}$`, 'i'));
            filter.roomTypes = { $in: roomRegexes };
        }

        if (deliveryDays) {
            filter.deliveryDays = { $lte: Number(deliveryDays) };
        }

        if (special === "true") {
            filter.isSpecial = true;
        } else if (special === "false") {
            filter.isSpecial = false;
        }

        // Сортировка
        let sort = {};
        if (sortParam) {
            switch (sortParam) {
                case "popularity":
                    sort = { popularity: -1 };
                    break;
                case "newest":
                    sort = { createdAt: -1 };
                    break;
                case "oldest":
                    sort = { createdAt: 1 };
                    break;
                default:
                    sort = { createdAt: -1 };
            }
        } else {
            const sortField = sortBy || "createdAt";
            const sortOrder = order === "asc" ? 1 : -1;
            sort = { [sortField]: sortOrder };
        }

        const skip = (Number(page) - 1) * Number(limit);
        const total = await Product.countDocuments(filter);
        const products = await Product.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(Number(limit));

        res.status(200).json({
            products,
            total,
            page: Number(page),
            limit: Number(limit),
            pages: Math.ceil(total / Number(limit)),
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}