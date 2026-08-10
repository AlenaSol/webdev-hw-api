import authMiddleware from "@/middleware/auth-onlineStore";
import { connectToMongoose } from "@/libs/onlineStore";
import { Cart } from "@/model/onlineStore/schema";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    await authMiddleware(req, res, async () => {
        try {
            await connectToMongoose();

            // Парсим тело запроса (без заголовка application/json)
            const body = JSON.parse(req.body);
            const { productId } = body;

            if (!productId) {
                return res.status(400).json({ error: "productId обязателен" });
            }

            // Находим или создаём корзину
            let cart = await Cart.findOne({ userId: req.userId });
            if (!cart) {
                cart = new Cart({ userId: req.userId, items: [] });
            }

            // Проверяем, есть ли товар в корзине
            const existingIndex = cart.items.findIndex(
                (item) => item.productId.toString() === productId
            );

            if (existingIndex > -1) {
                // Товар есть → удаляем
                cart.items.splice(existingIndex, 1);
                await cart.save();
            } else {
                // Товара нет → добавляем с quantity: 1
                cart.items.push({ productId, quantity: 1 });
                await cart.save();
            }

            // Получаем обновлённую корзину с populate
            const updatedCart = await Cart.findOne({ userId: req.userId }).populate(
                "items.productId"
            );

            // Формируем массив товаров (как в GET /cart)
            const products =
                updatedCart && updatedCart.items.length > 0
                    ? updatedCart.items.map((item) => ({
                        ...item.productId.toObject(),
                        quantity: item.quantity,
                    }))
                    : [];

            // Возвращаем актуальный список
            res.status(200).json(products);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
}