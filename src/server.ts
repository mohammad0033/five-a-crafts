// Core Angular and Node.js modules for SSR and server operations
import { APP_BASE_HREF } from '@angular/common'; // Token for setting the base href for the application
import { CommonEngine, isMainModule } from '@angular/ssr/node'; // Angular's engine for server-side rendering and a utility to check if the module is the main entry point
import express from 'express'; // The Express.js framework for building the server
import { dirname, join, resolve } from 'node:path'; // Node.js path utilities for working with file and directory paths
import { fileURLToPath } from 'node:url'; // Utility to convert file URLs to path strings
import bootstrap from './main.server'; // The server-specific bootstrap module for your Angular application
import cookieParser from 'cookie-parser'; // Middleware to parse cookies from incoming requests
import { readFileSync } from 'node:fs'; // Node.js file system module to read files synchronously
import { INITIAL_LANG } from './app/core/tokens/initial-lang.token'; // Custom Angular token to pass the initial language from server to client

// --- Custom Providers for SSR Translation ---
import { TranslateLoader } from '@ngx-translate/core'; // Import TranslateLoader
import { TranslateServerLoader } from './app/core/translate-loader/translate-server.loader'; // Your new server loader
import { SERVER_ASSETS_PATH } from './app/core/tokens/server-assets-path.token'; // Token for assets path

// +++ Import TransferState for passing data from server to client, and User model +++
import { TransferState, makeStateKey } from '@angular/core'; // Angular's TransferState for state transfer and makeStateKey for creating unique keys
import { User } from './app/features/auth/models/user'; // The User model definition

// +++ Define a unique key for storing the current user's state in TransferState +++
// This key will be used by both the server (to set) and the client (AuthService, to get)
const USER_STATE_KEY = makeStateKey<User | null>('currentUser');

// --- Path Setup ---
// Determines the directory of the current server file (e.g., /dist/your-project/server)
const serverDistFolder = dirname(fileURLToPath(import.meta.url));
// Resolves the path to the browser distribution folder (e.g., /dist/your-project/browser)
const browserDistFolder = resolve(serverDistFolder, '../browser');
// Path to the server-side version of index.html, which will be used as a template for SSR
const ssrIndexHtmlPath = join(serverDistFolder, 'index.server.html');

// --- Express App Initialization ---
const app = express(); // Creates an instance of an Express application
const commonEngine = new CommonEngine(); // Creates an instance of Angular's CommonEngine for rendering

// --- Middleware ---
app.use(cookieParser()); // Enables cookie parsing for all incoming requests

/**
 * API endpoints can be defined here, before static file serving or SSR.
 * This ensures API calls are handled directly and not passed to Angular's SSR.
 * Example:
 * app.get('/api/items', (req, res) => { res.json({ data: 'items' }); });
 */

/**
 * Serve static files (like .js, .css, images) from the /browser directory.
 * The '*.*' pattern targets requests with an extension, typically static assets.
 * This should come BEFORE the SSR handler for application routes.
 */
app.get(
  '*.*', // Matches requests that include a dot in the path, typically indicating a file extension
  express.static(browserDistFolder, {
    maxAge: '1y', // Cache static assets for 1 year
    // We don't set `index: 'index.html'` here because SSR will handle HTML for app routes.
  })
);

/**
 * Handle all other GET requests (application routes like '/', '/about', etc.)
 * by rendering the Angular application on the server.
 * This acts as a catch-all for non-static-asset GET requests.
 * // +++ Changed to an async function to allow 'await' for API calls (e.g., fetching user profile) +++
 */
app.get('*', async (req, res, next) => { // Make this handler async
  const { protocol, originalUrl, baseUrl, headers } = req; // Destructure request properties

  // --- Language Detection and Cookie Management ---
  const langCookieName = 'five-a-crafts-lang'; // Name of the cookie storing the language preference
  let requestLang = req.cookies[langCookieName]; // Attempt to get language from the cookie

  if (!requestLang) { // If no language cookie is found
    const acceptLang = req.headers['accept-language']; // Get the browser's preferred language from the 'accept-language' header
    if (acceptLang && acceptLang.startsWith('ar')) { // If header exists and prefers Arabic
      requestLang = 'ar';
    } else { // Default to English otherwise
      requestLang = 'en';
    }
    // Set the language cookie for future requests, making the preference persistent
    res.cookie(langCookieName, requestLang, { maxAge: 31536000000, path: '/' }); // maxAge is 1 year
  }
  // Determine text direction based on the language
  const requestDir = requestLang === 'ar' ? 'rtl' : 'ltr';

  // --- Prepare HTML Document for SSR ---
  // Read the content of the server-side index.html template
  let documentContent = readFileSync(ssrIndexHtmlPath, 'utf-8');

  // Modify the <html> tag in the template to set the correct 'lang' and 'dir' attributes
  // This ensures the initial HTML response has the correct language and direction.
  documentContent = documentContent.replace(
    /<html([^>]*)>/i, // Case-insensitive match for the <html> tag
    (match, existingAttributes) => {
      // Remove any pre-existing lang or dir attributes to avoid conflicts or duplication
      let newAttributes = existingAttributes
        .replace(/\s+lang="[^"]*"/i, '') // Case-insensitive removal
        .replace(/\s+dir="[^"]*"/i, '');  // Case-insensitive removal
      // Construct the new <html> tag with the determined language and direction
      return `<html lang="${requestLang}" dir="${requestDir}"${newAttributes}>`;
    }
  );

  // +++ Initialize a new TransferState instance for this specific request +++
  // This will hold any state we want to transfer from the server to the client.
  const transferState = new TransferState();

  // +++ Server-Side Authentication Check and User State Transfer +++
  try {
    // +++ Define the name of your authentication cookie (must match what your backend sets) +++
    const authTokenCookieName = 'your-auth-cookie-name'; // <<<<----- IMPORTANT: Replace with your actual auth cookie name
    // +++ Attempt to retrieve the authentication token from the request's cookies +++
    const authToken = req.cookies[authTokenCookieName];

    if (authToken) {
      // +++ If an auth token cookie is found, attempt to validate it and fetch user details +++
      // This typically involves making a server-to-server call to your backend API's user profile/status endpoint.
      // Ensure your API server and SSR server can communicate (e.g., correct URLs, not blocked by firewalls).
      // Modern Node.js (v18+) has 'fetch' built-in. For older versions, you might need 'node-fetch' or 'axios'.
      try {
        // +++ Define the URL for your backend API endpoint that returns user details based on the token/cookie +++
        const profileApiUrl = 'http://localhost:8000/api/user/profile/'; // <<<<----- IMPORTANT: Replace with your actual API endpoint

        // +++ Make the API call, forwarding the authentication cookie +++
        // The 'Cookie' header is manually constructed here to pass the specific auth token.
        const response = await fetch(profileApiUrl, {
          headers: {
            'Cookie': `${authTokenCookieName}=${authToken}`
            // Add any other headers your API might require for server-to-server communication
          }
        });

        if (response.ok) {
          // +++ If the API call is successful and returns user data +++
          const user: User = await response.json();
          // +++ Store the fetched user object in TransferState using the predefined key +++
          // This makes the user data available to the Angular app during SSR and for client-side hydration.
          transferState.set(USER_STATE_KEY, user);
        } else {
          // +++ If the API call fails (e.g., token invalid, API error), log a warning +++
          console.warn(`SSR: Auth token found but profile fetch failed with status ${response.status}. User will be treated as unauthenticated for this render.`);
          // +++ Set user state to null in TransferState, indicating no authenticated user +++
          transferState.set(USER_STATE_KEY, null);
        }
      } catch (apiError) {
        // +++ If there's an error during the API call itself (e.g., network issue) +++
        console.error('SSR: Error calling profile API to fetch user details:', apiError);
        // +++ Set user state to null in TransferState as a fallback +++
        transferState.set(USER_STATE_KEY, null);
      }
    } else {
      // +++ If no authentication token cookie is found in the request +++
      // +++ Set user state to null in TransferState, indicating an unauthenticated user for this render +++
      transferState.set(USER_STATE_KEY, null);
    }
  } catch (error) {
    // +++ Catch any unexpected errors during the server-side authentication check +++
    console.error('SSR: Unexpected error during authentication pre-check:', error);
    // +++ Ensure user state is set to null in TransferState as a safe fallback +++
    transferState.set(USER_STATE_KEY, null);
  }

  // --- Angular SSR Rendering ---
  commonEngine
    .render({
      bootstrap, // The server-side application bootstrap module
      document: documentContent, // The modified HTML template string
      url: `${protocol}://${headers.host}${originalUrl}`, // The full URL of the incoming request
      publicPath: browserDistFolder, // Path to browser distribution files (for resolving assets)
      providers: [ // Providers available to the Angular application during server-side rendering
        { provide: APP_BASE_HREF, useValue: baseUrl }, // Provides the base URL of the application
        { provide: INITIAL_LANG, useValue: requestLang }, // Provides the detected language to the Angular app
        { provide: SERVER_ASSETS_PATH, useValue: browserDistFolder },
        { provide: TranslateServerLoader, useClass: TranslateServerLoader },
        { provide: TranslateLoader, useExisting: TranslateServerLoader },
        // +++ Provide the populated TransferState instance to Angular's dependency injection system +++
        // This makes the 'transferState' (which may contain the user data) available to services like AuthService
        // when they are instantiated on the server during the rendering process.
        { provide: TransferState, useValue: transferState }
      ],
    })
    .then((html) => res.send(html)) // Send the rendered HTML back to the client
    .catch((err) => {
      console.error('SSR Error:', err); // Log any SSR errors
      next(err); // Pass the error to the next error handler in Express
    });
});

// --- Server Startup ---
/**
 * Start the Express server if this script is executed directly (not imported as a module).
 */
if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000; // Use port from environment variable or default to 4000
  app.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}
