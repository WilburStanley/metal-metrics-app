import './App.css';
import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Dashboard } from './layout/Dashboard';
import { Navbar } from './layout/Navbar';
import { Footer } from './layout/Footer';
import { NewsPage } from './layout/Newspage';
import { type MetalData } from './data/metals';
import { ScrollToTop } from './components/ScrollToTop';

const App = () => {
  const [activeMetal, setActiveMetal] = useState<MetalData | null>(null);

  return (
    <BrowserRouter>
    <ScrollToTop />
      <Navbar />
        <Routes>
          <Route path="/" element={<Dashboard activeMetal={activeMetal} setActiveMetal={setActiveMetal} />} />
          <Route path="/news" element={<NewsPage activeMetal={activeMetal} />} />
        </Routes>
      <Footer />
    </BrowserRouter>
  );
};

export default App;