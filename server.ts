import express from 'express';
import { createServer as createViteServer } from 'vite';
import { createServer } from 'http';
import { Server } from 'socket.io';
import multer from 'multer';
import cors from 'cors';
import path from 'path';

const upload = multer({ storage: multer.memoryStorage() });

async function startServer() {
  const app = express();
  const PORT = 3000;
  const httpServer = createServer(app);
  
  // Setup Socket.IO
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
    }
  });

  app.use(cors());
  app.use(express.json({ limit: '10mb' }));

  // In-memory state for exams and students
  const exams = new Map();
  const sessions = new Map();

  // API Routes
  app.post('/api/create-exam', (req, res) => {
    const { questions, method } = req.body;
    // Generate a 6-character alphanumeric code
    const examId = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    exams.set(examId, {
      id: examId,
      method,
      questions,
      createdAt: Date.now()
    });
    
    res.json({ success: true, examId });
  });

  app.get('/api/exam/:id', (req, res) => {
    const examId = req.params.id.toUpperCase();
    const exam = exams.get(examId);
    
    if (exam) {
      res.json({ success: true, exam });
    } else {
      res.status(404).json({ success: false, error: 'Mã đề thi không tồn tại' });
    }
  });

  app.post('/api/upload-exam', upload.single('file'), (req, res) => {
    // Mock processing of Word/PDF/HTML
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // In a real app, parse the file based on mimetype
    // For now, return a success with mock parsed questions
    res.json({
      success: true,
      message: `File ${file.originalname} processed successfully.`,
      // Mock questions would be extracted here
    });
  });

  // Socket.IO Logic
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join_exam', ({ examId, studentName, profile }) => {
      socket.join(`exam_${examId}`);
      
      if (!sessions.has(examId)) {
        sessions.set(examId, new Map());
      }
      
      const examSession = sessions.get(examId);
      examSession.set(socket.id, {
        id: socket.id,
        name: studentName,
        className: profile?.className || '',
        school: profile?.school || '',
        score: 0,
        progress: 0,
        answers: {},
        isFinished: false
      });

      // Notify teacher
      io.to(`teacher_${examId}`).emit('student_joined', Array.from(examSession.values()));
    });

    socket.on('submit_answer', ({ examId, questionId, isCorrect, points }) => {
      const examSession = sessions.get(examId);
      if (examSession && examSession.has(socket.id)) {
        const student = examSession.get(socket.id);
        student.progress += 1;
        if (isCorrect) {
          student.score += points;
        }
        student.answers[questionId] = isCorrect;
        
        // Notify teacher of update
        io.to(`teacher_${examId}`).emit('student_updated', Array.from(examSession.values()));
      }
    });

    socket.on('finish_exam', ({ examId, timeSpent }) => {
      const examSession = sessions.get(examId);
      if (examSession && examSession.has(socket.id)) {
        const student = examSession.get(socket.id);
        student.isFinished = true;
        student.timeSpent = timeSpent;
        
        // Notify teacher of update
        io.to(`teacher_${examId}`).emit('student_updated', Array.from(examSession.values()));
      }
    });

    socket.on('teacher_join', ({ examId }) => {
      socket.join(`teacher_${examId}`);
      const examSession = sessions.get(examId);
      if (examSession) {
        socket.emit('initial_state', Array.from(examSession.values()));
      } else {
        socket.emit('initial_state', []);
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      // Handle cleanup if necessary
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
