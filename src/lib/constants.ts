import { Section, Question } from './types';

export const SECTIONS: Section[] = [
  { name: 'Physics', questionCount: 25, startId: 1 },
  { name: 'Chemistry', questionCount: 20, startId: 26 },
  { name: 'Mathematics', questionCount: 40, startId: 46 },
  { name: 'English', questionCount: 5, startId: 86 },
  { name: 'Quantitative Aptitude', questionCount: 10, startId: 91 },
];

export const MOCK_QUESTIONS: Question[] = Array.from({ length: 100 }, (_, i) => {
  const id = i + 1;
  let section = '';
  if (id <= 25) section = 'Physics';
  else if (id <= 45) section = 'Chemistry';
  else if (id <= 85) section = 'Mathematics';
  else if (id <= 90) section = 'English';
  else section = 'Quantitative Aptitude';

  // Specific question from the image
  if (id === 35) {
    return {
      id,
      number: id,
      section,
      text: 'What is the volume of KCl required to prepare 100 mL of 0.04 M KCl from 0.2 M KCl solution?',
      options: [
        { id: 'A', text: '20 mL' },
        { id: 'B', text: '5 mL' },
        { id: 'C', text: '1 mL' },
        { id: 'D', text: '2.5 mL' },
      ],
    };
  }

  if (id === 46) {
    return {
      id,
      number: id,
      section,
      text: 'The co-ordinates of the point where the line through the points A (2, 3, 1) and B (4, -5, 3) crosses xy-plane are',
      options: [
        { id: 'A', text: '(3, 7/2, 0)' },
        { id: 'B', text: '(-3, -7/2, 0)' },
        { id: 'C', text: '(3, -7/2, 0)' },
        { id: 'D', text: '(5, 4, 0)' },
      ],
    };
  }

  return {
    id,
    number: id,
    section,
    text: `Sample Question ${id} for ${section} section. This is a placeholder for the actual question content.`,
    options: [
      { id: 'A', text: 'Option A' },
      { id: 'B', text: 'Option B' },
      { id: 'C', text: 'Option C' },
      { id: 'D', text: 'Option D' },
    ],
  };
});

export const INITIAL_TIME = 180 * 60; // 3 hours in seconds
