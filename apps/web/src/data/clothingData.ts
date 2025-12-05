export interface ClothingItem {
    id: string;
    name: string;
    category: "Camisas" | "Pantalones" | "Zapatos" | "Abrigos" | "Accesorios";
    image: string;
    color: string;
    size: string;
    brand: string;
    lastWorn?: string;
}

export interface ClothingCategory {
    name: "Camisas" | "Pantalones" | "Zapatos" | "Abrigos" | "Accesorios";
    icon: string;
    items: ClothingItem[];
}

export const clothingData: ClothingCategory[] = [
    {
        name: "Camisas",
        icon: "👕",
        items: [
            {
                id: "shirt-1",
                name: "Camisa Oxford Blanca",
                category: "Camisas",
                image: "/images/clothing/shirt-white-oxford.png",
                color: "Blanco",
                size: "M",
                brand: "Brooks Brothers",
                lastWorn: "2024-12-01"
            },
            {
                id: "shirt-2",
                name: "Camisa Denim Azul",
                category: "Camisas",
                image: "/images/clothing/shirt-blue-denim.png",
                color: "Azul",
                size: "M",
                brand: "Levi's",
                lastWorn: "2024-11-28"
            },
            {
                id: "shirt-3",
                name: "Camisa Lino Beige",
                category: "Camisas",
                image: "/images/clothing/shirt-beige-linen.png",
                color: "Beige",
                size: "L",
                brand: "Massimo Dutti",
                lastWorn: "2024-11-25"
            },
            {
                id: "shirt-4",
                name: "Camisa Cuadros Roja",
                category: "Camisas",
                image: "/images/clothing/shirt-red-plaid.png",
                color: "Rojo",
                size: "M",
                brand: "Uniqlo",
                lastWorn: "2024-11-20"
            },
            {
                id: "shirt-5",
                name: "Camisa Negra Slim",
                category: "Camisas",
                image: "/images/clothing/shirt-black-slim.png",
                color: "Negro",
                size: "M",
                brand: "Zara",
                lastWorn: "2024-12-02"
            },
            {
                id: "shirt-6",
                name: "Camisa Rayas Azul",
                category: "Camisas",
                image: "/images/clothing/shirt-blue-striped.png",
                color: "Azul/Blanco",
                size: "M",
                brand: "H&M",
                lastWorn: "2024-11-18"
            }
        ]
    },
    {
        name: "Pantalones",
        icon: "👖",
        items: [
            {
                id: "pants-1",
                name: "Jeans Azul Oscuro",
                category: "Pantalones",
                image: "/images/clothing/jeans-dark-blue.png",
                color: "Azul Oscuro",
                size: "32",
                brand: "Levi's 511",
                lastWorn: "2024-12-03"
            },
            {
                id: "pants-2",
                name: "Chinos Beige",
                category: "Pantalones",
                image: "/images/clothing/chinos-beige.png",
                color: "Beige",
                size: "32",
                brand: "Dockers",
                lastWorn: "2024-11-30"
            },
            {
                id: "pants-3",
                name: "Pantalón Negro Formal",
                category: "Pantalones",
                image: "/images/clothing/pants-black-formal.png",
                color: "Negro",
                size: "32",
                brand: "Hugo Boss",
                lastWorn: "2024-11-27"
            },
            {
                id: "pants-4",
                name: "Jeans Gris Claro",
                category: "Pantalones",
                image: "/images/clothing/jeans-light-gray.png",
                color: "Gris",
                size: "32",
                brand: "Gap",
                lastWorn: "2024-11-22"
            },
            {
                id: "pants-5",
                name: "Cargo Verde Oliva",
                category: "Pantalones",
                image: "/images/clothing/cargo-olive.png",
                color: "Verde Oliva",
                size: "33",
                brand: "Carhartt",
                lastWorn: "2024-11-15"
            },
            {
                id: "pants-6",
                name: "Chinos Azul Marino",
                category: "Pantalones",
                image: "/images/clothing/chinos-navy.png",
                color: "Azul Marino",
                size: "32",
                brand: "Banana Republic",
                lastWorn: "2024-12-01"
            }
        ]
    },
    {
        name: "Zapatos",
        icon: "👟",
        items: [
            {
                id: "shoes-1",
                name: "Sneakers Blancas",
                category: "Zapatos",
                image: "/images/clothing/sneakers-white.png",
                color: "Blanco",
                size: "42",
                brand: "Adidas Stan Smith",
                lastWorn: "2024-12-04"
            },
            {
                id: "shoes-2",
                name: "Botas Chelsea Marrones",
                category: "Zapatos",
                image: "/images/clothing/boots-brown-chelsea.png",
                color: "Marrón",
                size: "42",
                brand: "Clarks",
                lastWorn: "2024-11-29"
            },
            {
                id: "shoes-3",
                name: "Zapatos Oxford Negros",
                category: "Zapatos",
                image: "/images/clothing/oxford-black.png",
                color: "Negro",
                size: "42",
                brand: "Allen Edmonds",
                lastWorn: "2024-11-26"
            },
            {
                id: "shoes-4",
                name: "Sneakers Running Azul",
                category: "Zapatos",
                image: "/images/clothing/running-blue.png",
                color: "Azul",
                size: "42",
                brand: "Nike Air Max",
                lastWorn: "2024-12-02"
            },
            {
                id: "shoes-5",
                name: "Mocasines Café",
                category: "Zapatos",
                image: "/images/clothing/loafers-brown.png",
                color: "Café",
                size: "42",
                brand: "Cole Haan",
                lastWorn: "2024-11-24"
            }
        ]
    },
    {
        name: "Abrigos",
        icon: "🧥",
        items: [
            {
                id: "coat-1",
                name: "Chaqueta Cuero Negra",
                category: "Abrigos",
                image: "/images/clothing/jacket-leather-black.png",
                color: "Negro",
                size: "M",
                brand: "Schott NYC",
                lastWorn: "2024-11-28"
            },
            {
                id: "coat-2",
                name: "Abrigo Lana Gris",
                category: "Abrigos",
                image: "/images/clothing/coat-wool-gray.png",
                color: "Gris",
                size: "M",
                brand: "J.Crew",
                lastWorn: "2024-11-25"
            },
            {
                id: "coat-3",
                name: "Bomber Azul Marino",
                category: "Abrigos",
                image: "/images/clothing/bomber-navy.png",
                color: "Azul Marino",
                size: "M",
                brand: "Alpha Industries",
                lastWorn: "2024-12-01"
            },
            {
                id: "coat-4",
                name: "Parka Verde",
                category: "Abrigos",
                image: "/images/clothing/parka-green.png",
                color: "Verde",
                size: "L",
                brand: "The North Face",
                lastWorn: "2024-11-20"
            },
            {
                id: "coat-5",
                name: "Blazer Azul",
                category: "Abrigos",
                image: "/images/clothing/blazer-blue.png",
                color: "Azul",
                size: "M",
                brand: "Hugo Boss",
                lastWorn: "2024-11-27"
            }
        ]
    },
    {
        name: "Accesorios",
        icon: "🧢",
        items: [
            {
                id: "acc-1",
                name: "Gorra Baseball Negra",
                category: "Accesorios",
                image: "/images/clothing/cap-black.png",
                color: "Negro",
                size: "Única",
                brand: "New Era",
                lastWorn: "2024-12-03"
            },
            {
                id: "acc-2",
                name: "Bufanda Lana Gris",
                category: "Accesorios",
                image: "/images/clothing/scarf-gray.png",
                color: "Gris",
                size: "Única",
                brand: "Burberry",
                lastWorn: "2024-11-30"
            },
            {
                id: "acc-3",
                name: "Cinturón Cuero Marrón",
                category: "Accesorios",
                image: "/images/clothing/belt-brown.png",
                color: "Marrón",
                size: "85cm",
                brand: "Coach",
                lastWorn: "2024-12-02"
            },
            {
                id: "acc-4",
                name: "Reloj Plata",
                category: "Accesorios",
                image: "/images/clothing/watch-silver.png",
                color: "Plata",
                size: "Única",
                brand: "Seiko",
                lastWorn: "2024-12-04"
            },
            {
                id: "acc-5",
                name: "Gafas Sol Negras",
                category: "Accesorios",
                image: "/images/clothing/sunglasses-black.png",
                color: "Negro",
                size: "Única",
                brand: "Ray-Ban",
                lastWorn: "2024-11-28"
            },
            {
                id: "acc-6",
                name: "Mochila Negra",
                category: "Accesorios",
                image: "/images/clothing/backpack-black.png",
                color: "Negro",
                size: "20L",
                brand: "Herschel",
                lastWorn: "2024-12-01"
            }
        ]
    }
];

export const getCategoryByName = (name: string): ClothingCategory | undefined => {
    return clothingData.find(cat => cat.name === name);
};

export const getItemById = (id: string): ClothingItem | undefined => {
    for (const category of clothingData) {
        const item = category.items.find(item => item.id === id);
        if (item) return item;
    }
    return undefined;
};

export const getTotalItemCount = (): number => {
    return clothingData.reduce((total, category) => total + category.items.length, 0);
};
