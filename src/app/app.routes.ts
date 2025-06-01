import { Routes } from '@angular/router';
import {homePageMetaResolver} from './features/home/resolver/home-page-meta.resolver';
import {aboutPageMetaResolver} from './features/about/resolver/about-page-meta.resolver';
import {categoriesPageMetaResolver} from './features/categories/reslover/categories-page-meta.resolver';
import {contactPageMetaResolver} from './features/contact/reslover/contact-page-meta.resolver';
import {productDetailsResolver} from './features/product-details/resolver/product-details.resolver';
import {profileResolver} from './features/profile/resolvers/profile.resolver';
import {orderDetailsResolver} from './features/profile/resolvers/order-details.resolver';
import {productsPageMetaResolver} from './features/products/resolver/products-page-meta.resolver';
import {authGuard} from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./core/components/container/container.component').then((m) => m.ContainerComponent),
    children: [
      {
        path: '', // This is the home route
        loadComponent: () =>
          import('./features/home/components/container/home.component').then(
            (m) => m.HomeComponent
          ),
        // Add the resolve property here
        resolve: {
          // 'metaData' is the key you'll use in HomeComponent to access the resolved data
          metaData: homePageMetaResolver
        },
        // (Optional but Recommended) Add static fallbacks for title and description
        // These are used by Angular TitleStrategy, and potentially if the resolver fails catastrophically
        title: 'Five A Crafts | Artisan Handcrafted & Sustainable Goods', // Fallback title
        data: {
          // Fallback description (can be accessed via route.snapshot.data['description'])
          description: 'Discover Five A Crafts – an e-commerce platform dedicated to artisan-crafted,' +
            ' sustainable goods.' + ' Shop unique, handcrafted items that bring warmth to your home and heart.',
          requiresAuth: false
        },
        canActivate: [authGuard] // <<<< APPLY THE GUARD HERE
      },
      {
        path: 'about',
        loadComponent: () =>
          import('./features/about/components/container/about.component').then(
            (m) => m.AboutComponent),
        resolve: {
          metaData: aboutPageMetaResolver
        },
        title: 'About Us | Five A Crafts',
        data: {
          description: 'Learn more about the story, mission, and values of Five A Crafts.'
        }
      },
      {
        path: 'categories', // Category route
        loadComponent: () =>
          import('./features/categories/components/container/categories.component').then(
            (m) => m.CategoriesComponent),
        // 2. Add resolver and static fallbacks
        resolve: {
          metaData: categoriesPageMetaResolver // Use the category resolver
        },
        title: 'Product Categories | Five A Crafts', // Static fallback title
        data: {
          // Static fallback description
          description: 'Explore all product categories offered by Five A Crafts.'
        }
      },
      {
        path: 'category/:categorySlug', // Category route
        loadComponent: () =>
          import('./features/products/components/container/products.component').then(
            (m) => m.ProductsComponent),
        // 2. Add resolver and static fallbacks
        resolve: {
          metaData: productsPageMetaResolver // Use the product resolver
        },
        title: 'Products | Five A Crafts', // Static fallback title
        data: {
          // Static fallback description
          description: 'Explore all products offered by Five A Crafts.'
        }
      },
      {
        path: 'products/:productSlug', // Product details route
        loadComponent: () =>
          import('./features/product-details/components/container/product-details.component').then(
            (m) => m.ProductDetailsComponent),
        // 2. Use the new resolver and update the key
        resolve: {
          // Use a key like 'productData' to reflect the full data
          productData: productDetailsResolver
        },
        // Static fallbacks remain useful for initial title strategy / catastrophic errors
        title: 'Product Details | Five A Crafts',
        data: {
          description: 'View details for products available at Five A Crafts.'
        }
      },
      {
        path: 'contact', // Contact route
        loadComponent: () =>
          import('./features/contact/components/container/contact.component').then(
            (m) => m.ContactComponent),
        // 2. Add resolver and static fallbacks
        resolve: {
          metaData: contactPageMetaResolver // Use the contact resolver
        },
        title: 'Contact Us | Five A Crafts', // Static fallback title
        data: {
          // Static fallback description
          description: 'Get in touch with Five A Crafts for support or inquiries.'
        }
      },{
        path: 'favorites',
        loadComponent: () =>
          import('./features/favorites/components/container/favorites.component').then(
            (m) => m.FavoritesComponent
          ),
        // Add static title for UX
        title: 'Your Favorites | Five A Crafts',
        canActivate: [authGuard],
        data: {
          requiresAuth: true // Mark this as requiring authentication
        }
        // No resolver needed
        // No static description needed in data
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/components/container/profile.component').then(
            (m) => m.ProfileComponent
          ),
        // Add static title for UX
        title: 'Your Profile | Five A Crafts',
        resolve: {
          profilePageData: profileResolver // Use a descriptive key
        },
        canActivate: [authGuard],
        data: {
          requiresAuth: true // Mark this as requiring authentication
        },
        children: [
          {
            path: '',
            redirectTo: 'info',
            pathMatch: 'full'
          },
          {
            path: 'info',
            loadComponent: () =>
              import('./features/profile/components/user-info/user-info.component').then(
                (m) => m.UserInfoComponent
              ),
            // Add static title for UX
            title: 'Your Info | Five A Crafts'
            // No resolver needed
          },
          {
            path: 'addresses',
            loadComponent: () =>
              import('./features/profile/components/user-addresses/user-addresses.component').then(
                (m) => m.UserAddressesComponent
              ),
            // Add static title for UX
            title: 'Your Addresses | Five A Crafts'
            // No resolver needed
          },
          {
            path: 'change-password',
            loadComponent: () =>
              import('./features/profile/components/change-password/change-password.component').then(
                (m) => m.ChangePasswordComponent
              ),
            // Add static title for UX
            title: 'Change Password | Five A Crafts'
            // No resolver needed
          },
          {
          path: 'orders',
          loadComponent: () =>
            import('./features/profile/components/user-orders/user-orders.component').then(
              (m) => m.UserOrdersComponent
            ),
          // Add static title for UX
          title: 'Your Orders | Five A Crafts'
          // No resolver needed
          },
          {
            // Add the order details route as a child of profile
            path: 'orders/:orderSlug', // Use a parameter for the slug
            loadComponent: () =>
              import('./features/profile/components/order-details/order-details.component').then(
                (m) => m.OrderDetailsComponent
              ),
            title: 'Order Details | Five A Crafts', // Dynamic title can be set in component or resolver
            resolve: {
              // Add a resolver specifically for fetching the details of this order
              orderDetails: orderDetailsResolver
            }
          }
        ]
      },
      {
        path: 'cart',
        loadComponent: () =>
          import('./features/cart/components/container/cart.component').then(
            (m) => m.CartComponent
          ),
        // Add static title for UX
        title: 'Your Cart | Five A Crafts'
        // No resolver needed
      },
      {
        path: 'checkout',
        loadComponent: () =>
          import('./features/checkout/components/container/checkout.component').then(
            (m) => m.CheckoutComponent
          ),
        // Add static title for UX
        title: 'Your Checkout | Five A Crafts'
        // No resolver needed
      },
    ]
  },
  {
    path: 'loading', // Your loading route
    loadComponent: () =>
      import('./core/components/loading/loading.component').then((m) => m.LoadingComponent), // Example path
    title: 'Loading | Five A Crafts'
  },
  {
    path: 'not-found', // Your 404 route
    loadComponent: () =>
      import('./core/components/not-found/not-found.component').then((m) => m.NotFoundComponent), // Example path
    title: 'Page Not Found | Five A Crafts'
  },
  {
    path: '**',
    redirectTo: 'not-found',
  }
];
