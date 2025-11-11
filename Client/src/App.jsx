
import { RouterProvider } from 'react-router-dom'
import { routes } from './routes/routes'
import ErrorBoundary from './components/ErrorBoundary'


function App() {
  
  return (
    <ErrorBoundary>
      
        <RouterProvider router = {routes}/>
       
    </ErrorBoundary>
  )
}

export default App
