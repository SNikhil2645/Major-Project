import { MockInterview } from '../models/MockInterview';
import { AppError } from '../utils/AppError';

const QUESTION_BANK: Record<string, string[]> = {
  'software-developer': [
    'Explain the difference between let, const, and var in JavaScript.',
    'What is the time complexity of binary search? Explain your answer.',
    'Describe the concept of RESTful APIs and their principles.',
    'What is hoisting in JavaScript? Give an example.',
    'Explain the difference between SQL and NoSQL databases.',
    'What is the event loop in Node.js?',
    'Describe the MVC architecture pattern.',
    'What are React hooks? Explain useState and useEffect.',
    'What is a closure in JavaScript? Provide an example.',
    'Explain the concept of ACID properties in databases.',
  ],
  'cloud-support-engineer': [
    'What is the difference between scalability and elasticity in cloud computing?',
    'Explain the shared responsibility model in AWS.',
    'What is a VPC? How does it work?',
    'Describe the difference between vertical and horizontal scaling.',
    'What is cloud computing? Explain its deployment models.',
    'How would you troubleshoot a server that is not responding?',
    'What is load balancing? How does it work?',
    'Explain the difference between a public and private subnet.',
    'What is an auto-scaling group?',
    'Describe the steps to migrate an on-premise application to the cloud.',
  ],
  'data-analyst': [
    'What is the difference between correlation and causation?',
    'Explain the steps in the data analysis process.',
    'What is SQL? Write a query to find duplicate records in a table.',
    'Describe the difference between structured and unstructured data.',
    'What is a pivot table? How is it useful?',
    'Explain the concept of data normalization.',
    'What is the difference between a bar chart and a histogram?',
    'How do you handle missing data in a dataset?',
    'What is the central limit theorem?',
    'Explain the difference between descriptive and inferential statistics.',
  ],
  'full-stack-developer': [
    'Explain how the MERN stack works together.',
    'What is CORS? How do you handle it?',
    'Describe authentication vs authorization in web applications.',
    'What is the difference between client-side and server-side rendering?',
    'How does JWT authentication work?',
    'What is a RESTful API? Design a simple API for a blog application.',
    'Explain the concept of middleware in Express.js.',
    'What is state management in React? Compare Context API and Redux.',
    'How do you optimize a web application for performance?',
    'Describe a CI/CD pipeline and its benefits.',
  ],
};

const ROLES = Object.keys(QUESTION_BANK);

export async function startInterview(userId: string, role: string, totalQuestions = 5) {
  if (!ROLES.includes(role)) throw new AppError(`Invalid role: ${role}`, 400);

  const questions = QUESTION_BANK[role]
    .sort(() => Math.random() - 0.5)
    .slice(0, totalQuestions)
    .map((q) => ({ question: q }));

  const interview = await MockInterview.create({
    userId,
    role,
    questions,
    totalQuestions,
    currentQuestion: 0,
  });

  return interview;
}

export async function submitAnswer(interviewId: string, userId: string, answer: string) {
  const interview = await MockInterview.findOne({ _id: interviewId, userId });
  if (!interview) throw new AppError('Interview not found', 404);
  if (interview.status === 'completed') throw new AppError('Interview already completed', 400);

  const idx = interview.currentQuestion;
  if (idx >= interview.questions.length) throw new AppError('No more questions', 400);

  const question = interview.questions[idx];
  question.answer = answer;

  const wordCount = answer.split(/\s+/).length;
  const technicalKeywords = ['code', 'function', 'data', 'database', 'api', 'server', 'client', 'algorithm', 'system', 'design', 'architecture', 'security', 'performance', 'test', 'deploy'];
  const foundKeywords = technicalKeywords.filter((kw) => answer.toLowerCase().includes(kw));

  let score = Math.min(10, Math.max(1, Math.round(wordCount / 15)));
  if (foundKeywords.length > 3) score = Math.min(10, score + 2);
  if (wordCount < 10) score = Math.max(1, score - 2);

  const feedback = score >= 7
    ? 'Good answer! You covered key concepts well.'
    : score >= 4
      ? 'Decent answer. Try to include more technical details and examples.'
      : 'Your answer is brief. Elaborate more with specific examples and technical depth.';

  question.evaluation = {
    score,
    feedback,
    technicalAccuracy: Math.min(10, foundKeywords.length + 3),
    communication: Math.min(10, Math.round(wordCount / 20) + 3),
  };

  interview.currentQuestion = idx + 1;

  if (interview.currentQuestion >= interview.questions.length) {
    interview.status = 'completed';
    const totalScore = interview.questions.reduce((s, q) => s + (q.evaluation?.score || 0), 0);
    interview.overallScore = Math.round((totalScore / (interview.questions.length * 10)) * 100);
    interview.completedAt = new Date();
  }

  await interview.save();
  return interview;
}

export async function getCurrentQuestion(interviewId: string, userId: string) {
  const interview = await MockInterview.findOne({ _id: interviewId, userId });
  if (!interview) throw new AppError('Interview not found', 404);

  if (interview.status === 'completed') {
    return { interview, currentQuestion: null, isComplete: true };
  }

  const question = interview.questions[interview.currentQuestion];
  return {
    interview,
    currentQuestion: {
      index: interview.currentQuestion,
      total: interview.totalQuestions,
      question: question.question,
    },
    isComplete: false,
  };
}

export async function getInterviewById(interviewId: string, userId: string) {
  const interview = await MockInterview.findOne({ _id: interviewId, userId });
  if (!interview) throw new AppError('Interview not found', 404);
  return interview;
}

export async function getInterviewsByUser(userId: string) {
  return MockInterview.find({ userId }).sort({ createdAt: -1 }).lean();
}
