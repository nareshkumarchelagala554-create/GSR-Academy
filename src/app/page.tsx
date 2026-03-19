"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  Bookmark,
  Info,
  Menu,
  X,
  ChevronDown,
  User,
  Settings
} from 'lucide-react';
import { SECTIONS, MOCK_QUESTIONS, INITIAL_TIME } from '@/src/lib/constants';
import { QuestionStatus, ExamState, Question, Section } from '@/src/lib/types';
import { useRouter } from 'next/navigation';

export default function ExamPage() {
  console.log("ExamPage rendered");
  const router = useRouter();
  const [state, setState] = useState<ExamState>(() => {
    const initialStatuses: Record<number, QuestionStatus> = {};
    MOCK_QUESTIONS.forEach(q => {
      initialStatuses[q.id] = 'not-visited';
    });
    initialStatuses[1] = 'not-answered';

    return {
      currentQuestionId: 46, // Start at Q46 as in the new image
      answers: {},
      statuses: initialStatuses,
      timeLeft: 12 * 60 + 34, // 00:12:34 as in the image
    };
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showSectionSummary, setShowSectionSummary] = useState<Section | null>(null);
  const [showFinalSummary, setShowFinalSummary] = useState(false);

  // Timer logic
  useEffect(() => {
    const timer = setInterval(() => {
      setState(prev => ({
        ...prev,
        timeLeft: Math.max(0, prev.timeLeft - 1),
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentQuestion = useMemo(() =>
    MOCK_QUESTIONS.find(q => q.id === state.currentQuestionId) || MOCK_QUESTIONS[0],
    [state.currentQuestionId]
  );

  const currentSection = useMemo(() =>
    SECTIONS.find(s => currentQuestion.id >= s.startId && currentQuestion.id < s.startId + s.questionCount) || SECTIONS[0],
    [currentQuestion]
  );

  const handleOptionSelect = (optionId: string) => {
    setState(prev => ({
      ...prev,
      answers: { ...prev.answers, [prev.currentQuestionId]: optionId },
      statuses: {
        ...prev.statuses,
        [prev.currentQuestionId]: prev.statuses[prev.currentQuestionId] === 'marked' ? 'answered-marked' : 'answered'
      }
    }));
  };

  const handleNavigate = (id: number) => {
    setState(prev => {
      const newStatuses = { ...prev.statuses };
      if (newStatuses[id] === 'not-visited') {
        newStatuses[id] = 'not-answered';
      }
      return {
        ...prev,
        currentQuestionId: id,
        statuses: newStatuses
      };
    });
    setShowSectionSummary(null);
  };

  const handleMarkForReview = () => {
    setState(prev => {
      const hasAnswer = !!prev.answers[prev.currentQuestionId];
      let newStatus: QuestionStatus = hasAnswer ? 'answered-marked' : 'marked';
      return {
        ...prev,
        statuses: { ...prev.statuses, [prev.currentQuestionId]: newStatus }
      };
    });
  };

  const handleClearResponse = () => {
    setState(prev => {
      const newAnswers = { ...prev.answers };
      delete newAnswers[prev.currentQuestionId];
      return {
        ...prev,
        answers: newAnswers,
        statuses: { ...prev.statuses, [prev.currentQuestionId]: 'not-answered' }
      };
    });
  };

  const handleSaveNext = () => {
    const nextId = state.currentQuestionId + 1;
    if (nextId <= MOCK_QUESTIONS.length) {
      handleNavigate(nextId);
    }
  };

  const getStatusColor = (status: QuestionStatus) => {
    switch (status) {
      case 'answered': return 'bg-green-800 text-white border-green-500';
      case 'not-answered': return 'bg-red-800 text-white border-red-500';
      case 'marked': return 'bg-orange-500 text-white border-orange-500';
      case 'answered-marked': return 'bg-blue-500 text-white border-blue-500 relative after:content-[""] after:absolute after:bottom-0 after:right-0 after:w-2 after:h-2 after:bg-black after:rounded-sm';
      case 'not-visited': return 'bg-gray-200 text-slate-600 border-slate-300';
      default: return 'bg-gray-300 text-slate-600 border-slate-300';
    }
  };

  const getSectionStats = (sectionName: string) => {
    const sectionQuestions = MOCK_QUESTIONS.filter(q => q.section === sectionName);
    const counts = {
      'not-visited': 0,
      'not-answered': 0,
      'answered': 0,
      'marked': 0,
      'answered-marked': 0,
    };
    sectionQuestions.forEach(q => {
      counts[state.statuses[q.id]]++;
    });
    return counts;
  };

  const totalStats = useMemo(() => {
    const counts = {
      'not-visited': 0,
      'not-answered': 0,
      'answered': 0,
      'marked': 0,
      'answered-marked': 0,
    };
    Object.values(state.statuses).forEach(s => {
      counts[s as QuestionStatus]++;
    });
    return counts;
  }, [state.statuses]);

  return (
    <div className="h-screen bg-[#F8FAFC] text-slate-900 flex flex-col overflow-hidden select-none text-[14px]">
      {/* Watermark */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.03] flex flex-wrap gap-20 p-10 rotate-[-25deg] overflow-hidden">
        {Array.from({ length: 50 }).map((_, i) => (
          <span key={i} className="text-4xl font-bold tracking-widest">1014003302</span>
        ))}
      </div>

      {/* Header */}
      <header className="bg-[#d0e3f7] border-b border-gray-300 px-4 md:px-6 py-3 grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-0 items-center">
        {/* LEFT SECTION */}
        <div className="flex items-center gap-4 pr-6 border-r border-dotted border-gray-500">

          {/* Logo */}
          <div className="bg-[#8B1E1E] text-white px-4 py-[6px] rounded-sm flex flex-col leading-tight">
            <span className="text-lg font-bold tracking-wide">AMRITA</span>
            <span className="text-[9px] uppercase tracking-wide">
              SCHOOL OF ENGINEERING
            </span>
          </div>

          {/* Divider */}
          <div className="h-14 border-l border-dotted border-gray-500"></div>

          {/* Test Info */}
          <div className="flex flex-col justify-center">
            <p className="text-xs text-gray-600 font-bold uppercase">Test</p>
            <p className="text-sm font-bold text-gray-800">AEEE 2026</p>
          </div>

        </div>


        {/* CENTER SECTION */}
        <div className="flex flex-col items-center justify-center px-6 border-r h-14 border-dotted border-gray-500">
          <p className="text-sm text-gray-500 font-semibold uppercase">
            Current Section:
          </p>
          <p className="text-sm font-bold text-blue-700 capitalize">
            {currentSection.name}
          </p>
        </div>


        {/* RIGHT SECTION */}
        <div className="flex justify-end items-center gap-4 pl-6">

          {/* User Info */}
          <div className="text-right leading-tight">
            <p className="text-sm font-semibold text-gray-800">
              Krishna Vinay Charan
            </p>
            <p className="text-xs text-gray-500 font-medium">
              1014003302
            </p>
          </div>

          {/* Avatar */}
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center border border-gray-300">
            <User size={20} className="text-gray-500" />
          </div>

        </div>

      </header>
      <div className="flex items-end justify-end gap-8 mr-6 mb-6 py-2">

        {/* Timer */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-700">
            Remaining Time:
          </span>

          <div className="bg-white px-3 py-[2px] rounded border border-gray-300 shadow-sm">
            <span className="font-mono font-bold text-gray-800 text-sm">
              {formatTime(state.timeLeft)}
            </span>
          </div>
        </div>

        {/* Resources */}
        <div className="flex items-center gap-1 bg-white px-3 py-1 rounded border border-gray-300 cursor-pointer hover:bg-gray-100">
          <Settings size={14} />
          <span className="text-xs font-bold">Resources</span>
          <ChevronDown size={14} />
        </div>

        {/* Font Controls */}
        <div className="flex items-center gap-2 ml-4">
          <span className="text-blue-600 font-bold text-lg cursor-pointer">A</span>
          <span className="border px-1 text-sm cursor-pointer">A</span>
          <span className="text-gray-500 cursor-pointer">A</span>
        </div>

      </div>

      {/* Section Tabs */}
      <nav className="bg-white border-b border-slate-300 px-6 flex items-center gap-1 z-40 relative">
        {SECTIONS.map((section) => (
          <div
            key={section.name}
            className="relative group"
            onMouseEnter={() => setShowSectionSummary(section)}
            onMouseLeave={() => setShowSectionSummary(null)}
          >
            <button
              onClick={() => handleNavigate(section.startId)}
              className={`px-6 py-3 text-sm font-bold transition-all border-t-4 border-x border-slate-300 rounded-t-lg -mb-px ${currentSection.name === section.name
                ? 'border-t-[#2490fc] bg-[#2490fc] text-white'
                : 'border-t-transparent bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
            >
              {section.name} ({section.questionCount})
            </button>

            {/* Section Summary Popup */}
            <AnimatePresence>
              {showSectionSummary?.name === section.name && (
                <motion.div
                  initial={{ opacity: 0, y: 10, x: '-50%' }}
                  animate={{ opacity: 1, y: 0, x: '-50%' }}
                  exit={{ opacity: 0, y: 10, x: '-50%' }}
                  className="absolute top-full left-[90%]  mt-4 w-56 bg-white rounded-2xl shadow-2xl border-3 border-[#2490fc] z-50 p-5 flex flex-col items-center"
                >
                  <h3 className="text-sm font-bold text-slate-700 mb-4">{section.name}</h3>
                  <div className="w-full space-y-3">
                    <SummaryRow status="not-visited" label="Not Visited" count={getSectionStats(section.name)['not-visited']} />
                    <SummaryRow status="not-answered" label="Not Answered" count={getSectionStats(section.name)['not-answered']} />
                    <SummaryRow status="answered" label="Answered" count={getSectionStats(section.name)['answered']} />
                    <SummaryRow status="marked" label="Marked for review" count={getSectionStats(section.name)['marked']} />
                    <SummaryRow status="answered-marked" label="Answered & Marked" count={getSectionStats(section.name)['answered-marked']} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </nav>

      <main className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar */}
        <AnimatePresence initial={false}>
          {isSidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="bg-white border-r border-slate-300  overflow-y-auto flex flex-col z-20"
            >
              <div className="p-4 border-b border-slate-200 bg-slate-50 ">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xs font-bold text-slate-600 flex items-center gap-2">
                    <Menu size={14} /> Question Palette
                  </h2>
                </div>

                <div className="grid grid-cols-5 gap-2 max-h-[400px] overflow-y-auto p-1 custom-scrollbar">
                  {MOCK_QUESTIONS.filter(q => q.section === currentSection.name).map((q) => (
                    <button
                      key={q.id}
                      onClick={() => handleNavigate(q.id)}
                      className={`w-10 h-10 rounded-md text-xs font-bold border transition-all flex items-center justify-center ${state.currentQuestionId === q.id
                        ? 'ring-2 ring-blue-600 ring-offset-2 scale-105'
                        : ''
                        } ${getStatusColor(state.statuses[q.id])}`}
                    >
                      {q.number}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 flex-1 bg-white custom-scrollbar">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Legends & Filter</h3>
                <div className="space-y-3">
                  <LegendItem color="bg-[#E0E0E0]" label="Not Visited" count={totalStats['not-visited']} />
                  <LegendItem color="bg-red-700" label="Not Answered" count={totalStats['not-answered']} />
                  <LegendItem color="bg-[#4CAF50]" label="Answered" count={totalStats['answered']} />
                  <LegendItem color="bg-[#FF9800]" label="Marked" count={totalStats['marked']} />
                  <LegendItem color="bg-[#00BCD4] relative after:content-[''] after:absolute after:bottom-0 after:right-0 after:w-2 after:h-2 after:bg-black after:rounded-sm" label="Answered & Marked" count={totalStats['answered-marked']} />
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Toggle Sidebar */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute top-1/2 -translate-y-1/2 z-30 transition-all duration-300"
          style={{
            left: isSidebarOpen ? 320 : 0,
          }}
        >
          {/* Triangle Shape */}
          <div
            className={`w-0 h-0 
      border-t-[25px] border-b-[25px]
      ${isSidebarOpen
                ? "border-r-[20px] border-r-[#2490fc]"
                : "border-l-[20px] border-l-[#2490fc]"
              }
      border-t-transparent border-b-transparent`}
          />

          {/* Arrow Icon */}
          {isSidebarOpen ? (
            <ChevronLeft
              size={14}
              className="absolute -left-4 top-1/2 -translate-y-1/2 text-white"
            />
          ) : (
            <ChevronRight
              size={14}
              className="absolute -right-4 top-1/2 -translate-y-1/2 text-white"
            />
          )}
        </button>

        {/* Question Area */}
        <section className="flex-1 flex flex-col bg-white overflow-hidden">
          <div className="flex-1 overflow-y-auto p-12">
            <div className="max-w-4xl mx-auto">
              <div className="mb-6">
                <span className="text-lg font-bold text-slate-800">Q{currentQuestion.number}.</span>
              </div>

              <h2 className="text-xl font-medium leading-relaxed text-slate-800 mb-0">
                {currentQuestion.text}
              </h2>

              <div className="py-4">
                {currentQuestion.options.map((option) => (
                  <label
                    key={option.id}
                    className={`w-full flex items-center gap-4 p-4 rounded cursor-pointer transition-all
      ${state.answers[state.currentQuestionId] === option.id
                        ? "border-gray-600 bg-gray-200"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                  >
                    {/* Radio Input */}
                    <input
                      type="radio"
                      name={`question-${state.currentQuestionId}`}
                      value={option.id}
                      checked={state.answers[state.currentQuestionId] === option.id}
                      onChange={() => handleOptionSelect(option.id)}
                      className="w-4 h-4 accent-blue-600 cursor-pointer"
                    />

                    {/* Option Label (A, B, C...) */}
                    <div
                      className={`flex items-center justify-center font-medium text-md
                                `}
                    >
                      ({option.id})
                    </div>

                    {/* Option Text */}
                    <span
                      className={`font-normal text-xl
       `}
                    >
                      {option.text}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="bg-[#F8F9FA] border-t border-slate-300 p-4 flex items-center gap-4 z-10">
            <button
              onClick={() => handleNavigate(state.currentQuestionId - 1)}
              disabled={state.currentQuestionId === 1}
              className="flex-1 py-2 rounded bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition-colors shadow-md disabled:opacity-50"
            >
              Previous
            </button>
            {/* <Bookmark size={16} /> */}
            <button
              onClick={handleMarkForReview}
              className="flex-1 py-2 rounded border border-gray-300 bg-gray-100 text-gray-700 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-gray-200 transition"
            >
              <Bookmark size={16} className="text-gray-600" />
              Mark
            </button>

            <button
              onClick={handleClearResponse}
              className="flex-1 py-2 rounded border border-gray-300 bg-gray-100 text-gray-700 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-gray-200 transition"
            >
              <X size={16} className="text-gray-600" />
              Clear
            </button>

            {state.currentQuestionId === MOCK_QUESTIONS.length ? (
              <button
                onClick={() => setShowFinalSummary(true)}
                className="flex-1 py-2 rounded bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition-colors shadow-md"
              >
                Submit
              </button>
            ) : (
              <button
                onClick={handleSaveNext}
                className="flex-1 py-2 rounded bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition-colors shadow-md"
              >
                Next
              </button>
            )}
          </footer>
        </section>
        <button
          onClick={() => setShowFinalSummary(true)}
          className="fixed right-0 top-1/2 -translate-y-1/2 z-50 group"
        >
          <motion.div
            whileHover={{ x: -3 }}
            className="bg-[#1e88e5] text-white px-2 py-4 rounded-l-full shadow-lg flex items-center justify-center"
          >
            <ChevronLeft size={20} />
          </motion.div>
          <div className="absolute right-10 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
            View Summary
          </div>
        </button>
      </main>

      {/* Final Summary Modal */}
      <AnimatePresence>
        {showFinalSummary && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowFinalSummary(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden"
            >
              <div className="bg-[#E9ECEF] p-4 border-b border-slate-300 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-700">Summary Report</h2>
                <button onClick={() => setShowFinalSummary(false)} className="text-slate-500 hover:text-slate-800">
                  <X size={24} />
                </button>
              </div>

              <div className="p-8 space-y-4">
                {SECTIONS.map((section) => {
                  const stats = getSectionStats(section.name);
                  const attempted = stats.answered + stats['answered-marked'];
                  return (
                    <div key={section.name} className="flex items-center justify-between p-4 bg-[#F1F3F5] rounded-lg border border-slate-200">
                      <div className="flex items-center gap-4">
                        <span className="w-40 px-4 py-1 bg-[#4A7C44] text-white text-sm font-bold rounded-full text-center">
                          {section.name}
                        </span>
                        <p className="text-slate-700 font-medium">
                          You have attempted <span className="px-2 py-0.5 bg-[#4A7C44] text-white rounded mx-1">{attempted}</span> of <span className="px-2 py-0.5 bg-[#4A7C44] text-white rounded mx-1">{section.questionCount}</span> questions
                        </p>
                      </div>
                      <button className="flex items-center gap-2 text-blue-600 font-bold text-sm hover:underline">
                        Expand <ChevronDown size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-4">
                <button
                  onClick={() => setShowFinalSummary(false)}
                  className="px-8 py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LegendItem({ color, label, count }: { color: string, label: string, count: number }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded border flex items-center justify-center text-xs font-bold ${color}`}>
          {count}
        </div>
        <span className="text-xs font-bold text-slate-600">{label}</span>
      </div>
    </div>
  );
}

function SummaryRow({ status, label, count }: { status: QuestionStatus, label: string, count: number }) {
  const getStatusStyle = (status: QuestionStatus) => {
    switch (status) {
      case 'answered': return 'bg-[#4CAF50] text-white rounded-t-lg rounded-b-sm';
      case 'not-answered': return 'bg-[#F44336] text-white rounded-full';
      case 'marked': return 'bg-[#FF9800] text-white rounded-b-xl rounded-t-sm';
      case 'answered-marked': return 'bg-[#00BCD4] text-white rounded-full relative';
      case 'not-visited': return 'bg-[#E0E0E0] text-slate-700 rounded-md border border-slate-300';
      default: return 'bg-[#E0E0E0] text-slate-700 rounded-md';
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className={`w-12 h-9 flex items-center justify-center text-sm font-bold shadow-md ${getStatusStyle(status)}`}>
        {count}
        {status === 'answered-marked' && (
          <div className="absolute top-0 right-1 w-2 h-3 bg-black rounded-b-sm" />
        )}
      </div>
      <span className="text-[13px] font-bold text-slate-600 whitespace-nowrap">{label}</span>
    </div>
  );
}  