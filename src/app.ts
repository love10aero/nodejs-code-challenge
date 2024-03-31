import express, { Request, Response, NextFunction } from 'express';
import json from 'body-parser';
import fetch from 'node-fetch';
import { Product, CartContent, User, CartPayload } from './types';
import { getAuthUserIdbyToken } from './callApi';
import { blockUnauthorizedRequest } from './middleware';

const app = express();

app.use(json());

app.set('carts', {}); // Initialize an empty object for carts

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
  const { username, password } = req.body as { username: string, password: string };
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

app.post('/cart', blockUnauthorizedRequest, async (req: Request, res: Response) => {
  // Write a POST call that will add a product to the cart.
  // For this task please do not use Dummy JSON Cart API. You should create your own implementation.
  // It will read the payload using CartPayload as type (see type definition) and add to customer's cart (reside in memory for the code challenge).
  // You'll need to write a middleware to block and unauthorized attempt (documentation is available at https://dummyjson.com/docs/auth).
  // Token's payload has customer's ID and you should use that.
  // Avoid product duplication.
  // Return as payload the cart's grand total (sum of all products inside cart) and a list of products (refer to CartContent type).
  let carts = req.app.get('carts');
  const userId = await getAuthUserIdbyToken(req.headers.authorization || '');
  let cartContent = carts[userId] as CartContent;
  if (!cartContent) {
    cartContent = {
      grandTotal: 0,
      productList: [],
    };
    carts[userId] = cartContent as CartContent;
  }
  // get the product id from the request body
  const cartPayload = req.body as CartPayload;
  // Check if the product is already in the cart
  if (cartContent.productList.some((product: Product) => product.id === cartPayload.productId)) {
    // send an error response if the product is already in the cart
    res.status(400).send('Product already in cart');    
    return;
  }
  // get the price of the product from the Dummy JSON API
  const product = await fetch(`https://dummyjson.com/products/${cartPayload.productId}`)
    .then((response) => response.json() as Promise<Product>)
    .then((data) => {
      return data;
    })
    .catch((error) => {
      console.error('Error fetching products:', error);
      throw new Error('Failed to fetch product');
    });
  if (!product.id) {
    // send an error response if the product is not found
    res.status(404).send('Product not found');
    return;
  }
  // add the product to the cart
  cartContent.productList.push(product);
  cartContent.grandTotal += product.price;
  // Now you can access and modify the carts object
  res.send(cartContent);
});

app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).send();
});

export default app;
