import express, { Request, Response, NextFunction } from 'express';
import json from 'body-parser';
import fetch from 'node-fetch';
import { Product, CartContent } from './types';

const app = express();

app.use(json());

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, World!');
});



app.get('/products', async (req: Request, res: Response) => {
  interface ProductsResponse {
    products: Product[];
  }
  // fetch all products available at https://dummyjson.com/products and return them sorted by title (A-Z).
  fetch('https://dummyjson.com/products')
    .then((response) => response.json() as Promise<ProductsResponse>)
    .then((data) => {
      // Ordenar alfabéticamente por el título
      const sortedProducts = data.products.sort((a, b) => a.title.localeCompare(b.title));
      res.send(sortedProducts); // Asegúrate de que 'res' esté definido adecuadamente en tu contexto
    })
    .catch((error) => console.error('Error fetching products:', error));

});

app.post('/login', async (req: Request, res: Response) => {
  res.send();
});

app.post('/cart', async (req: Request, res: Response) => {
  const cartContent: CartContent = {
    grandTotal: 0,
    productList: [],
  };
  res.send(cartContent);
});

app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).send();
});

export default app;
