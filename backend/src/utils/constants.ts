/**
 * Is the application running in production mode? This is determined by the NODE_ENV environment variable.
 */
export const IS_PROD = process.env.NODE_ENV === 'production';

/**
 * The URL of the frontend client. In production, this should point to the deployed frontend.
 */
export const CLIENT_URL = IS_PROD 
  ? 'https://genea.lt' 
  : 'http://localhost:5173';

/**
 * Allowed origins for CORS. In production, only the official frontend URL is allowed.
 */
export const ALLOWED_ORIGINS = IS_PROD 
  ? ['https://genea.lt'] 
  : ['http://localhost:5173', 'http://127.0.0.1:5173'];