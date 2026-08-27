import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import EditorPage from './pages/EditorPage';
import ConverterPage from './pages/ConverterPage';
import MetadataPage from './pages/MetadataPage';
import BatchPage from './pages/BatchPage';
import PlaygroundPage from './pages/PlaygroundPage';
import DocsPage from './pages/DocsPage';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/editor" element={<EditorPage />} />
            <Route path="/converter" element={<ConverterPage />} />
            <Route path="/metadata" element={<MetadataPage />} />
            <Route path="/batch" element={<BatchPage />} />
            <Route path="/playground" element={<PlaygroundPage />} />
            <Route path="/docs" element={<DocsPage />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
