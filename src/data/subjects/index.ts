import { SubjectConfig, SubjectId } from '../../types/subject';

export const SUBJECTS_REGISTRY: SubjectConfig[] = [
  {
    id: 'english',
    name: 'Tiếng Anh 8',
    shortName: 'Tiếng Anh',
    subtitle: 'Global Success • Từ vựng, Ngữ âm, Ngữ pháp & Luyện đề',
    badge: 'Global Success',
    themeColor: 'indigo',
    defaultRoute: '#/dashboard',
    practiceRoute: '#/unit/unit-1/vocab',
    practiceLabel: '12 Unit',
    enabledModules: [
      'vocab_flashcard',
      'games_2d',
      'chapter_quiz',
      'timed_exams',
      'mistakes',
    ],
  },
  {
    id: 'math',
    name: 'Toán 8',
    shortName: 'Toán',
    subtitle: 'Kết nối tri thức • Công thức, Định lý & Giải bài từng bước',
    badge: 'Kết nối tri thức',
    themeColor: 'blue',
    defaultRoute: '#/dashboard',
    practiceRoute: '#/math',
    practiceLabel: 'Chương & Công Thức',
    enabledModules: [
      'math_formulas',
      'math_short_answer',
      'chapter_quiz',
      'timed_exams',
      'mistakes',
    ],
  },
  {
    id: 'science',
    name: 'KHTN 8',
    shortName: 'KHTN',
    subtitle: 'Kết nối tri thức • Tích hợp Hóa học, Vật lí & Sinh học',
    badge: 'Kết nối tri thức',
    themeColor: 'emerald',
    defaultRoute: '#/dashboard',
    practiceRoute: '#/science',
    practiceLabel: 'Hóa • Lí • Sinh',
    enabledModules: [
      'science_branches',
      'science_reference',
      'chapter_quiz',
      'timed_exams',
      'mistakes',
    ],
  },
];

export function getSubjectConfig(id: SubjectId): SubjectConfig {
  return SUBJECTS_REGISTRY.find(s => s.id === id) || SUBJECTS_REGISTRY[0];
}
