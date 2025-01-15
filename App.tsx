import React from 'react';
import { DndProvider } from 'react-dnd';  
import { HTML5Backend } from 'react-dnd-html5-backend';  
import Calendar from './components/Calendar/Calendar';  
import './App.css';

function App() {
  return (
    <DndProvider backend={HTML5Backend}> 
      <Calendar />
    </DndProvider>
  );
}

export default App;