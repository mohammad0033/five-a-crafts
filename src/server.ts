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
 */
app.get('*', (req, res, next) => { // Changed from '**' to '*' for better clarity and to ensure it's the catch-all after static assets
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
        // Provide the path to the browser assets for the TranslateServerLoader.
        // Your i18n files (e.g., en.json, ar.json) are in 'dist/five-a-crafts/browser/i18n/'
        // because 'public/i18n/' is copied to the root of 'browserDistFolder'.
        { provide: SERVER_ASSETS_PATH, useValue: browserDistFolder },
        // Explicitly provide TranslateServerLoader using its own class as the token and implementation.
        // This ensures Angular knows how to create and inject TranslateServerLoader.
        { provide: TranslateServerLoader, useClass: TranslateServerLoader },
        // Now, when TranslateLoader is requested, use the existing instance of TranslateServerLoader.
        { provide: TranslateLoader, useExisting: TranslateServerLoader }
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
