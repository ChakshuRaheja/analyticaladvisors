# Omkara Capital Backend

Backend server for Omkara Capital with Razorpay payment verification.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Update the Razorpay API keys with your actual keys
   - Add your OpenRouter API key for the chatbot
```bash
cp .env.example .env
```

3. Start the development server:
```bash
npm run dev
```

## Deployment

For production deployment, follow these steps:

1. Set up environment variables:
   - Copy `.env.production` to `.env` on your production server
   - Update the Razorpay API keys with your actual production keys
   - Add your OpenRouter API key for the chatbot

2. Install production dependencies:
```bash
npm install --production
```

3. Start the production server:
```bash
npm start
```

### Deployment Options

#### Option 1: Traditional VPS/Cloud Server
- Set up a Node.js environment on your server
- Use PM2 for process management:
```bash
npm install -g pm2
pm2 start src/index.js --name "omkara-backend"
pm2 save
```

#### Option 2: Docker
- Build the Docker image:
```bash
docker build -t omkara-backend .
```
- Run the container:
```bash
docker run -p 3001:3001 --env-file .env.production -d omkara-backend
```

#### Option 3: Serverless Deployment
- For AWS Lambda, Azure Functions, or Google Cloud Functions, additional configuration is needed
- Consider using Express adapter libraries for these platforms

## API Endpoints

### Payment API

#### Create Order
- **URL**: `/api/payments/create-order`
- **Method**: `POST`
- **Body**:
```json
{
  "amount": 1000, 
  "currency": "INR",
  "receipt": "order_receipt_1",
  "notes": {
    "key1": "value1"
  }
}
```
- **Response**:
```json
{
  "status": "success",
  "message": "Order created successfully",
  "data": {
    "order": {
      "id": "order_ID",
      "amount": 100000,
      "currency": "INR",
      "receipt": "order_receipt_1",
      "status": "created"
    }
  }
}
```

#### Verify Payment
- **URL**: `/api/payments/verify`
- **Method**: `POST`
- **Body**:
```json
{
  "razorpay_order_id": "order_ID",
  "razorpay_payment_id": "payment_ID",
  "razorpay_signature": "signature"
}
```
- **Response**:
```json
{
  "status": "success",
  "message": "Payment verified successfully",
  "data": {
    "payment": {
      "id": "payment_ID",
      "entity": "payment",
      "amount": 100000,
      "currency": "INR",
      "status": "captured",
      "order_id": "order_ID",
      "method": "card"
    }
  }
}
```

### Chatbot API

#### Get Chatbot Response
- **URL**: `/api/chatbot/response`
- **Method**: `POST`
- **Body**:
```json
{
  "message": "What services do you offer?",
  "history": [
    {"role": "user", "content": "Hello"},
    {"role": "assistant", "content": "Hi there! How can I help you today?"}
  ]
}
```
- **Response**:
```json
{
  "status": "success",
  "message": "Chatbot response generated",
  "data": {
    "response": "We offer various investment services including stock analysis, portfolio review, and investment advisory. Would you like more details about any specific service?"
  }
}
```

#### Store Conversation
- **URL**: `/api/chatbot/store-conversation`
- **Method**: `POST`
- **Body**:
```json
{
  "conversation": [
    {"role": "user", "content": "What are your subscription plans?"},
    {"role": "assistant", "content": "Our subscription plans start at ₹999 per month..."}
  ]
}
```
- **Response**:
```json
{
  "status": "success",
  "message": "Conversation stored successfully"
}
```

## Frontend Integration

### Payment Integration

To integrate payments with the frontend:

1. Create the order using the `/api/payments/create-order` endpoint
2. Initialize the Razorpay checkout with the order
3. After payment completion, verify the payment using the `/api/payments/verify` endpoint

```javascript
// Example frontend code
const verifyPayment = async (paymentResponse) => {
  try {
    const response = await fetch('http://localhost:3001/api/payments/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        razorpay_order_id: paymentResponse.razorpay_order_id,
        razorpay_payment_id: paymentResponse.razorpay_payment_id,
        razorpay_signature: paymentResponse.razorpay_signature,
      }),
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw error;
  }
};
```

### Chatbot Integration

The chatbot uses OpenRouter.ai to generate AI responses. To set up the chatbot:

1. Sign up at [OpenRouter.ai](https://openrouter.ai/) and get your API key
2. Add your API key to the `.env` file:
```
OPENROUTER_API_KEY=your_api_key_here
```
3. Use the ChatBot component in your React application
4. The chatbot maintains conversation history to provide context-aware responses

## Security Considerations

1. Always keep your Razorpay and OpenRouter API keys confidential
2. Never expose your secret keys in frontend code
3. Use HTTPS for all API communications
4. Set appropriate CORS policies
5. Implement rate limiting to prevent abuse
