import authMiddleware from "@/middleware/auth-onlineStore";
import { connectToMongoose } from "@/libs/onlineStore";
import { Cart } from "@/model/onlineStore/schema";

export default async function handler(req, res) {
    await authMiddleware(req, res, async () => {
        try {
            await connectToMongoose();

            if (req.method === "GET") {
                // Получаем корзину с populated товарами
                let cart = await Cart.findOne({ userId: req.userId }).populate("items.productId");
                if (!cart || cart.items.length === 0) {
                    // Если корзины нет или она пуста, возвращаем пустой массив
                    return res.status(200).json([]);
                }

                // Преобразуем items в плоский массив с quantity
                const products = cart.items.map(item => ({
                    ...item.productId.toObject(),
                    quantity: item.quantity
                }));

                return res.status(200).json(products);
            }

            if (req.method === "DELETE") {
                // Очистка корзины
                await Cart.findOneAndDelete({ userId: req.userId });
                return res.status(200).json({ message: "Корзина очищена" });
            }

            res.status(405).json({ error: "Method not allowed" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
}