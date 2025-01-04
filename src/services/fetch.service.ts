import { type Product } from '../models/product.model';
import { type User } from '../models/user.model';
import { ensureError } from '../utils/error.handler.js';

export async function fetchData(url: string): Promise<Product[]> {
    try {
        const response = await fetch(url);
        if (!response.ok) { 
            throw new Error('Network response was not ok')
        }
        const data= await response.json() as Product[]
        return data;
    }catch  (err: unknown) {
        const error = ensureError(err);
        console.error(error);
        return [];
    }
}

export async function fetchUser(): Promise<User[]> {
    try {
        const data = [
            {
                id: 1,
                name: "Manuel",
                surname: "Gonzalez",
                street: "Calle 123",
                zipCode: 12345,
                city: "Madrid",
                phone: "+50225648212"
            },
            {
                id: 1,
                name: "Juan",
                surname: "Perez",
                street: "Calle 123",
                zipCode: 12345,
                city: "Barcelona",
                phone: "+50225858212"
            }
        ]
        return data;
    }catch  (err: unknown) {
        const error = ensureError(err);
        console.error(error);
        return [];
    }
}


