import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, X, Send, User, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { chatWithTutor } from '../../services/ai';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '../../utils/cn';

interface Message {
  role: 'user' | 'model';
  text: string;
}

export default function AITutorChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Chào em! Thầy/cô là Gia sư AI Địa lý. Em có câu hỏi hay khái niệm nào cần giải đáp không?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const response = await chatWithTutor(userMessage, messages);
      setMessages(prev => [...prev, { role: 'model', text: response || 'Lỗi phản hồi.' }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: 'Rất xin lỗi, hệ thống AI đang gặp sự cố kết nối. Vui lòng thử lại sau!' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-emerald-600 text-white rounded-full shadow-xl flex items-center justify-center hover:bg-emerald-700 transition-colors z-50 group border-4 border-white"
        >
          <Bot className="w-8 h-8 group-hover:scale-110 transition-transform" />
          <span className="absolute -top-2 -right-2 w-5 h-5 bg-rose-500 rounded-full border-2 border-white animate-pulse" />
        </motion.button>
      )}

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 w-[380px] h-[600px] max-h-[85vh] max-w-[calc(100vw-3rem)] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-emerald-600 p-4 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Sparkles className="w-6 h-6 text-emerald-50" />
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight">Gia sư Địa lý AI</h3>
                  <div className="flex items-center gap-1.5 text-emerald-100 text-xs mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                    Trực tuyến hỗ trợ 24/7
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Warning Banner */}
            <div className="bg-amber-50 border-b border-amber-100 p-2.5 flex items-center gap-2 text-[11px] text-amber-800 shrink-0">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              AI có thể cung cấp thông tin không chính xác. Hãy luôn kiểm chứng.
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
              {messages.map((msg, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex gap-3 max-w-[90%]",
                    msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                  )}
                >
                  <div className={cn(
                    "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center self-end mb-1",
                    msg.role === 'user' ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"
                  )}>
                    {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                  </div>
                  
                  <div className={cn(
                    "p-3.5 rounded-2xl md:text-sm text-[15px] leading-relaxed",
                    msg.role === 'user' ? "bg-blue-600 text-white rounded-br-sm" : "bg-white border border-slate-200 shadow-sm text-slate-800 rounded-bl-sm markdown-body prose-sm max-w-none"
                  )}>
                    <Markdown remarkPlugins={[remarkGfm]}>{msg.text}</Markdown>
                  </div>
                </motion.div>
              ))}
              
              {isLoading && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3 max-w-[85%] mr-auto"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center self-end mb-1">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm text-slate-800 rounded-bl-sm flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                    <span className="text-sm text-slate-500 font-medium">Đang suy nghĩ...</span>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-100 shrink-0">
              <div className="relative flex items-center">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Hãy hỏi bất kỳ câu hỏi nào..."
                  className="w-full pl-4 pr-12 py-3 bg-slate-100 border-none rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none h-[52px] max-h-[120px] text-sm overflow-hidden placeholder:text-slate-400"
                  rows={1}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 p-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <div className="text-center mt-2">
                <span className="text-[10px] text-slate-400">Trợ lý ảo được hỗ trợ bởi Gemini</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
