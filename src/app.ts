import express, { Request, Response, NextFunction } from 'express';
import json from 'body-parser';
import fetch from 'node-fetch';
import { Product, CartContent, User, CartPayload } from './types';
import { getAuthUserIdbyToken } from './callApi';
import { blockUnauthorizedRequest } from './middleware';

const app = express();

app.use(json());

app.set('carts', {});

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, World!');
});

app.get('/products', async (req: Request, res: Response) => {
  interface ProductsResponse {
    products: Product[];
  }
  try {
    const response = await fetch('https://dummyjson.com/products');
    const data: ProductsResponse = await response.json();
    const sortedProducts: Product[] = data.products.sort((a: Product, b: Product) => a.title.localeCompare(b.title));
    res.send(sortedProducts);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).send('An error occurred while fetching products');
  }
});

app.post('/login', async (req: Request, res: Response) => {
  const { username, password } = req.body as { username: string; password: string };
  try {
    const response = await fetch('https://dummyjson.com/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, expiresInMins: 30 }),
    });
    const data: User = await response.json();
    if (!data.token) {
      res.status(401).send(data);
    } else {
      res.status(200).send(data);
    }
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).send('An error occurred during login');
  }
});

app.post('/cart', blockUnauthorizedRequest, async (req: Request, res: Response) => {
  try {
    let carts = req.app.get('carts');
    const userId = await getAuthUserIdbyToken(req.headers.authorization || '');
    if (!userId) {
      res.status(401).send('Invalid token');
      return;
    }
    let cartContent = carts[userId] as CartContent;
    if (!cartContent) {
      cartContent = {
        grandTotal: 0,
        productList: [],
      };
      carts[userId] = cartContent as CartContent;
    }
    const cartPayload = req.body as CartPayload;
    if (cartContent.productList.some((product: Product) => product.id === cartPayload.productId)) {
      // In case it already exists in the cart, it will not be added and will show an error
      res.status(400).send('Product already in cart');
      return;
    }
    const response = await fetch(`https://dummyjson.com/products/${cartPayload.productId}`);
    const product: Product = await response.json();
    if (!product.id) {
      // product not found case if the user tries to add a product which is not in the database
      res.status(404).send('Product not found');
      return;
    }
    // add the product to the cart
    cartContent.productList.push(product);
    cartContent.grandTotal += product.price;
    // Now you can access and modify the carts object
    carts[userId] = cartContent;
    res.send(cartContent);
  } catch (error) {
    console.error('An error occurred:', error);
    res.status(500).send('An error occurred processing your request');
  }
});

app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).send();
});

export default app;
