import { TutorialQuest } from '../../contexts/TutorialContext';

export const TUTORIALS: TutorialQuest[] = [
  {
    id: 'blinking-led',
    title: 'Project Alpha: Blinking LED',
    difficulty: 'beginner',
    steps: [
      {
        id: 'add-arduino',
        title: 'The Brain',
        instructions: 'Add an Arduino Uno to your workspace from the Asset Manager.',
        mentorTip: 'The Arduino Uno is the most common microcontroller for beginners. It will act as the brain of our circuit.',
        targetElementId: 'inventory-btn',
        condition: (state) => state.diagram?.components.some(c => c.name.toLowerCase().includes('arduino')) ?? false
      },
      {
        id: 'add-led',
        title: 'The Light',
        instructions: 'Now add an LED to the workspace.',
        mentorTip: 'LEDs (Light Emitting Diodes) only allow current to flow in one direction. The longer leg is the positive side (Anode).',
        condition: (state) => state.diagram?.components.some(c => c.type === 'actuator' && c.name.toLowerCase().includes('led')) ?? false
      },
      {
        id: 'add-resistor',
        title: 'The Protection',
        instructions: 'Add a Resistor to prevent the LED from burning out.',
        mentorTip: 'Without a resistor, the LED would draw too much current and release its "magic smoke". A 220-330 Ohm resistor is perfect here.',
        condition: (state) => state.diagram?.components.some(c => c.name.toLowerCase().includes('resistor')) ?? false
      },
      {
        id: 'connect-logic',
        title: 'Logical Link',
        instructions: 'Connect Arduino Pin 13 to one side of the Resistor.',
        mentorTip: 'Pin 13 on the Arduino has a built-in LED on the board, making it the perfect output for testing.',
        condition: (state) => {
          if (!state.diagram) return false;
          return state.diagram.connections.some(conn => 
            (conn.fromPin === '13' && state.diagram?.components.find(c => c.id === conn.toComponentId)?.name.toLowerCase().includes('resistor')) ||
            (conn.toPin === '13' && state.diagram?.components.find(c => c.id === conn.fromComponentId)?.name.toLowerCase().includes('resistor'))
          );
        }
      }
    ]
  }
];
