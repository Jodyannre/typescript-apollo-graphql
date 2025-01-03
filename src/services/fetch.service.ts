import { type Product } from '../models/product.model';
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


