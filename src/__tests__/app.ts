import app from '../app';
import supertest from 'supertest';

const request = supertest(app);

console.log('testing');

describe('GET /', () => {
  it('should return "Hello, World!"', async () => {
    const response = await request.get('/');
    expect(response.status).toBe(200);
    expect(response.text).toBe('Hello, World!');
  });
});

describe('GET /products', () => {
  it('should return an array of products', async () => {
    const response = await request.get('/products');
    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
  });
});

describe('POST /login', () => {
  it('should return 401 if credentials are invalid', async () => {
    const response = await request.post('/login').send({
      username: 'hbingley1',
      password: 'invalid',
    });

    expect(response.status).toBe(401);
  });

  it('should return 200 if credentials are valid', async () => {
    const response = await request.post('/login').send({
      username: 'hbingley1',
      password: 'CQutx25i8r',
    });

    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
  });
});

describe('POST /cart', () => {
  it('should return 401 if user is not authenticated (Middleware) -> No header authorization provided', async () => {
    const response = await request.post('/cart');
    expect(response.status).toBe(401);
  });

  it('should return 200 if user is authenticated (Middleware) -> Valid header authorization provided', async () => {
    // get auth token by logging in
    const loginResponse = await request.post('/login').send({
      username: 'hbingley1',
      password: 'CQutx25i8r',
    });
    const token = loginResponse.body.token;
    // Now use the token in the header
    const response = await request
      .post('/cart')
      .set('Authorization', `Bearer ${token}`)
      .send({
        productId: 1,
      });
    expect(response.status).toBe(200);
    // it should contain a product in the cart
    expect(response.body.grandTotal).toBeDefined();
    expect(response.body.productList).toBeDefined();
    expect(response.body.productList.length).toBe(1);
  });

  it('should return 400 if product is already in cart', async () => {
    // get auth token by logging in
    const loginResponse = await request.post('/login').send({
      username: 'atuny0',
      password: '9uQFF1Lh',
    });
    const token = loginResponse.body.token;
    // Now use the token in the header
    const response = await request
      .post('/cart')  
      .set('Authorization', `Bearer ${token}`)
      .send({
        productId: 1,
      });
    expect(response.status).toBe(200);
    // it should contain a product in the cart
    expect(response.body.grandTotal).toBeDefined();
    expect(response.body.productList).toBeDefined();
    expect(response.body.productList.length).toBe(1);

    const response2 = await request
      .post('/cart')  
      .set('Authorization', `Bearer ${token}`)
      .send({
        productId: 1,
      });
    expect(response2.status).toBe(400);
    expect(response2.text).toBe('Product already in cart');
  });
})