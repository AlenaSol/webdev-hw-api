import { connectToMongoose } from "@/libs/onlineStore";
import { Product } from "@/model/onlineStore/schema";

const colorsList = [
    "Белый", "Черный", "Серый", "Красный", "Оранжевый", "Желтый",
    "Зеленый", "Салатовый", "Голубой", "Синий", "Фиолетовый",
    "Сиреневый", "Лавандовый", "Розовый"
];

const roomTypesList = [
    "Кухня и столовая", "Ванная комната", "Детская комната",
    "Домашний офис", "Гостиная", "Прихожая", "Спальня",
    "Гардероб", "Дача", "Свет"
];

function randomFromArray(arr, min = 1, max = 4) {
    const count = Math.floor(Math.random() * (max - min + 1)) + min;
    const shuffled = arr.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Данные товаров (15 штук: 3 спецпредложения + 12 каталога)
const productsData = [
    // Спецпредложения (isSpecial: true)
    {
        name: "Кровать TATRAN",
        description: "Основание из полированной нержавеющей стали, придает оригинальный парящий эффект.",
        price: 120000,
        oldPrice: 140000,
        image: "https://i.postimg.cc/Y0rKy7pn/Rectangle-22-1.jpg",
        isSpecial: true,
    },
    {
        name: "Кресло VILORA",
        description: "Мягкое и уютное, аккуратное и стильное. Упругие подушки сиденья и приятная на ощупь ткань.",
        price: 21000,
        oldPrice: 28000,
        image: "https://i.postimg.cc/tJqQmbXr/Rectangle-22-2.jpg",
        isSpecial: true,
    },
    {
        name: "Стол MENU",
        description: "Европейский дуб - отличается особой прочностью и стабильностью.",
        price: 34000,
        oldPrice: 45000,
        image: "https://i.postimg.cc/j2x0kTsX/Rectangle-24-2.jpg",
        isSpecial: true,
    },
    // Обычные товары (каталог) – 12 штук
    {
        name: "Диван ASKESTA",
        description: "Благодаря защелкивающемуся механизму диван легко раскладывается в комфортную кровать",
        price: 68000,
        image: "https://i.postimg.cc/d3sPSFqz/Rectangle-23.jpg",
    },
    {
        name: "Пуф мягкий",
        description: "Круглый пуф с велюровой обивкой, используется как сиденье или подставка.",
        price: 11000,
        image: "https://i.postimg.cc/tJqQmbXr/Rectangle-22-2.jpg",
    },
    {
        name: "Кресло LUNAR",
        description: "Прекрасно переносит солнечные лучи, перепады влажности и любые осадки",
        price: 40000,
        image: "https://i.postimg.cc/XqjSDWVP/Rectangle-23-1.jpg",
    },
    {
        name: "Шкаф Nastan",
        description: "Мебель может быть оснащена разнообразными системами подсветки.",
        price: 80000,
        image: "https://i.postimg.cc/mkLf64bm/Rectangle-23-2.jpg",
    },
    {
        name: "Комод VENT",
        description: "Стильный комод с выдвижными ящиками и фрезерованными фасадами.",
        price: 45000,
        image: "https://i.postimg.cc/vTYFSyQC/Rectangle-24.jpg",
    },
    {
        name: "Тумба прикроватная",
        description: "Компактная тумба из натурального дерева с мягким закрыванием ящиков.",
        price: 25000,
        image: "https://i.postimg.cc/Y0rKy7pn/Rectangle-22-1.jpg",
    },
    {
        name: "Полка настенная",
        description: "Надёжная полка для книг и декора, выдерживает до 30 кг.",
        price: 12000,
        image: "https://i.postimg.cc/d3sPSFqz/Rectangle-23.jpg",
    },
    {
        name: "Зеркало в раме",
        description: "Большое настенное зеркало в деревянной раме с эффектом состаривания.",
        price: 18000,
        image: "https://i.postimg.cc/wMq8bz6b/Rectangle-24-1.jpg",
    },
    {
        name: "Люстра VILORA",
        description: "Современная люстра с уникальным дизайном.",
        price: 15000,
        image: "https://i.postimg.cc/RhS5bmMy/Rectangle-22.jpg",
    },
    {
        name: "Табурет",
        description: "Деревянный табурет с мягким сиденьем, подходит для кухни.",
        price: 9000,
        image: "https://i.postimg.cc/tJqQmbXr/Rectangle-22-2.jpg",
    },
    {
        name: "Вешалка напольная",
        description: "Металлическая вешалка с крючками и полкой для обуви.",
        price: 22000,
        image: "https://i.postimg.cc/tJqQmbXr/Rectangle-23-2.jpg",
    },
    {
        name: "Журнальный столик",
        description: "Стеклянный столик на металлическом каркасе с полкой для журналов.",
        price: 32000,
        image: "https://i.postimg.cc/wMq8bz6b/Rectangle-24-1.jpg",
    },
];

export async function seedOnlineStore() {
    await connectToMongoose();

    await Product.deleteMany({});
    console.log("Старые товары удалены");

    const products = productsData.map((item) => {
        const colors = randomFromArray(colorsList, 1, 4);
        const roomTypes = randomFromArray(roomTypesList, 1, 2);
        const deliveryDays = randomInt(3, 21);
        const popularity = randomInt(0, 1000);

        const randomDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);

        return {
            ...item,
            colors,
            roomTypes,
            deliveryDays,
            popularity,
            createdAt: randomDate,
            oldPrice: item.oldPrice || null,
        };
    });

    await Product.insertMany(products);
    console.log("Добавлено товаров:", products.length);
    return { success: true, message: `База успешно заполнена ${products.length} товарами. Ура!` };
}