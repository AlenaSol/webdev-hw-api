import authMiddleware from "@/middleware/auth-onlineStore";
import { connectToMongoose } from "@/libs/onlineStore";
import { Favorite } from "@/model/onlineStore/schema";

export default async function handler(req, res) {
    if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
    await authMiddleware(req, res, async () => {
        try {
            await connectToMongoose();
            const favorites = await Favorite.find({ userId: req.userId });
            const productIds = favorites
                .map(f => f.productId)
                .filter(id => id !== null)
                .map(id => id.toString());
            res.status(200).json(productIds);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
}