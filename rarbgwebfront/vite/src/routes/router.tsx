import { createBrowserRouter } from 'react-router-dom';
import Notfound from '../pages/notfound';
import Searchpage from '../pages/searchpage';

const Router = createBrowserRouter([
  { path: '/', element: <Searchpage /> },
  { path: '/404', element: <Notfound /> },
  { path: '*', element: <Notfound /> },
]);

export default Router;