import adminRoutes from './src/admin/route/routes.js';
import favourateRoutes from './src/favourate_stories&categories/route/routes.js';
import searchRoute from "./src/search/route/routes.js";
import story from './src/story/route/routes.js';
import categoriesRoutes from './src/story_categories/route/routes.js';
import userRoutes from './src/user/route/routes.js';
console.log("✅ Loading admin routes...");
export default [
  // Define your routes here
   {
    path: '/admin',
    handler: adminRoutes
   },
   {
    path: '/user',
    handler: userRoutes
   },
   {
      path: '/favourate',
      handler: favourateRoutes
   },
   {
    path: '/categories',
    handler: categoriesRoutes
   },
   {
      path:'/story',
      handler:story
   },
   {
      path:'/searching',
      handler:searchRoute
   }
  ];
