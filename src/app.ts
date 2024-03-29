import express, { Request, Response, NextFunction } from 'express';
import json from 'body-parser';
import fetch from 'node-fetch';
import { Product, CartContent, User } from './types';

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
  // Write a POST call that will take username and password from body and will authenticate against the endpoint https://dummyjson.com/auth/login
  // If credentials are invalid throw the proper HTTP error.
  // As response use type User (see type definition).
  // Documentation is available at https://dummyjson.com/docs/auth
  const { username, password } = req.body;
  fetch('https://dummyjson.com/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        username: username,
        password: password,
        expiresInMins: 30, // optional, defaults to 60
      }),
  })
    .then((response) => response.json() as Promise<User>)
    .then((data) => {
      // Check if login was successful
      if (!data.token) {
        // send unauthorized status response
        res.status(401).send(data);
      }
      else{
        // send ok status response with user data
        res.status(200).send(data);
      }
    })
    .catch((error) => console.error('Error loggin in:', error));
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
